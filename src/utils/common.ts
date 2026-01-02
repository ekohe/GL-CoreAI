import manifest from "./../resources/manifest.json";

export const AiBOT = {
  name: manifest.name,
  version: manifest.version,
  authorName: manifest.author.name,
  authorEmail: manifest.author.email,
  homepageURL: manifest.homepage_url,
  appId: chrome.runtime.id,
  googleAppClientId: manifest.oauth2.client_id,
  googleAppScopes: manifest.oauth2.scopes,
};

// Only assign to window if it's available (not in service worker context)
if (typeof window !== 'undefined') {
  Object.assign(window, { AiBOT });
}
