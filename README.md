# use-matomo

A typed framework agnostic wrapper for Matomo js including SPA tracking.

## Installation

```bash
npm install @certible/use-matomo
```

## Usage

```javascript
import { init } from '@certible/use-matomo';

const matomo = init({
  host: 'https://your-matomo-instance.com',
  siteId: 1
});

// On route change
// router.afterEach((to, from) => {
//   matomo.trackPageView(to.path);
// });

// Track an event
matomo.trackEvent('Category', 'Action', 'Name', 1);
```
