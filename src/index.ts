export interface MatomoOptions {
  host: string;
  siteId: number | string;
  trackerFileName?: string;
  trackerUrl?: string;
  trackerScriptUrl?: string;
  trackerScriptDisable?: boolean;
  enableLinkTracking?: boolean;
  requireConsent?: boolean;
  userId?: string;
  disableCookies?: boolean;
  requireCookieConsent?: boolean;
  enableHeartBeatTimer?: boolean;
  heartBeatTimerInterval?: number;
  cookieDomain?: string;
  domains?: string[];
  crossOrigin?: 'anonymous' | 'use-credentials';
  preInitActions?: any[];
  trackRouter?: boolean;
}

interface TrackPageViewProps {
  deleteCustomVariables?: boolean;
  documentTitle?: string;
}

export type MatomoTracker = ReturnType<typeof initMatomo>;

declare global {
  interface Window {
    _paq: any[][];
  }
}

let previousUrl: string;

/**
 * Loads the Matomo tracker script.
 * @param trackerScript - The URL of the tracker script.
 * @param crossOrigin - The cross-origin attribute for the script tag.
 * @param trackerScriptDisable - If set, the tracker script will not be loaded, eg. if you already have it loaded in your application.
 * @returns Promise that resolves when the script is loaded
 */
function loadScript(
  trackerScript: string, 
  crossOrigin?: 'anonymous' | 'use-credentials', 
  trackerScriptDisable: boolean = false
): Promise<void> {
  if (trackerScriptDisable) {
    console.warn('Matomo tracker script loading is disabled. Skipping script load.');
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = trackerScript;

    if (crossOrigin && ['anonymous', 'use-credentials'].includes(crossOrigin)) {
      script.crossOrigin = crossOrigin;
    }

    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(script);

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${trackerScript}`));
  });
}

/**
 * Initializes the Matomo tracker.
 * @param setupOptions - The options for the Matomo tracker.
 * @returns MatomoTracker instance
 */
export function initMatomo(setupOptions: MatomoOptions) {
  if (typeof window === 'undefined') {
    throw new Error('Matomo tracker can only be initialized in a browser environment.');
  }
  if (!setupOptions || !setupOptions.host || !setupOptions.siteId) {
    throw new Error('Matomo tracker requires a host and siteId to be set.');
  }

  previousUrl = window.location.href;
  const options: Required<MatomoOptions> = {
    trackerFileName: 'matomo',
    enableLinkTracking: true,
    preInitActions: [],
    trackRouter: false,
    trackerUrl: '',
    trackerScriptUrl: '',
    trackerScriptDisable: false,
    requireConsent: false,
    userId: '',
    disableCookies: false,
    requireCookieConsent: false,
    enableHeartBeatTimer: false,
    heartBeatTimerInterval: 15,
    cookieDomain: '',
    domains: [],
    crossOrigin: undefined as any,
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
    setUserId(options.userId);
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

  if (options.domains && options.domains.length > 0) {
    window._paq.push(['setDomains', options.domains]);
  }

  loadScript(scriptUrl, options.crossOrigin, options.trackerScriptDisable)
    .then(() => {
      // On initial page load, track the first page view
      if (options.enableLinkTracking) {
        window._paq.push(['enableLinkTracking']);
      }
      trackPageView();
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
   * @param eventCategory - The category of the event.
   * @param eventAction - The action of the event.
   * @param eventName - The name of the event.
   * @param eventValue - The value of the event.
   */
  function trackEvent(
    eventCategory: string, 
    eventAction: string, 
    eventName?: string, 
    eventValue?: number
  ): void {
    window._paq.push(['trackEvent', eventCategory, eventAction, eventName, eventValue]);
  }

  /**
   * Tracks a page view in a single-page application.
   * @param url - The URL of the page to track. Defaults to window.location.href.
   * @param props - Additional properties to set for the page view.
   */
  function trackPageView(url: string = window.location.href, props: TrackPageViewProps = {}): void {
    const trackPageViewOptions: Required<TrackPageViewProps> = { 
      deleteCustomVariables: true, 
      documentTitle: document.title, 
      ...props 
    };
    window._paq.push(['setReferrerUrl', previousUrl]);
    window._paq.push(['setCustomUrl', url]);
    window._paq.push(['setDocumentTitle', trackPageViewOptions.documentTitle]);

    // remove all previously assigned custom variables, requires Matomo 3.0.2
    if (trackPageViewOptions.deleteCustomVariables) {
      window._paq.push(['deleteCustomVariables', 'page']);
    }

    window._paq.push(['trackPageView']);

    if (options.enableLinkTracking) {
      window._paq.push(['enableLinkTracking']);
    }

    previousUrl = url;
  }

  /**
   * Sets the user ID for tracking.
   * @param userId - The user ID to set. If null, it will reset the user ID.
   * @throws Error if the user ID is not a string or null.
   */
  function setUserId(userId: string | null): void {
    if (userId === null) {
      window._paq.push(['resetUserId']);
      return;
    }
    if (typeof userId !== 'string') {
      throw new Error('User ID must be a string.');
    }
    window._paq.push(['setUserId', userId]);
  }

  /**
   * Pushes any instruction to the Matomo tracker.
   * @param args - The instruction to push.
   * @see https://developer.matomo.org/guides/tracking-javascript-guide
   */
  function push(args: any[]): void {
    window._paq.push(args);
  }

  if (options.trackRouter) {
    let trackingScheduled = false;

    const track = (): void => {
      const currentUrl = window.location.href;

      if (previousUrl === currentUrl || trackingScheduled) {
        return;
      }
      
      trackingScheduled = true;
      requestAnimationFrame(() => {
        trackPageView(currentUrl);
        trackingScheduled = false;
      });
    };

    // Monkey patch pushState and replaceState to track page changes
    const originalPushState = history.pushState;
    history.pushState = function(...args: Parameters<typeof originalPushState>) {
      originalPushState.apply(this, args);
      track();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args: Parameters<typeof originalReplaceState>) {
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
    setUserId,
    push
  };
}