# Biztek Group — Website Monorepo

Static marketing sites for The Biztek Group. Each site under `sites/` is self-contained (plain HTML/CSS/JS, no build step) and shares the same six pages and content, but with a completely different visual identity.

```
BiztekWebsite/
└── sites/
    ├── nexus/      dark, tech-network aesthetic (cyan/violet, animated 3D sphere hero)
    ├── ember/      warm neo-brutalist aesthetic (cream/coral, animated gradient blobs, custom cursor)
    ├── terminal/   developer/CRT terminal aesthetic (phosphor green-on-black, scanlines, typewriter hero, live log feed)
    └── converge/   nexus's palette, rebuilt homepage: bespoke "connected business" network diagrams, scroll narrative, interactive stats, problem-first CTA
```

Every site has the same internal structure:

```
sites/<name>/
├── index.html
├── about.html
├── services.html
├── industries.html
├── case-studies.html
├── contact.html
├── css/styles.css   (shared stylesheet for every page in that site)
└── js/main.js       (shared nav + scroll-reveal logic; sites may add extra page-specific scripts)
```

## Running locally

No build tools required — just serve the folder statically and open `index.html`.

```bash
# nexus
npx --yes serve sites/nexus -l 5173

# ember
npx --yes serve sites/ember -l 5174

# terminal
npx --yes serve sites/terminal -l 5175

# converge
npx --yes serve sites/converge -l 5176
```

Or simply open `sites/<name>/index.html` directly in a browser.

## Adding a new site

Duplicate the folder structure above under `sites/<new-name>/`, keeping the same six page filenames so cross-links and nav stay consistent. Content (copy, phone number, address) should stay in sync across sites unless a redesign intentionally changes it.
