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

### vue.js

```javascript
import { initMatomo } from '@certible/use-matomo';
import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);
app.use(initMatomo({
  host: 'https://your-matomo-instance.com',
  siteId: 1,
  // trackRouter: true, automatically tracks SPA page changes via history tracking
}));
app.provide('matomo', matomo);
```

```javascript
// In your components, you can access Matomo like this:
import { inject } from 'vue';

const matomo = inject<MatomoTracker>('matomo');
```

#### Quasar

```javascript
// quasar boot file: src/boot/matomo.js
import { defineBoot } from '#q-app/wrappers';
import { initMatomo } from '@certible/use-matomo';


export default defineBoot(({ app }) => {
  const matomo = initMatomo({
    host: 'https://your-matomo-instance.com',
    siteId: 1,
    // trackRouter: true, automatically tracks SPA page changes via history tracking
  });

  app.provide('matomo', matomo);
});
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

## API Methods

Once initialized, the Matomo tracker returns an object with the following methods:

### `trackEvent(category, action, name?, value?)`

Tracks a custom event.

**Parameters:**

- `category` (string): The category of the event
- `action` (string): The action of the event  
- `name` (string, optional): The name of the event
- `value` (number, optional): The value of the event

**Example:**

```javascript
// Track a button click
matomo.trackEvent('Navigation', 'Click', 'Header Logo');

// Track with a value
matomo.trackEvent('Purchase', 'Complete', 'Premium Plan', 99.99);
```

### `trackPageView(url?, props?)`

Tracks a page view in a single-page application.

**Parameters:**

- `url` (string, optional): The URL of the page to track. Defaults to `window.location.href`
- `props` (object, optional): Additional properties for the page view
  - `deleteCustomVariables` (boolean): Whether to delete custom variables. Default: `true`
  - `documentTitle` (string): Custom document title. Default: `document.title`

**Example:**

```javascript
// Track current page
matomo.trackPageView();

// Track specific URL
matomo.trackPageView('/dashboard');

// Track with custom title
matomo.trackPageView('/profile', { 
  documentTitle: 'User Profile - MyApp' 
});
```

### `setUserId(userId)`

Sets or resets the user ID for tracking across sessions.

**Parameters:**

- `userId` (string | null): The user ID to set, or `null` to reset

**Example:**

```javascript
// Set user ID
matomo.setUserId('user123');

// Reset user ID
matomo.setUserId(null);
```

### `push(args)`

Pushes any instruction directly to the Matomo tracker. This allows you to use any Matomo tracking method not explicitly exposed by this wrapper.

**Parameters:**

- `args` (array): Array of arguments to pass to Matomo

**Example:**

```javascript
// Set custom dimension
matomo.push(['setCustomDimension', 1, 'Premium User']);

// Track site search
matomo.push(['trackSiteSearch', 'keyword', 'category', 5]);

// Set custom variable
matomo.push(['setCustomVariable', 1, 'UserType', 'Premium', 'visit']);
```

For a complete list of available Matomo tracking methods, see the [Matomo JavaScript Tracking Guide](https://developer.matomo.org/guides/tracking-javascript-guide).

## License

This project is licensed under the MIT License.
