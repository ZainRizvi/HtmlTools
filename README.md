# Hampton-s

This repo is (re)booting as a home for **single-file HTML tools**: small, useful web apps built as **one `.html` file** with inline JavaScript and CSS.

The long-term direction is to turn this into a **GitHub Pages static site** where each tool has a stable URL.

## What’s an “HTML tool”?

An HTML tool is a tiny application that:

- **Lives in a single `.html` file** (inline `<style>` + `<script>`)
- **Avoids build steps** (no React/JSX compilation, no bundlers)
- **Loads dependencies from CDNs** when necessary (version-pinned)
- Stays **small and remixable** (easy to copy/paste and easy for an LLM to understand)

This approach is inspired by Simon Willison’s patterns in [Useful patterns for building HTML tools](https://simonwillison.net/2025/Dec/10/html-tools/).

## Conventions (for contributors + agents)

- **Single file per tool**: prefer `tools/<slug>.html` (once `tools/` exists).
- **No build step**: do not introduce React, bundlers, or a compilation pipeline.
- **CDN deps are OK**: use reputable CDNs (e.g. cdnjs/jsDelivr) and pin versions.
- **Copy/paste friendly UX**: include “Copy to clipboard” buttons for outputs.
- **State**:
  - Use the **URL** (`?…` or `#…`) for shareable/bookmarkable state.
  - Use **`localStorage`** for drafts and secrets (e.g. API keys). Never commit keys.
- **Files + downloads**: it’s encouraged to process local files in-browser and generate downloadable outputs.

More detailed agent-facing guidance lives in `agents.MD`.

## Local preview

You can open a tool directly in your browser, but some features (fetch/CORS) behave better when served over HTTP.

```bash
npx serve .
```

## Status

This repository is currently minimal and will grow into a browsable collection as tools are added and GitHub Pages is configured.
