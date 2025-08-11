# use-matomo

A typed framework agnostic wrapper for Matomo js including SPA tracking.

## Installation

```bash
npm install @certible/use-matomo
```

## Usage

```javascript
import { initMatomo } from '@certible/use-matomo';

const matomo = initMatomo({
  host: 'https://your-matomo-instance.com',
  siteId: 1,
  // trackRouter: true, automatically tracks SPA page changes via history tracking
});

// Manually track router changes
// router.afterEach((to, from) => {
//   matomo.trackPageView(to.path, opts);
// });

// Track an event
matomo.trackEvent('Category', 'Action', 'Name', 1);
```

## Configuration Options

The `initMatomo` function accepts a configuration object with the following options:

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `host` | `string` | The URL of your Matomo instance (e.g., `https://your-matomo-instance.com`) |
| `siteId` | `number \| string` | The site ID in your Matomo instance |

### Optional Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trackerFileName` | `string` | `'matomo'` | The filename of the tracker script and endpoint |
| `trackerUrl` | `string` | `''` | Custom tracker endpoint URL. If empty, uses `{host}/{trackerFileName}.php` |
| `trackerScriptUrl` | `string` | `''` | Custom tracker script URL. If empty, uses `{host}/{trackerFileName}.js` |
| `trackerScriptDisable` | `boolean` | `false` | Disable automatic loading of the tracker script (useful if already loaded) |
| `enableLinkTracking` | `boolean` | `true` | Enable automatic tracking of outbound links and downloads |
| `requireConsent` | `boolean` | `false` | Require user consent before tracking (GDPR compliance) |
| `userId` | `string` | `''` | Set a user ID for tracking across sessions |
| `disableCookies` | `boolean` | `false` | `window._paq.push(['disableCookies'])` |
| `requireCookieConsent` | `boolean` | `false` | `window._paq.push(['requireCookieConsent'])` |
| `enableHeartBeatTimer` | `boolean` | `false` | `window._paq.push(['enableHeartBeatTimer', options.heartBeatTimerInterval])` |
| `heartBeatTimerInterval` | `number` | `15` | Heartbeat timer interval in seconds |
| `cookieDomain` | `string` | `''` | Set the cookie domain for cross-subdomain tracking, `window._paq.push(['setCookieDomain', options.cookieDomain])` |
| `domains` | `string[]` | `[]` | List of domains to track as internal (for cross-domain tracking), `window._paq.push(['setDomains', options.domains])` |
| `crossOrigin` | `'anonymous' \| 'use-credentials'` | `undefined` | Cross-origin attribute for the tracker script |
| `preInitActions` | `any[]` | `[]` | Array of Matomo commands to execute before initialization |
| `trackRouter` | `boolean` | `false` | Automatically track SPA page changes via history API monitoring |

### Example with All Options

```javascript
const matomo = initMatomo({
  host: 'https://analytics.example.com',
  siteId: 1,
  trackerFileName: 'piwik', // For older Matomo instances
  enableLinkTracking: true,
  requireConsent: true, // GDPR compliance
  disableCookies: false,
  enableHeartBeatTimer: true,
  heartBeatTimerInterval: 30,
  cookieDomain: '.example.com',
  domains: ['*.example.com', 'subdomain.example.com'],
  trackRouter: true, // Automatic SPA tracking
  preInitActions: [
    ['setCustomDimension', 1, 'Premium User']
  ]
});
```

## License

This project is licensed under the MIT License.
