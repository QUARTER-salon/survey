# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Customer satisfaction survey web application. Single-page application with multi-language support (Japanese, English, Chinese) that collects feedback and stores it securely.

## Development Commands
```bash
# Start local development server (choose one):
http-server -p 8000
# OR use VS Code Live Server extension

# Deploy to production:
# Simply merge to main branch - GitHub Pages auto-deploys
```

## Architecture & Key Components

### Data Flow
1. User fills survey form → Form validation (validation.js)
2. Submit button → Sends data to backend
3. Backend processes and stores data
4. Success/Error → Display feedback to user

### Core JavaScript Modules
- **main.js**: Application initialization and form submission handling
- **i18n.js**: Language detection and switching using i18next
- **validation.js**: Form validation rules, input sanitization, and error display
- **star-rating.js**: Custom star rating component implementation
- **dynamic-services.js**: Store-specific service menu display
- **navigation.js**: Smooth scroll and section highlighting
- **security-logger.js**: Security event logging and threat detection
- **session-manager.js**: Session management and duplicate submission prevention
- **utils.js**: Development/production utilities and error handling

### Configuration
- **js/config.js**: Contains backend configuration
- **locales/*/translation.json**: UI translations for ja/en/zh

### Testing & Development
For local development:
1. Create `js/config-dev.js` with mock configuration
2. Create `js/mock-api.js` to simulate responses
3. These files are gitignored and won't be committed

### Important Notes
- No build process - all files served statically
- CSS uses custom properties for theming (see styles.css)
- Mobile-first responsive design (see responsive.css)
- Form prevents double submission with button state management
- Error messages display in user's selected language

## Security Measures Implemented

### Client-Side Security
- **XSS Protection**: All user inputs are sanitized
- **Input Validation**: Length limits and pattern validation for all fields
- **Content Security Policy**: Configured in index.html meta tag
- **Secure Error Handling**: Environment-aware error messages
- **Security Logging**: Automatic detection of suspicious patterns
- **Rate Limiting**: Form submission rate limiting
- **HTTPS Enforcement**: Automatic redirect to secure connections
- **CSRF Protection**: Token-based form submission validation
- **Session Management**: Duplicate submission prevention

### Backend Security
- **Domain Restriction**: Only accepts requests from allowed domains
- **Server-Side Validation**: Validates all inputs on server
- **Rate Limiting**: IP-based request limiting
- **Security Logging**: Tracks and blocks suspicious activities

## Known Limitations
- Static hosting limitations for certain security headers
- Client-side code visibility (mitigated by server-side validation)

## Additional Documentation
- **SECURITY_FIXES.md**: Security implementation details
- **PROXY_IMPLEMENTATION.md**: Backend proxy implementation guide
- **SECURITY_TEST_GUIDE.md**: Security testing procedures