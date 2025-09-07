class TranslatorApp {
    constructor() {
        this.languages = {};
        this.fromLanguage = 'auto';
        this.toLanguage = 'en';
        this.isTranslating = false;
        this.voices = [];
        this.languageVoices = {};
        
        this.init();
    }

    async init() {
        await this.loadLanguages();
        this.loadVoices();
        this.setupEventListeners();
        this.populateLanguageSelects();
        this.showToast('Welcome to Universal Translator!', 'success');
    }

    async loadLanguages() {
        try {
            const response = await fetch('/api/languages');
            this.languages = await response.json();
        } catch (error) {
            console.error('Failed to load languages:', error);
            this.showToast('Failed to load languages', 'error');
        }
    }

    loadVoices() {
        if ('speechSynthesis' in window) {
            // Load voices when they become available
            const loadVoicesList = () => {
                this.voices = speechSynthesis.getVoices();
                this.mapLanguagesToVoices();
            };

            // Load voices immediately if available
            loadVoicesList();

            // Load voices when they change (some browsers load them asynchronously)
            speechSynthesis.onvoiceschanged = loadVoicesList;
        }
    }

    mapLanguagesToVoices() {
        // Comprehensive mapping for ALL 106 supported languages
        const languageVoiceMap = {
            // Major Languages
            'en': ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN', 'en-ZA'],
            'es': ['es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-PE', 'es-CL', 'es-VE'],
            'fr': ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH', 'fr-LU'],
            'de': ['de-DE', 'de-AT', 'de-CH', 'de-LU'],
            'it': ['it-IT', 'it-CH'],
            'pt': ['pt-BR', 'pt-PT'],
            'ru': ['ru-RU', 'ru-BY', 'ru-KZ'],
            'ja': ['ja-JP'],
            'ko': ['ko-KR'],
            'zh-cn': ['zh-CN', 'zh-Hans-CN'],
            'zh-tw': ['zh-TW', 'zh-Hant-TW'],
            'ar': ['ar-SA', 'ar-EG', 'ar-AE', 'ar-JO', 'ar-LB', 'ar-SY', 'ar-IQ'],
            'hi': ['hi-IN'],
            'th': ['th-TH'],
            'vi': ['vi-VN'],
            'pl': ['pl-PL'],
            'nl': ['nl-NL', 'nl-BE'],
            'sv': ['sv-SE'],
            'da': ['da-DK'],
            'no': ['no-NO', 'nb-NO', 'nn-NO'],
            'fi': ['fi-FI'],
            'tr': ['tr-TR'],
            'el': ['el-GR'],
            'he': ['he-IL'],
            'cs': ['cs-CZ'],
            'sk': ['sk-SK'],
            'hu': ['hu-HU'],
            'ro': ['ro-RO'],
            'bg': ['bg-BG'],
            'hr': ['hr-HR'],
            'sl': ['sl-SI'],
            'et': ['et-EE'],
            'lv': ['lv-LV'],
            'lt': ['lt-LT'],
            'uk': ['uk-UA'],
            
            // European Languages
            'ca': ['ca-ES', 'ca-AD'],
            'eu': ['eu-ES'],
            'gl': ['gl-ES'],
            'is': ['is-IS'],
            'ga': ['ga-IE'],
            'cy': ['cy-GB'],
            'mt': ['mt-MT'],
            'sq': ['sq-AL'],
            'mk': ['mk-MK'],
            'sr': ['sr-RS', 'sr-BA', 'sr-ME'],
            'bs': ['bs-BA'],
            'me': ['me-ME'],
            
            // Asian Languages
            'bn': ['bn-BD', 'bn-IN'],
            'gu': ['gu-IN'],
            'kn': ['kn-IN'],
            'ml': ['ml-IN'],
            'mr': ['mr-IN', 'mr-MH'], // Marathi with Maharashtra variant
            'ne': ['ne-NP'],
            'pa': ['pa-IN', 'pa-PK'], // Punjabi variants
            'si': ['si-LK'],
            'ta': ['ta-IN', 'ta-LK'],
            'te': ['te-IN'],
            'ur': ['ur-PK', 'ur-IN'],
            'my': ['my-MM'],
            'km': ['km-KH'],
            'lo': ['lo-LA'],
            'ka': ['ka-GE'],
            'am': ['am-ET'],
            'sw': ['sw-KE', 'sw-TZ'],
            'zu': ['zu-ZA'],
            'xh': ['xh-ZA'],
            'af': ['af-ZA'],
            'st': ['st-ZA'],
            'sn': ['sn-ZW'],
            'yo': ['yo-NG'],
            'ig': ['ig-NG'],
            'ha': ['ha-NG'],
            'so': ['so-SO'],
            'om': ['om-ET'],
            'ti': ['ti-ET'],
            'mg': ['mg-MG'],
            'ny': ['ny-MW'],
            'sm': ['sm-WS'],
            'mi': ['mi-NZ'],
            'haw': ['haw-US'],
            
            // Middle Eastern & Central Asian
            'fa': ['fa-IR'],
            'ps': ['ps-AF'],
            'uz': ['uz-UZ'],
            'kk': ['kk-KZ'],
            'ky': ['ky-KG'],
            'tg': ['tg-TJ'],
            'mn': ['mn-MN'],
            'ku': ['ku-TR'],
            
            // Other Languages
            'eo': ['eo-XX'], // Esperanto - no specific locale
            'la': ['la-XX'], // Latin - no specific locale
            'co': ['co-FR'], // Corsican
            'fy': ['fy-NL'], // Frisian
            'ht': ['ht-HT'], // Haitian Creole
            'hmn': ['hmn-US'], // Hmong
            'jw': ['jw-ID'], // Javanese
            'su': ['su-ID'], // Sundanese
            'tl': ['tl-PH'], // Filipino/Tagalog
            'ceb': ['ceb-PH'], // Cebuano
            'lb': ['lb-LU'], // Luxembourgish
            'gd': ['gd-GB'], // Scots Gaelic
            'yi': ['yi-XX'], // Yiddish
            'sd': ['sd-PK'], // Sindhi
            'az': ['az-AZ'], // Azerbaijani
            'hy': ['hy-AM'], // Armenian
            'be': ['be-BY'], // Belarusian
            'id': ['id-ID'], // Indonesian
            'ms': ['ms-MY'], // Malay
            'su': ['su-ID'], // Sundanese
            'jw': ['jw-ID'] // Javanese
        };

        this.languageVoices = {};

        // Find best voice for each language with enhanced fallback system
        Object.keys(languageVoiceMap).forEach(langCode => {
            const preferredVoices = languageVoiceMap[langCode];
            let bestVoice = null;

            // Strategy 1: Try to find exact match with default voice
            for (const voiceCode of preferredVoices) {
                bestVoice = this.voices.find(voice => 
                    voice.lang === voiceCode && voice.default
                );
                if (bestVoice) break;
            }

            // Strategy 2: Try any voice for the exact language codes
            if (!bestVoice) {
                for (const voiceCode of preferredVoices) {
                    bestVoice = this.voices.find(voice => voice.lang === voiceCode);
                    if (bestVoice) break;
                }
            }

            // Strategy 3: Try voices with similar language prefix
            if (!bestVoice) {
                const langPrefix = langCode.split('-')[0];
                bestVoice = this.voices.find(voice => 
                    voice.lang.startsWith(langPrefix + '-')
                );
            }

            // Strategy 4: Try voices with just the language code
            if (!bestVoice) {
                const langPrefix = langCode.split('-')[0];
                bestVoice = this.voices.find(voice => 
                    voice.lang === langPrefix
                );
            }

            // Strategy 5: For languages without specific voices, try to find similar languages
            if (!bestVoice) {
                const fallbackMap = {
                    // Indian Languages - prioritize Hindi for Devanagari scripts
                    'ma': 'pa', // Punjabi fallback
                    'mr': 'hi', // Marathi to Hindi (same script family)
                    'bn': 'hi', // Bengali to Hindi
                    'gu': 'hi', // Gujarati to Hindi
                    'kn': 'hi', // Kannada to Hindi
                    'ml': 'hi', // Malayalam to Hindi
                    'ne': 'hi', // Nepali to Hindi
                    'pa': 'hi', // Punjabi to Hindi
                    'si': 'hi', // Sinhala to Hindi
                    'ta': 'hi', // Tamil to Hindi
                    'te': 'hi', // Telugu to Hindi
                    'ur': 'hi', // Urdu to Hindi
                    'sd': 'ur', // Sindhi to Urdu
                    
                    // Other Languages
                    'iw': 'he', // Hebrew variant
                    'tl': 'fil', // Filipino variant
                    'ceb': 'tl', // Cebuano to Filipino
                    'ny': 'ny', // Chichewa
                    'co': 'it', // Corsican to Italian
                    'fy': 'nl', // Frisian to Dutch
                    'ht': 'fr', // Haitian Creole to French
                    'hmn': 'en', // Hmong to English
                    'jw': 'id', // Javanese to Indonesian
                    'su': 'id', // Sundanese to Indonesian
                    'lb': 'de', // Luxembourgish to German
                    'gd': 'en', // Scots Gaelic to English
                    'yi': 'de', // Yiddish to German
                    'az': 'tr', // Azerbaijani to Turkish
                    'hy': 'ru', // Armenian to Russian
                    'be': 'ru', // Belarusian to Russian
                    'eo': 'en', // Esperanto to English
                    'la': 'it', // Latin to Italian
                    'haw': 'en', // Hawaiian to English
                    'mi': 'en', // Maori to English
                    'sm': 'en', // Samoan to English
                    'st': 'en', // Sesotho to English
                    'sn': 'en', // Shona to English
                    'so': 'ar', // Somali to Arabic
                    'sw': 'en', // Swahili to English
                    'tg': 'ru', // Tajik to Russian
                    'uk': 'ru', // Ukrainian to Russian
                    'uz': 'ru', // Uzbek to Russian
                    'cy': 'en', // Welsh to English
                    'xh': 'en', // Xhosa to English
                    'yo': 'en', // Yoruba to English
                    'zu': 'en'  // Zulu to English
                };
                
                const fallbackLang = fallbackMap[langCode];
                if (fallbackLang && this.languageVoices[fallbackLang]) {
                    bestVoice = this.languageVoices[fallbackLang];
                }
            }

            // Strategy 6: Last resort - use English voice
            if (!bestVoice) {
                bestVoice = this.voices.find(voice => 
                    voice.lang.startsWith('en-') && voice.default
                ) || this.voices.find(voice => voice.lang.startsWith('en-'));
            }

            if (bestVoice) {
                this.languageVoices[langCode] = bestVoice;
            }
        });

        console.log('Loaded voices for languages:', Object.keys(this.languageVoices));
    }


    calculateDetectionConfidence(result) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence if no language correction was needed
        if (!result.from.language.didYouMean) {
            confidence += 0.3;
        }
        
        // Increase confidence if no text correction was needed
        if (!result.from.text.didYouMean && !result.from.text.autoCorrected) {
            confidence += 0.2;
        }
        
        // Increase confidence if we have a suggestion (shows Google is confident)
        if (result.from.text.value && result.from.text.value.length > 0) {
            confidence += 0.1;
        }
        
        // Special boost for Indian languages (better detection)
        const indianLanguages = ['hi', 'mr', 'bn', 'gu', 'kn', 'ml', 'ta', 'te', 'pa', 'ur'];
        if (indianLanguages.includes(result.from.language.iso)) {
            confidence += 0.1;
        }
        
        // Cap confidence at 1.0
        return Math.min(confidence, 1.0);
    }

    populateLanguageSelects() {
        const fromSelect = document.getElementById('fromLanguage');
        const toSelect = document.getElementById('toLanguage');
        
        // Clear existing options
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        // Add languages to both selects
        Object.entries(this.languages).forEach(([code, name]) => {
            if (code === 'auto') {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                fromSelect.appendChild(option);
            } else {
                // Add to both selects
                const fromOption = document.createElement('option');
                fromOption.value = code;
                fromOption.textContent = name;
                fromSelect.appendChild(fromOption);
                
                const toOption = document.createElement('option');
                toOption.value = code;
                toOption.textContent = name;
                toSelect.appendChild(toOption);
            }
        });
        
        // Set default values
        fromSelect.value = this.fromLanguage;
        toSelect.value = this.toLanguage;
    }

    setupEventListeners() {
        // Language selection
        document.getElementById('fromLanguage').addEventListener('change', (e) => {
            this.fromLanguage = e.target.value;
        });
        
        document.getElementById('toLanguage').addEventListener('change', (e) => {
            this.toLanguage = e.target.value;
        });
        
        // Swap languages
        document.getElementById('swapLanguages').addEventListener('click', () => {
            this.swapLanguages();
        });
        
        // Translate button
        document.getElementById('translateBtn').addEventListener('click', () => {
            this.translate();
        });
        
        // Enter key translation
        document.getElementById('inputText').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.translate();
            }
        });
        
        // Character count
        document.getElementById('inputText').addEventListener('input', (e) => {
            this.updateCharCount(e.target.value.length);
        });
        
        // Clear input
        document.getElementById('clearInput').addEventListener('click', () => {
            this.clearInput();
        });
        
        // Copy buttons
        document.getElementById('copyInput').addEventListener('click', () => {
            this.copyText('inputText');
        });
        
        document.getElementById('copyOutput').addEventListener('click', () => {
            this.copyText('outputText');
        });
        
        // Speak output
        document.getElementById('speakOutput').addEventListener('click', () => {
            this.speakText();
        });
        
        // Speak input text
        document.getElementById('speakInput').addEventListener('click', () => {
            this.speakInputText();
        });
        
        // Auto-translate on input (debounced)
        let translateTimeout;
        document.getElementById('inputText').addEventListener('input', (e) => {
            clearTimeout(translateTimeout);
            if (e.target.value.trim()) {
                translateTimeout = setTimeout(() => {
                    if (e.target.value.length > 3) {
                        this.translate();
                    }
                }, 1000);
            }
        });
    }

    async translate() {
        const inputText = document.getElementById('inputText').value.trim();
        const outputTextarea = document.getElementById('outputText');
        const translateBtn = document.getElementById('translateBtn');
        const detectedLanguageDiv = document.getElementById('detectedLanguage');
        
        if (!inputText) {
            this.showToast('Please enter text to translate', 'error');
            return;
        }
        
        if (this.isTranslating) return;
        
        this.isTranslating = true;
        this.showLoading(true);
        translateBtn.disabled = true;
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Translating...</span>';
        
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputText,
                    from: this.fromLanguage,
                    to: this.toLanguage
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Display translation
            outputTextarea.value = result.text;
            outputTextarea.classList.add('fade-in');
            
            // Enhanced language detection display
            if (result.from && result.from.language && result.from.language.iso) {
                const detectedLangCode = result.from.language.iso;
                const detectedLangName = this.languages[detectedLangCode] || detectedLangCode;
                const confidence = this.calculateDetectionConfidence(result);
                
                // Show detected language with confidence
                let confidenceText = '';
                if (confidence > 0.8) {
                    confidenceText = ' (High confidence)';
                } else if (confidence > 0.6) {
                    confidenceText = ' (Medium confidence)';
                } else {
                    confidenceText = ' (Low confidence)';
                }
                
                detectedLanguageDiv.innerHTML = `
                    <strong>Detected:</strong> ${detectedLangName}${confidenceText}
                    ${result.from.language.didYouMean ? '<br><small>Language corrected</small>' : ''}
                `;
                detectedLanguageDiv.style.display = 'block';
                
                // Update from language if auto-detection was used
                if (this.fromLanguage === 'auto') {
                    document.getElementById('fromLanguage').value = detectedLangCode;
                    this.fromLanguage = detectedLangCode;
                }
                
                // Show detection confidence in console
                console.log(`Language detection: ${detectedLangName} (${detectedLangCode}) - Confidence: ${(confidence * 100).toFixed(1)}%`);
            }
            
            // Show suggestions if available
            if (result.from && result.from.text && result.from.text.value) {
                this.showToast(`Suggestion: ${result.from.text.value}`, 'success');
            }
            
            this.showToast('Translation completed!', 'success');
            
        } catch (error) {
            console.error('Translation error:', error);
            outputTextarea.value = '';
            detectedLanguageDiv.style.display = 'none';
            this.showToast('Translation failed. Please try again.', 'error');
        } finally {
            this.isTranslating = false;
            this.showLoading(false);
            translateBtn.disabled = false;
            translateBtn.innerHTML = '<i class="fas fa-language"></i><span>Translate</span>';
        }
    }

    swapLanguages() {
        const fromSelect = document.getElementById('fromLanguage');
        const toSelect = document.getElementById('toLanguage');
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        
        // Don't swap if from language is auto
        if (fromSelect.value === 'auto') {
            this.showToast('Cannot swap with auto-detection', 'error');
            return;
        }
        
        // Swap language values
        const tempFrom = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = tempFrom;
        
        this.fromLanguage = fromSelect.value;
        this.toLanguage = toSelect.value;
        
        // Swap text content
        const tempText = inputText.value;
        inputText.value = outputText.value;
        outputText.value = tempText;
        
        // Update character count
        this.updateCharCount(inputText.value.length);
        
        // Hide detected language
        document.getElementById('detectedLanguage').style.display = 'none';
        
        this.showToast('Languages swapped!', 'success');
    }

    clearInput() {
        document.getElementById('inputText').value = '';
        document.getElementById('outputText').value = '';
        document.getElementById('detectedLanguage').style.display = 'none';
        this.updateCharCount(0);
        document.getElementById('inputText').focus();
    }

    async copyText(textareaId) {
        const textarea = document.getElementById(textareaId);
        const text = textarea.value;
        
        if (!text) {
            this.showToast('Nothing to copy', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Text copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            textarea.select();
            document.execCommand('copy');
            this.showToast('Text copied to clipboard!', 'success');
        }
    }

    speakText() {
        const outputText = document.getElementById('outputText').value;
        
        if (!outputText) {
            this.showToast('Nothing to speak', 'error');
            return;
        }
        
        if ('speechSynthesis' in window) {
            // Stop any current speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(outputText);
            
            // Set language-specific voice
            const voice = this.languageVoices[this.toLanguage];
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang;
                console.log(`Using voice: ${voice.name} for language: ${this.toLanguage}`);
            } else {
                utterance.lang = this.toLanguage;
                console.log(`No specific voice found for ${this.toLanguage}, using default`);
                this.showToast(`No specific voice for ${this.languages[this.toLanguage] || this.toLanguage}, using default`, 'error');
            }
            
            // Configure speech parameters
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Add event listeners
            utterance.onstart = () => {
                this.showToast(`Speaking in ${this.languages[this.toLanguage] || this.toLanguage}...`, 'success');
                document.getElementById('speakOutput').innerHTML = '<i class="fas fa-stop"></i>';
                document.getElementById('speakOutput').title = 'Stop speaking';
            };
            
            utterance.onend = () => {
                document.getElementById('speakOutput').innerHTML = '<i class="fas fa-volume-up"></i>';
                document.getElementById('speakOutput').title = 'Speak translation';
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                this.showToast('Speech synthesis failed', 'error');
                document.getElementById('speakOutput').innerHTML = '<i class="fas fa-volume-up"></i>';
                document.getElementById('speakOutput').title = 'Speak translation';
            };
            
            speechSynthesis.speak(utterance);
        } else {
            this.showToast('Speech synthesis not supported in this browser', 'error');
        }
    }

    speakInputText() {
        const inputText = document.getElementById('inputText').value;
        
        if (!inputText) {
            this.showToast('Nothing to speak', 'error');
            return;
        }
        
        if ('speechSynthesis' in window) {
            // Stop any current speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(inputText);
            
            // Determine source language for voice selection
            let sourceLang = this.fromLanguage;
            
            // If auto-detection is used, try to detect from the detected language
            if (sourceLang === 'auto') {
                const detectedLangDiv = document.getElementById('detectedLanguage');
                if (detectedLangDiv && detectedLangDiv.textContent) {
                    // Extract language code from detected language text
                    const detectedText = detectedLangDiv.textContent;
                    const match = detectedText.match(/Detected: (.+?)(?:\s*\(|$)/);
                    if (match) {
                        // Find the language code for the detected language name
                        const detectedName = match[1].trim();
                        sourceLang = Object.keys(this.languages).find(code => 
                            this.languages[code] === detectedName
                        ) || 'en';
                        
                        console.log(`TTS Input: Detected language "${detectedName}" -> code "${sourceLang}"`);
                    }
                } else {
                    sourceLang = 'en'; // Default to English if no detection
                }
            }
            
            // Set language-specific voice
            const voice = this.languageVoices[sourceLang];
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang;
                console.log(`Using voice: ${voice.name} for input language: ${sourceLang}`);
            } else {
                utterance.lang = sourceLang;
                console.log(`No specific voice found for ${sourceLang}, using default`);
                this.showToast(`No specific voice for ${this.languages[sourceLang] || sourceLang}, using default`, 'error');
            }
            
            // Configure speech parameters
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Add event listeners
            utterance.onstart = () => {
                this.showToast(`Speaking in ${this.languages[sourceLang] || sourceLang}...`, 'success');
                document.getElementById('speakInput').innerHTML = '<i class="fas fa-stop"></i>';
                document.getElementById('speakInput').title = 'Stop speaking';
            };
            
            utterance.onend = () => {
                document.getElementById('speakInput').innerHTML = '<i class="fas fa-volume-up"></i>';
                document.getElementById('speakInput').title = 'Speak input text';
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                this.showToast('Speech synthesis failed', 'error');
                document.getElementById('speakInput').innerHTML = '<i class="fas fa-volume-up"></i>';
                document.getElementById('speakInput').title = 'Speak input text';
            };
            
            speechSynthesis.speak(utterance);
        } else {
            this.showToast('Speech synthesis not supported in this browser', 'error');
        }
    }

    updateCharCount(count) {
        document.getElementById('charCount').textContent = count;
        
        // Change color based on character count
        const charCountElement = document.getElementById('charCount');
        if (count > 4500) {
            charCountElement.style.color = '#ef4444';
        } else if (count > 4000) {
            charCountElement.style.color = '#f59e0b';
        } else {
            charCountElement.style.color = '#666';
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TranslatorApp();
});

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to translate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const app = window.translatorApp;
        if (app) app.translate();
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        const app = window.translatorApp;
        if (app) app.clearInput();
    }
});

// Service Worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
