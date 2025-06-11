# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Customer satisfaction survey web application for QUARTER beauty salon group (5 locations in Tokyo). Single-page application with multi-language support (Japanese, English, Chinese) that collects feedback and stores it in Google Sheets via Google Apps Script.

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
2. Submit button → Sends POST to Google Apps Script URL (config.js)
3. Apps Script → Writes to Google Sheets
4. Success/Error → Display feedback to user

### Core JavaScript Modules
- **main.js**: Application initialization, form submission handling
- **i18n.js**: Language detection and switching using i18next
- **validation.js**: Form validation rules, input sanitization, and error display
- **star-rating.js**: Custom star rating component implementation
- **dynamic-services.js**: Store-specific service menu display
- **navigation.js**: Smooth scroll and section highlighting
- **security-logger.js**: Security event logging and threat detection
- **utils.js**: Development/production utilities and error handling

### Configuration
- **js/config.js**: Contains Google Apps Script webhook URL and store review URLs
- **locales/*/translation.json**: UI translations for ja/en/zh

### Testing & Development
For local development without hitting the production API:
1. Create `js/config-dev.js` with mock webhook URL
2. Create `js/mock-api.js` to simulate responses
3. These files are gitignored and won't be committed

### Important Notes
- No build process - all files served statically
- CSS uses custom properties for theming (see styles.css)
- Mobile-first responsive design (see responsive.css)
- Form prevents double submission with button state management
- Error messages display in user's selected language

## Security Measures Implemented (2025年1月更新)
- **XSS Protection**: All user inputs are sanitized, innerHTML usage is restricted
- **Input Sanitization**: Enhanced `sanitizeInput()` with threat detection in validation.js
- **Content Security Policy**: Configured in index.html meta tag
- **Secure Error Handling**: Environment-aware error messages (detailed in dev, generic in prod)
- **CORS Handling**: Compatible with Google Apps Script limitations
- **Security Logging**: Automatic detection of XSS/SQL injection attempts
- **Rate Limiting**: Form submission limited to 3 attempts per minute
- **Development Tools**: Enhanced debugging with utils.js for safer development

## Known Limitations
- Google Apps Script doesn't support CORS preflight requests (must use text/plain)
- GitHub Pages can't set HTTP response headers (only CSP via meta tag works)
- Google Apps Script URL is exposed in client-side code
- For full security, implement a server-side proxy as described in PROXY_IMPLEMENTATION.md

## Additional Documentation
- **SECURITY_FIXES.md**: Complete security implementation guide and status
- **PROXY_IMPLEMENTATION.md**: Guide for implementing Vercel Functions proxy
- **SECURITY_TEST_GUIDE.md**: Comprehensive security testing procedures
- **.env.example**: Template for environment variables when implementing proxy