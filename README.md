# Socio Top Paper

Search UPSC Sociology Optional topper answer copies by question, thinker, syllabus topic or topper, then open the exact page of the original copy on Google Drive.

It's a front-end-only [Next.js](https://nextjs.org) app. Your browser reads the curated Google Sheet directly, so you don't need to run a Node script or server. Open the page and start searching.

## Features

- **Live data**: the three sheet tabs are fetched straight from Google Sheets in your browser. A Web Worker parses about 9 MB of CSV off the main thread, removes duplicates across the two question sheets and caches the result in IndexedDB. Repeat visits load instantly, and the data refreshes in the background.
- **Search**: multi-word search across questions, introductions, thinkers, concepts, syllabus, diagrams and toppers. Matching words are highlighted.
- **Filters**: Paper I / II, syllabus section (matched to the official UPSC syllabus), topper, questions only, has diagram, and sorting by relevance, rank, name or page.
- **Shareable searches**: filters are kept in the URL (`?q=weber&paper=1&questions=1`).
- **In-page preview**: open any answer in a side panel with an embedded Drive preview, or go straight to Drive at the right page.
- **Drive link health**: many PDFs listed in the sheet aren't publicly shared any more, and Drive shows *"Sorry, the file you have requested does not exist"* for them. The site checks every copy from your browser and caches the result. By default it hides pages whose PDF can't be opened (you can still show them). When the sheet lists two IDs for the same file, it picks the one that works. The **Drive link health** panel lists the unshared files so the owner can set them to *Anyone with the link*.
- **Toppers and Thinkers**: browse toppers by All India Rank and the most-cited thinkers. Spelling variants are merged (e.g. "Agarwal" and "Agrawal").
- Keyboard shortcuts: `/` or `⌘K` focuses search, and `Esc` closes the preview.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

## Deploy

`.github/workflows/deploy.yml` builds the static site and publishes it to **GitHub Pages** on every push to `main`. Turn it on once under **Settings → Pages → Source: GitHub Actions**. The site will then be at `https://amanjaiman1.github.io/Topper_Paper_Socio/`.

Because the output is static (`out/`), you can also host it on Vercel, Netlify or Cloudflare Pages without any config.

## Data source

You configure the sheet in `src/lib/dataset.ts` (`SHEET_ID`, `QUESTION_GIDS`, `DRIVE_GID`). The sheet must be shared as "Anyone with the link can view".

The original zero-dependency Node script is kept for reference in `legacy/socio.js`.
