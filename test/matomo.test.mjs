import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init } from '../index.js';

const TRACKER_URL = './track.js';
const PORT = 5173; // Default Vite dev server port

describe('matomo', () => {
  beforeEach(() => {
    window._paq = [];
    vi.restoreAllMocks();
    history.pushState({}, '', '/');
  });

  it('should initialize with basic options', () => {
    const matomo = init({
      host: 'https://example.com',
      siteId: 1,
      trackerUrl: TRACKER_URL,
    });

    expect(window._paq).toContainEqual(['setTrackerUrl', TRACKER_URL]);
    expect(window._paq).toContainEqual(['setSiteId', 1]);
    expect(matomo).toBeDefined();
    expect(document.querySelector(`script[src="${TRACKER_URL}"]`)).toBeDefined();
  });

  it('should return a tracker object', () => {
    const matomo = init({
      host: 'https://example.com',
      siteId: 1,
    });

    expect(matomo.trackPageView).toBeInstanceOf(Function);
    expect(matomo.trackEvent).toBeInstanceOf(Function);
    expect(matomo.push).toBeInstanceOf(Function);
  });

  it('trackPageView should push correct data to _paq', () => {
    const matomo = init({
      host: 'https://example.com',
      siteId: 1,
    });
    matomo.trackPageView('https://example.com/new-page');

    expect(window._paq).toContainEqual(['setCustomUrl', 'https://example.com/new-page']);
    expect(window._paq).toContainEqual(['trackPageView']);
  });

  it('trackEvent should push correct data to _paq', () => {
    const matomo = init({
      host: 'https://example.com',
      siteId: 1,
    });
    matomo.trackEvent('Category', 'Action', 'Name', 10);

    expect(window._paq).toContainEqual(['trackEvent', 'Category', 'Action', 'Name', 10]);
  });

  it('push should push arguments to _paq', () => {
    const matomo = init({
      host: 'https://example.com',
      siteId: 1,
    });
    matomo.push(['trackGoal', 1]);

    expect(window._paq).toContainEqual(['trackGoal', 1]);
  });

  it('should automatically track router changes if trackRouter is true', async () => {
    init({
      host: 'https://example.com',
      siteId: 1,
      trackRouter: true,
    });

    const pushSpy = vi.spyOn(window._paq, 'push');

    history.pushState({}, '', '/new-route');

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(pushSpy).toHaveBeenCalledWith(['setCustomUrl', `http://localhost:${PORT}/new-route`]);
    expect(pushSpy).toHaveBeenCalledWith(['trackPageView']);
  });

  it('should automatically track router change with HASH mode', async () => {
    init({
      host: 'https://example.com',
      siteId: 1,
      trackRouter: true,
    });

    const pushSpy = vi.spyOn(window._paq, 'push');

    location.hash = '#/new-route';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(pushSpy).toHaveBeenCalledWith(['setCustomUrl', `http://localhost:${PORT}/#/new-route`]);
    expect(pushSpy).toHaveBeenCalledWith(['trackPageView']);
  });
});
