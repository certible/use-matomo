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
  siteId: 1
});

// On route change
// router.afterEach((to, from) => {
//   matomo.trackPageView(to.path);
// });

// Track an event
matomo.trackEvent('Category', 'Action', 'Name', 1);
```

## License

This project is licensed under the MIT License.
