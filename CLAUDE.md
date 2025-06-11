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

### Client-Side Security
- **XSS Protection**: All user inputs are sanitized, innerHTML usage is restricted
- **Input Sanitization**: Enhanced `sanitizeInput()` with threat detection in validation.js
- **Enhanced Input Validation**: Length limits and special character patterns for all fields (2025年1月11日実装)
- **Content Security Policy**: Configured in index.html meta tag, removed unsafe-inline for scripts (2025年1月11日強化)
- **Secure Error Handling**: Environment-aware error messages (detailed in dev, generic in prod)
- **CORS Handling**: Compatible with Google Apps Script limitations
- **Security Logging**: Automatic detection of XSS/SQL injection attempts
- **Rate Limiting**: Form submission limited to 3 attempts per minute (client-side)
- **Development Tools**: Enhanced debugging with utils.js for safer development
- **HTTPS Enforcement**: Automatic redirect from HTTP to HTTPS (2025年1月11日実装)
- **CSRF Protection**: Session-based CSRF token validation on form submission (2025年1月11日実装)
- **No Inline JavaScript**: All event handlers moved to external files (2025年1月11日実装)

### Google Apps Script Security (2025年1月11日完了)
- **Domain Restriction**: Only accepts requests from allowed domains (configured in Script Properties)
- **Server-Side Rate Limiting**: 3 requests per minute per IP address
- **Request Validation**: Validates required fields and data types on server
- **Referrer Check**: Blocks requests without proper referrer headers
- **Security Logging**: Logs suspicious activities and blocks repeat offenders
- **IP Tracking**: Records IP addresses for rate limiting and security monitoring

## Known Limitations
- Google Apps Script doesn't support CORS preflight requests (must use text/plain)
- GitHub Pages can't set HTTP response headers (only CSP via meta tag works)
- Google Apps Script URL is exposed in client-side code (but protected by server-side security)

## Google Apps Script Configuration
To enable server-side security, configure these Script Properties in your Google Apps Script:
- `ALLOWED_DOMAINS`: Comma-separated list of allowed domains (e.g., "yourdomain.com,localhost:8000")
- `RATE_LIMIT_MINUTES`: Rate limit window in minutes (default: 1)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window (default: 3)

For additional URL protection, implement a server-side proxy as described in PROXY_IMPLEMENTATION.md

## Additional Documentation
- **SECURITY_FIXES.md**: Complete security implementation guide and status
- **PROXY_IMPLEMENTATION.md**: Guide for implementing Vercel Functions proxy
- **SECURITY_TEST_GUIDE.md**: Comprehensive security testing procedures
- **.env.example**: Template for environment variables when implementing proxy