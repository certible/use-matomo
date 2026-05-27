import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initMatomo } from '../dist/index.js';

const TRACKER_SCRIPT_URL = './track.js';

describe('matomo', () => {
  beforeEach(() => {
    document.querySelectorAll('script').forEach((script) => script.remove());
    window._paq = [];
    vi.restoreAllMocks();
    history.pushState({}, '', '/');
  });

  it('should initialize with basic options', () => {
    const matomo = initMatomo({
      host: 'https://example.com',
      siteId: 1,
    });

    expect(window._paq).toContainEqual(['setTrackerUrl', 'https://example.com/matomo.php']);
    expect(window._paq).toContainEqual(['setSiteId', 1]);
    expect(matomo).toBeDefined();
    expect(document.querySelector('script[src="https://example.com/matomo.js"]')).not.toBeNull();
  });

  it('should use custom tracker script and endpoint URLs independently', () => {
    initMatomo({
      host: 'https://example.com',
      siteId: 1,
      trackerUrl: 'https://analytics.example.com/custom.php',
      trackerScriptUrl: TRACKER_SCRIPT_URL,
    });

    expect(window._paq).toContainEqual(['setTrackerUrl', 'https://analytics.example.com/custom.php']);
    expect(document.querySelector(`script[src="${TRACKER_SCRIPT_URL}"]`)).not.toBeNull();
  });

  it('should return a tracker object', () => {
    const matomo = initMatomo({
      host: 'https://example.com',
      siteId: 1,
    });

    expect(matomo.trackPageView).toBeInstanceOf(Function);
    expect(matomo.trackEvent).toBeInstanceOf(Function);
    expect(matomo.push).toBeInstanceOf(Function);
  });

  it('should normalize host when building tracker URLs', () => {
    initMatomo({
      host: 'https://example.com/',
      siteId: 1,
    });

    expect(window._paq).toContainEqual(['setTrackerUrl', 'https://example.com/matomo.php']);
    expect(document.querySelector('script[src="https://example.com/matomo.js"]')).toBeDefined();
  });

  it('trackPageView should push correct data to _paq', () => {
    const matomo = initMatomo({
      host: 'https://example.com',
      siteId: 1,
    });
    matomo.trackPageView('https://example.com/new-page');

    expect(window._paq).toContainEqual(['setCustomUrl', 'https://example.com/new-page']);
    expect(window._paq).toContainEqual(['trackPageView']);
  });

  it('trackEvent should push correct data to _paq', () => {
    const matomo = initMatomo({
      host: 'https://example.com',
      siteId: 1,
    });
    matomo.trackEvent('Category', 'Action', 'Name', 10);

    expect(window._paq).toContainEqual(['trackEvent', 'Category', 'Action', 'Name', 10]);
  });

  it('push should push arguments to _paq', () => {
    const matomo = initMatomo({
      host: 'https://example.com',
      siteId: 1,
    });
    matomo.push(['trackGoal', 1]);

    expect(window._paq).toContainEqual(['trackGoal', 1]);
  });

  it('should automatically track router changes if trackRouter is true', async () => {
    initMatomo({
      host: 'https://example.com',
      siteId: 1,
      trackRouter: true,
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    history.pushState({}, '', '/new-route');

    await new Promise(resolve => setTimeout(resolve, 50));

    const expectedUrl = `${window.location.origin}/new-route`;
    expect(window._paq).toContainEqual(['setCustomUrl', expectedUrl]);
    expect(window._paq).toContainEqual(['trackPageView']);
  });

  it('should automatically track router change with hash mode', async () => {
    initMatomo({
      host: 'https://example.com',
      siteId: 1,
      trackRouter: true,
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    location.hash = '#/new-route';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await new Promise(resolve => setTimeout(resolve, 50));

    const expectedUrl = `${window.location.origin}/#/new-route`;
    expect(window._paq).toContainEqual(['setCustomUrl', expectedUrl]);
    expect(window._paq).toContainEqual(['trackPageView']);
  });
});
