var querystring = require('querystring');
var got = require('got');
var safeEval = require('safe-eval');
var token = require('google-translate-token');
var languages = require('./languages');

function translate(text, opts) {
    opts = opts || {};

    // Validate languages
    var e;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(lang)) {
            e = new Error();
            e.code = 400;
            e.message = 'The language \'' + lang + '\' is not supported';
        }
    });
    if (e) {
        return Promise.reject(e);
    }

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';

    opts.from = languages.getCode(opts.from);
    opts.to = languages.getCode(opts.to);

    // Try multiple methods for better reliability
    return translateWithMethod1(text, opts)
        .catch(function(err) {
            console.log('Method 1 failed, trying method 2:', err.message);
            return translateWithMethod2(text, opts);
        })
        .catch(function(err) {
            console.log('Method 2 failed, trying method 3:', err.message);
            return translateWithMethod3(text, opts);
        });
}

function translateWithMethod1(text, opts) {
    return token.get(text).then(function (token) {
        var url = 'https://translate.googleapis.com/translate_a/single';
        var data = {
            client: 'gtx',
            sl: opts.from,
            tl: opts.to,
            hl: opts.to,
            dt: ['t', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
            ie: 'UTF-8',
            oe: 'UTF-8',
            otf: 1,
            ssel: 0,
            tsel: 0,
            kc: 7,
            q: text
        };
        data[token.name] = token.value;

        var requestUrl = url + '?' + querystring.stringify(data);
        
        return got(requestUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
    }).then(function (res) {
        return parseResponse(res.body, opts);
    });
}

function translateWithMethod2(text, opts) {
    var url = 'https://translate.google.com/translate_a/single';
    var data = {
        client: 'webapp',
        sl: opts.from,
        tl: opts.to,
        hl: opts.to,
        dt: ['t', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
        ie: 'UTF-8',
        oe: 'UTF-8',
        otf: 1,
        ssel: 0,
        tsel: 0,
        kc: 7,
        q: text
    };

    var requestUrl = url + '?' + querystring.stringify(data);
    
    return got(requestUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://translate.google.com/'
        },
        timeout: 10000
    }).then(function (res) {
        return parseResponse(res.body, opts);
    });
}

function translateWithMethod3(text, opts) {
    // Fallback method using a different endpoint
    var url = 'https://clients5.google.com/translate_a/single';
    var data = {
        client: 'dict-chrome-ex',
        sl: opts.from,
        tl: opts.to,
        hl: opts.to,
        dt: ['t', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
        ie: 'UTF-8',
        oe: 'UTF-8',
        otf: 1,
        ssel: 0,
        tsel: 0,
        kc: 7,
        q: text
    };

    var requestUrl = url + '?' + querystring.stringify(data);
    
    return got(requestUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
    }).then(function (res) {
        return parseResponse(res.body, opts);
    });
}

function parseResponse(body, opts) {
    var result = {
        text: '',
        from: {
            language: {
                didYouMean: false,
                iso: ''
            },
            text: {
                autoCorrected: false,
                value: '',
                didYouMean: false
            }
        },
        raw: ''
    };

    if (opts.raw) {
        result.raw = body;
    }

    try {
        var parsedBody = safeEval(body);
        
        if (!parsedBody || !parsedBody[0]) {
            throw new Error('Invalid response format');
        }

        // Extract translated text
        parsedBody[0].forEach(function (obj) {
            if (obj && obj[0]) {
                result.text += obj[0];
            }
        });

        // Extract language information
        if (parsedBody[2] && parsedBody[8] && parsedBody[8][0] && parsedBody[8][0][0]) {
            if (parsedBody[2] === parsedBody[8][0][0]) {
                result.from.language.iso = parsedBody[2];
            } else {
                result.from.language.didYouMean = true;
                result.from.language.iso = parsedBody[8][0][0];
            }
        } else if (parsedBody[2]) {
            result.from.language.iso = parsedBody[2];
        }

        // Extract suggestions
        if (parsedBody[7] && parsedBody[7][0]) {
            var str = parsedBody[7][0];
            str = str.replace(/<b><i>/g, '[');
            str = str.replace(/<\/i><\/b>/g, ']');
            result.from.text.value = str;

            if (parsedBody[7][5] === true) {
                result.from.text.autoCorrected = true;
            } else {
                result.from.text.didYouMean = true;
            }
        }

        return result;
    } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse translation response');
    }
}

module.exports = translate;
module.exports.languages = languages;
