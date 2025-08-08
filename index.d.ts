/**
 * Initializes the Matomo tracker.
 * @param {MatomoOptions} setupOptions - The options for the Matomo tracker.
 * @returns {MatomoTracker}
 */
export function initMatomo(setupOptions: MatomoOptions): MatomoTracker;
export type MatomoOptions = {
    /**
     * - The URL of the Matomo instance.
     */
    host: string;
    /**
     * - The ID of the site to track.
     */
    siteId: number;
    /**
     * - The name of the tracker file.
     */
    trackerFileName?: string;
    /**
     * - The URL of the tracker endpoint (matomo.php).
     */
    trackerUrl?: string;
    /**
     * - The URL of the tracker script (matomo.js).
     */
    trackerScriptUrl?: string;
    /**
     * - Whether to enable link tracking.
     */
    enableLinkTracking?: boolean;
    /**
     * - Whether to require user consent for tracking.
     */
    requireConsent?: boolean;
    /**
     * - The user ID to track.
     */
    userId?: string;
    /**
     * - Whether to disable cookies.
     */
    disableCookies?: boolean;
    /**
     * - Whether to require user consent for cookies.
     */
    requireCookieConsent?: boolean;
    /**
     * - Whether to enable the heartbeat timer.
     */
    enableHeartBeatTimer?: boolean;
    /**
     * - The interval for the heartbeat timer in seconds.
     */
    heartBeatTimerInterval?: number;
    /**
     * - The domain for the cookies.
     */
    cookieDomain?: string;
    /**
     * - The domains to track.
     */
    domains?: string[];
    /**
     * - The cross-origin attribute for the script tag.
     */
    crossOrigin?: "anonymous" | "use-credentials";
    /**
     * - Actions to push to _paq before initialization.
     */
    preInitActions?: any[];
    /**
     * - Whether to automatically track page views on router changes.
     */
    trackRouter?: boolean;
};
export type MatomoTracker = {
    trackEvent: (eventName: string, eventCategory?: string, eventAction?: string, eventValue?: number) => void;
    trackPageView: (url: string) => void;
    push: (args: any[]) => void;
};
