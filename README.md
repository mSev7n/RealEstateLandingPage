# AETHERA — Luxury Cinematic Real Estate

A scroll-driven cinematic luxury real estate landing page with an integrated 3D CSS house model.

## Project Structure

```
aethera/
├── index.html          — Main page
├── index.css           — All styles (mobile-first, dark/light theme)
├── index.js            — Scroll engine, 3D house, all interactions
├── assets/
│   ├── images/
│   │   ├── exterior1.jpg
│   │   ├── exterior2.jpg
│   │   ├── exterior3.jpg
│   │   ├── interior1.jpg
│   │   ├── interior2.jpg
│   │   └── interior3.jpg
│   └── videos/
│       └── hero video.mp4   (optional, not required)
└── README.md
```

## Features

- **Scroll-driven 3D CSS house** — rotates 360° as you scroll through the hero section (5-screen tall scroll track)
- **Drag to rotate** — users can also drag/touch the house to spin it manually
- **4 animated text panels** — fade in/out at scroll positions (Front Elevation, Side Terrace, etc.)
- **Ambient particles** — subtle floating gold & white particles on canvas
- **Mobile-first responsive** — scales cleanly from 320px to 4K
- **Light/dark theme** — persisted in localStorage, toggle bottom-right
- **Property cards** — exterior/interior image toggle, hover animations
- **Scroll reveal** — all sections animate in on IntersectionObserver
- **Luxury inquiry form** — saves to localStorage, shows admin stats
- **Admin dashboard** — press Ctrl+Shift+A to access

## Setup

Just drop your images into `assets/images/` with these exact filenames:
- `exterior1.jpg`, `exterior2.jpg`, `exterior3.jpg`
- `interior1.jpg`, `interior2.jpg`, `interior3.jpg`

No build step required. Open `index.html` in any modern browser or deploy to Vercel as-is.

## Deployment to Vercel

1. Push this folder to a GitHub repo
2. Import to Vercel
3. In "Configure Project", set **Output Directory** to `.` (a period)
4. Deploy

## Admin Dashboard

Press **Ctrl + Shift + A** anywhere on the page to access the admin view showing:
- Visitor count
- Inquiry count
- Deal pipeline value
