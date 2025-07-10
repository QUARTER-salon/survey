# Customer Satisfaction Survey Web Application

A multilingual survey application built with vanilla JavaScript, designed for collecting customer feedback with modern web standards and security best practices.

## Features

- **Multilingual Support**: Japanese, English, and Chinese (Simplified)
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Star Rating System**: Interactive feedback collection
- **Real-time Validation**: Client-side form validation with user-friendly error messages
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Internationalization**: i18next
- **Deployment**: GitHub Pages
- **Backend**: Google Apps Script (configuration required)

## Project Structure

```
├── index.html
├── css/
│   ├── styles.css
│   ├── responsive.css
│   └── [other stylesheets]
├── js/
│   ├── main.js
│   ├── i18n.js
│   ├── validation.js
│   └── [other modules]
├── locales/
│   ├── ja/translation.json
│   ├── en/translation.json
│   └── zh/translation.json
└── images/
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server for development

### Development Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd survey
```

2. Start a local development server:
```bash
# Using http-server
npm install -g http-server
http-server -p 8000

# Or use VS Code Live Server extension
```

3. Open `http://localhost:8000` in your browser

### Configuration

1. **Backend Setup**: 
   - Set up Google Apps Script for form submission handling
   - Update the webhook URL in your configuration

2. **Environment Variables**:
   - Create `js/config-dev.js` for local development (gitignored)
   - Use mock API for testing without backend access

## Security Features

- **Input Sanitization**: All user inputs are validated and sanitized
- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **HTTPS Enforcement**: Automatic redirect to secure connections
- **Rate Limiting**: Prevents spam and abuse
- **Session Management**: Duplicate submission prevention

For detailed security implementation, refer to the internal documentation.

## Deployment

The application is configured for GitHub Pages deployment:

1. Push changes to the `main` branch
2. GitHub Pages automatically builds and deploys
3. Access the live site at your configured domain

## Development Guidelines

- Follow existing code conventions and patterns
- Test across different browsers and devices
- Ensure all text is internationalized
- Maintain accessibility standards
- Run security checks before deployment

## Contributing

1. Create a feature branch: `feature/your-feature-name`
2. Make your changes following the code style guide
3. Test thoroughly including edge cases
4. Submit a pull request with clear description

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions about implementation, please contact the development team.

---

© 2025 - All Rights Reserved