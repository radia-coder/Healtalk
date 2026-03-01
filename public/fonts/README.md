# Fonts Directory

This directory contains the custom fonts for HealTalk.

## Required Font Files

Please add the following font files to this directory:

### Lastik Regular (Logo/Wordmark Font)
- `Lastik-Regular.woff2`
- `Lastik-Regular.woff` (optional fallback)

### Switzer (Headings Font)
- `Switzer-Regular.woff2`
- `Switzer-Medium.woff2`
- `Switzer-Semibold.woff2`
- `Switzer-Bold.woff2`

## Current Status

⚠️ **Font files are not yet added.** The application will fall back to system fonts until the custom fonts are provided.

## Installation

1. Obtain the font files (`.woff2` format recommended for best performance)
2. Place them in this directory (`/public/fonts/`)
3. Ensure file names match exactly as listed above
4. Restart the development server

## Font Usage

- **Lastik Regular**: Used for the HealTalk brand wordmark/logo
- **Switzer**: Used for headings, subheadings, and section titles (H1-H6)
- **Inter** (Google Font): Used for body text, paragraphs, and general content

The font configuration is set up in `/src/app/layout.tsx` and `/src/app/globals.css`.
