# Photo Gallery

A clean, password-protected personal photo gallery built with Next.js 14 (App Router) and Tailwind CSS.

## Features

- Password-protected access (one global password, no usernames)
- Responsive masonry grid gallery
- Full-screen lightbox with keyboard navigation (←/→/Esc)
- Drag-and-drop photo upload with progress indicators
- Lazy image loading
- Dark, minimal UI

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your password:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
GALLERY_PASSWORD=your-secret-password-here
```

### 3. Add photos (optional)

Drop any `.jpg`, `.jpeg`, `.png`, `.webp`, or `.heic` files into the `public/photos/` folder to pre-populate the gallery.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Enter your password to access the gallery.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Password login |
| `/gallery` | Photo grid + lightbox (protected) |
| `/upload` | Drag-and-drop upload (protected) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GALLERY_PASSWORD` | Yes | The password to access the gallery and upload page |

## Deploying to Vercel

### Option A: Photos baked into the build (recommended for Vercel)

Add your photos to `public/photos/` before deploying. Vercel serves static files from `public/` at the edge — fast and free.

```bash
# Add photos, then deploy
vercel deploy
```

Set `GALLERY_PASSWORD` in Vercel's dashboard under **Project → Settings → Environment Variables**.

> **Note:** The `/upload` page writes files to `public/photos/` on the local filesystem. This works perfectly when running locally (e.g. `npm run dev` or `npm start` on your own server). On Vercel's serverless platform, the filesystem is read-only at runtime, so uploaded files won't persist between requests. For a cloud-hosted upload workflow, replace the upload API with [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage — it's a small change to `app/api/upload/route.ts`.

### Option B: Self-hosted (uploads work fully)

Run on any Node.js server (VPS, Raspberry Pi, etc.):

```bash
npm run build
npm start
```

Uploads will persist to `public/photos/` normally.

## Keyboard Shortcuts (Lightbox)

| Key | Action |
|-----|--------|
| `←` | Previous photo |
| `→` | Next photo |
| `Esc` | Close lightbox |
| Click backdrop | Close lightbox |
