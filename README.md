# Punto Raw - Mastermind Podcast Site

A modern, dark-themed podcast website built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Overview

Punto Raw is a monthly mastermind podcast focused on raw intentions, accountability, and growth. This site serves as the home for episodes, team information, and speaker schedule.

## Features

- **Dark Premium Design** - Elegant, minimal aesthetic with custom dark theme
- **Hero Section** - Full-screen landing with CTA to episodes
- **Episode Grid** - Card-based layout for episode discovery
- **Episode Pages** - Full episode details with audio player and content
- **Schedule Page** - Monthly speaker rotation with pass system
- **Team Page** - Showcase of team members and roles
- **Responsive Design** - Mobile-first, works on all devices
- **Audio Integration** - Built-in HTML5 audio player

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Deployment:** Cloudflare Pages

## Project Structure

```
├── app/
│   ├── episodes/          # Episodes listing and detail pages
│   ├── schedule/          # Speaker schedule page
│   ├── team/              # Team members page
│   ├── layout.tsx         # Root layout with header/footer
│   ├── page.tsx           # Homepage with hero
│   └── globals.css        # Dark theme styles
├── components/
│   └── episode-card.tsx   # Reusable episode card component
└── public/                # Static assets
    ├── team/              # Team member images
    └── episodes/          # Episode artwork
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment to Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
npm run build
wrangler pages deploy out
```

Or use GitHub integration:
1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `.next`

## Adding Episodes

Episodes are currently stored as data in page components. To add a new episode:

1. Edit `/app/episodes/page.tsx` to add entry to `episodes` array
2. Add corresponding episode detail to `/app/episodes/[slug]/page.tsx` in `episodes` object
3. Add audio file to `/public/audio/`
4. Commit and deploy

Future: Integrate markdown-based episode system for easier management.

## Blog (resúmenes de episodios)

Posts live in `content/blog/` as `.mdx` files and are rendered to static HTML at build time (`/blog` and `/blog/<file-name>`).

1. Copy `content/blog/_plantilla.mdx` → `content/blog/<slug>.mdx` (files starting with `_` are ignored)
2. Fill in the frontmatter (`title`, `date`, `excerpt` required; `episode` links it to `/episodes/<slug>` and adds a "Lee el resumen completo" card on that episode page; `spotifyId` shows the player)
3. Write the summary in Markdown below the frontmatter
4. Add the URL to `public/sitemap.xml`, commit and deploy

Formatting blocks available inside posts: `<Pregunta>`, `<Perspectivas>` + `<Perspectiva nombre rol>`, `<Frase autor>`, `<Claves>` (see the template). Styles live in `components/blog-mdx.tsx`.

Set `draft: true` to keep a post unpublished. Keep at least one published post — the static export needs one to build `/blog/[slug]`.

## Team

- **Greg Anthony** - Founder & Speaker
- **Rafa** - Systems Architect & Co-Host
- **RJ** - Audio Engineer & Creative Force
- **Markus Corvus** - Organizer & Documentarian

## License

All rights reserved © 2024 Punto Raw
