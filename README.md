# Universal Translator Web Application

A modern, fully functional language translator web application built with the Google Translate API. Features a beautiful, responsive design with real-time translation capabilities.

## Features

- 🌍 **100+ Languages**: Support for over 100 languages worldwide
- ⚡ **Instant Translation**: Real-time translation with Google's powerful AI
- 🔍 **Auto Detection**: Automatically detect source language
- 🔄 **Language Swap**: Easy language swapping with one click
- 📋 **Copy & Paste**: Copy translations to clipboard
- 🔊 **Text-to-Speech**: Listen to translations
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open Your Browser**
   Navigate to `http://localhost:3000`

## Usage

### Basic Translation
1. Enter text in the left textarea
2. Select source language (or use "Detect Language")
3. Select target language
4. Click "Translate" or press Ctrl+Enter

### Advanced Features
- **Auto-translation**: Translation starts automatically after 1 second of typing
- **Language Swap**: Click the swap button to reverse languages
- **Copy Text**: Use copy buttons to copy input or output text
- **Text-to-Speech**: Click the speaker icon to hear the translation
- **Character Count**: Real-time character count with visual indicators

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Translate text
- `Escape`: Clear all text

## API Endpoints

### GET /api/languages
Returns all supported languages.

**Response:**
```json
{
  "auto": "Automatic",
  "en": "English",
  "es": "Spanish",
  ...
}
```

### POST /api/translate
Translates text from one language to another.

**Request Body:**
```json
{
  "text": "Hello, world!",
  "from": "en",
  "to": "es"
}
```

**Response:**
```json
{
  "text": "¡Hola, mundo!",
  "from": {
    "language": {
      "didYouMean": false,
      "iso": "en"
    },
    "text": {
      "autoCorrected": false,
      "value": "",
      "didYouMean": false
    }
  },
  "raw": ""
}
```

## Project Structure

```
├── server.js              # Express server
├── index.js               # Google Translate API wrapper
├── languages.js           # Language definitions
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── index.html         # Main HTML page
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript application
└── README.md              # This file
```

## Technologies Used

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Google Translate API**: Translation service
- **CORS**: Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript**: No frameworks, pure JS
- **CSS3**: Modern styling with gradients and animations
- **HTML5**: Semantic markup
- **Font Awesome**: Icons
- **Google Fonts**: Typography

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Google Translate API for providing the translation service
- Font Awesome for the beautiful icons
- Google Fonts for the Inter font family

---

**Note**: This application uses the unofficial Google Translate API. For production use, consider using the official Google Cloud Translation API.