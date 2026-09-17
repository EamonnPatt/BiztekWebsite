# Biztek Group — Website

Static marketing site for The Biztek Group. Plain HTML/CSS/JS with no build step or dependencies to install — dark tech-network aesthetic built around a cyan/violet palette.

```
BiztekWebsite/
├── index.html
├── about.html
├── services.html
├── industries.html
├── case-studies.html
├── contact.html
├── css/
│   └── styles.css          shared stylesheet for every page
├── js/
│   ├── main.js             nav, scroll reveal, ambient background (all pages)
│   ├── hero-canvas.js      3D network sphere in the hero (index only)
│   └── system-network.js   interactive system diagram (index only)
└── img/
    └── biztek-logo.png
```

## Running locally

Serve the folder statically from the repo root:

```bash
npx --yes serve . -l 5173
# or
python -m http.server 5173
```

Then open <http://localhost:5173>.

Opening `index.html` directly from the filesystem mostly works, but serve it over HTTP if you want the hero canvas and web fonts to load reliably.

## How it fits together

Every page shares `css/styles.css` and `js/main.js`, and repeats the same header and footer markup inline — there is no templating layer, so **a nav or footer change has to be made in all six HTML files**.

`js/main.js` handles three things across every page:

- sticky-header scroll state and the mobile nav toggle
- scroll reveal — elements marked `data-reveal` that start below the fold fade up as they enter view
- the ambient background — a fixed layer of drifting blurred orbs plus a slow-moving grid, injected into the DOM at runtime so no page needs extra markup

Theme colors, spacing, and radii are CSS custom properties on `:root` in `styles.css`. Change them there rather than in individual rules.

Animation respects `prefers-reduced-motion`, and content stays fully visible with JavaScript disabled — the reveal and ambient layers are progressive enhancements.

### External resources

- **Google Fonts** (Sora, IBM Plex Sans, IBM Plex Mono) — imported at the top of `styles.css`
- **three.js r128** — loaded from cdnjs in `index.html`, required by `hero-canvas.js`

## Editing content

Copy, phone number, and address live directly in the HTML. Contact details appear in the footer of all six pages and again on `contact.html`, so update them everywhere when they change.
