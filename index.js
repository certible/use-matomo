/**
 * @typedef {object} MatomoOptions
 * @property {string} host - The URL of the Matomo instance.
 * @property {number} siteId - The ID of the site to track.
 * @property {string} [trackerFileName="matomo"] - The name of the tracker file.
 * @property {string} [trackerUrl] - The URL of the tracker endpoint (matomo.php).
 * @property {string} [trackerScriptUrl] - The URL of the tracker script (matomo.js).
 * @property {boolean} [enableLinkTracking=true] - Whether to enable link tracking.
 * @property {boolean} [requireConsent=false] - Whether to require user consent for tracking.
 * @property {string} [userId] - The user ID to track.
 * @property {boolean} [disableCookies=false] - Whether to disable cookies.
 * @property {boolean} [requireCookieConsent=false] - Whether to require user consent for cookies.
 * @property {boolean} [enableHeartBeatTimer=false] - Whether to enable the heartbeat timer.
 * @property {number} [heartBeatTimerInterval=15] - The interval for the heartbeat timer in seconds.
 * @property {string} [cookieDomain] - The domain for the cookies.
 * @property {string[]} [domains] - The domains to track.
 * @property {'anonymous' | 'use-credentials'} [crossOrigin] - The cross-origin attribute for the script tag.
 * @property {any[]} [preInitActions=[]] - Actions to push to _paq before initialization.
 * @property {boolean} [trackRouter=false] - Whether to automatically track page views on router changes.
 */

/**
 * @typedef {object} MatomoTracker
 * @property {(eventName: string, eventCategory?: string, eventAction?: string, eventValue?: number) => void} trackEvent
 * @property {(url: string) => void} trackPageView
 * @property {(args: any[]) => void} push
 */

let previousUrl;

/**
 * Loads the Matomo tracker script.
 * @param {string} trackerScript - The URL of the tracker script.
 * @param {'anonymous' | 'use-credentials'} [crossOrigin] - The cross-origin attribute for the script tag.
 * @returns {Promise<void>}
 */
function loadScript(trackerScript, crossOrigin) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = trackerScript;

    if (crossOrigin && ['anonymous', 'use-credentials'].includes(crossOrigin)) {
      script.crossOrigin = crossOrigin;
    }

    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(script);

    script.onload = resolve;
    script.onerror = reject;
  });
}

/**
 * Initializes the Matomo tracker.
 * @param {MatomoOptions} setupOptions - The options for the Matomo tracker.
 * @returns {MatomoTracker}
 */
export function initMatomo(setupOptions) {
  if( typeof window === 'undefined') {
    throw new Error('Matomo tracker can only be initialized in a browser environment.');
  }
  if(!setupOptions || !setupOptions.host || !setupOptions.siteId) {
    throw new Error('Matomo tracker requires a host and siteId to be set.');
  }
  if (window._paq && window._paq.length > 0) {
    console.warn('Matomo tracker is already initialized. Skipping initialization.');
    return undefined;
  }

  previousUrl = window.location.href;
  const options = {
    trackerFileName: 'matomo',
    enableLinkTracking: true,
    preInitActions: [],
    trackRouter: false,
    ...setupOptions
  };

  const { host, siteId, trackerFileName, trackerUrl, trackerScriptUrl } = options;
  const scriptUrl = trackerScriptUrl || `${host}/${trackerFileName}.js`;
  const endpointUrl = trackerUrl || `${host}/${trackerFileName}.php`;

  window._paq = window._paq || [];

  options.preInitActions.forEach((action) => window._paq.push(action));

  window._paq.push(['setTrackerUrl', endpointUrl]);
  window._paq.push(['setSiteId', siteId]);

  if (options.requireConsent) {
    window._paq.push(['requireConsent']);
  }

  if (options.userId) {
    window._paq.push(['setUserId', options.userId]);
  }

  if (options.disableCookies) {
    window._paq.push(['disableCookies']);
  }

  if (options.requireCookieConsent) {
    window._paq.push(['requireCookieConsent']);
  }

  if (options.enableHeartBeatTimer) {
    window._paq.push(['enableHeartBeatTimer', options.heartBeatTimerInterval]);
  }

  if (options.cookieDomain) {
    window._paq.push(['setCookieDomain', options.cookieDomain]);
  }

  if (options.domains) {
    window._paq.push(['setDomains', options.domains]);
  }

  loadScript(scriptUrl, options.crossOrigin)
    .then(() => {
      // On initial page load, track the first page view
      if (options.enableLinkTracking) {
        window._paq.push(['enableLinkTracking']);
      }
      window._paq.push(['trackPageView']);
    })
    .catch((error) => {
      if (error.target) {
        return console.error(
          `An error occurred trying to load ${error.target.src}. `
        );
      }
      console.error(error);
    });

  /**
   * Tracks a custom event.
   * @param {string} eventCategory - The category of the event.
   * @param {string} eventAction - The action of the event.
   * @param {string} [eventName] - The name of the event.
   * @param {number} [eventValue] - The value of the event.
   */
  function trackEvent(eventCategory, eventAction, eventName, eventValue) {
    window._paq.push(['trackEvent', eventCategory, eventAction, eventName, eventValue]);
  }

  /**
   * Tracks a page view in a single-page application.
   * @param {string} [url] - The URL of the page to track. Defaults to window.location.href.
   */
  function trackPageView(url = window.location.href) {
    window._paq.push(['setReferrerUrl', previousUrl]);
    window._paq.push(['setCustomUrl', url]);
    window._paq.push(['setDocumentTitle', document.title]);

    // remove all previously assigned custom variables, requires Matomo 3.0.2
    window._paq.push(['deleteCustomVariables', 'page']);
    window._paq.push(['trackPageView']);

    if (options.enableLinkTracking) {
      window._paq.push(['enableLinkTracking']);
    }

    previousUrl = url;
  }

  /**
   * Pushes an instruction to the Matomo tracker.
   * @param {any[]} args - The instruction to push.
   */
  function push(args) {
    window._paq.push(args);
  }

  if (options.trackRouter) {
    const track = () => setTimeout(() => trackPageView(window.location.href), 0);

    // Monkey patch pushState and replaceState to track page changes
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      track();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      track();
    };

    // Listen for popstate and hashchange events
    window.addEventListener('popstate', track);
    window.addEventListener('hashchange', track);
  }

  return {
    trackEvent,
    trackPageView,
    push
  };
}
