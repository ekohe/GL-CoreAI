import manifest from "./../resources/manifest.json";

export const AiBOT = {
  name: manifest.name,
  version: manifest.version,
  authorName: manifest.author.name,
  authorEmail: manifest.author.email,
  homepageURL: manifest.homepage_url,
  appId: "ikimppmiiiackbjgemoelpchbhgcbibh",
  googleAppClientId: manifest.oauth2.client_id,
  googleAppScopes: manifest.oauth2.scopes,
};

Object.assign(window, { AiBOT });
