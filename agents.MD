# Agent guide for this repo (HTML tools)

This repository is for **single-file “HTML tools”**: useful little web apps that combine **HTML + CSS + JavaScript in one `.html` file** and can be hosted as static files (eventually as a GitHub Pages site).

These guidelines are based on Simon Willison’s post **“Useful patterns for building HTML tools”**: [Useful patterns for building HTML tools](https://simonwillison.net/2025/Dec/10/html-tools/)

## What we mean by “HTML tool”

An HTML tool is:

- **One file**: inline CSS + inline JS in a single `.html` file.
- **No build step**: no bundlers, no JSX compilation.
- **Small**: ideally a few hundred lines; easy to rewrite/refactor with an LLM.
- **Static-hostable**: should work from GitHub Pages or any static host.

## Non-negotiables for agents

- **Single-file output**: implement each tool as a single `.html` file with embedded `<style>` and `<script>`.
- **Avoid React / frameworks that require compilation**: do not introduce React/JSX or a build pipeline.
- **CDN dependencies only** (when needed): load libraries via version-pinned URLs from reputable CDNs (e.g. cdnjs/jsDelivr). Prefer fewer dependencies.
- **Don’t bake secrets into the file**: never hardcode API keys or tokens.

## Recommended repo structure

Until a site generator exists, assume a simple static layout:

- `index.html` – landing page listing tools (planned)
- `tools/` – each tool as `tools/<slug>.html` (planned)
- `assets/` – only if absolutely necessary (avoid shared JS that undermines “single file”)

If a future GitHub Pages setup requires a different structure (e.g. `/docs`), follow that, but keep tools as single `.html` files.

## Tool UX patterns (high leverage)

- **Copy/paste first**:
  - Accept pasted input (URLs, text, rich text, images, files).
  - Provide clear “Copy to clipboard” buttons (especially for mobile).
  - Consider reading multiple clipboard formats from paste events.

- **Build debugging helpers when exploring browser capabilities**:
  - When you’re uncertain what’s available (clipboard data, file metadata, key events, CORS behavior), it’s valid to build a small debug panel or even a separate debug tool.

- **Persist state in the URL when it’s shareable**:
  - Use query params or `location.hash` to store state that should be bookmarkable/shareable.
  - Keep it reasonably compact; encode JSON if needed.

- **Use `localStorage` for larger state or secrets**:
  - Use `localStorage` for drafts, larger inputs, and **API keys**.
  - Ask for keys via `prompt()` or a dedicated settings UI, then store locally.
  - Provide a “Clear stored data” / “Forget key” action.

- **Prefer CORS-enabled APIs**:
  - Public APIs with permissive CORS are ideal for static tools.
  - GitHub is especially useful: public repo content can often be fetched via `raw.githubusercontent.com`.

- **Use the File API freely**:
  - Use `<input type="file">` and `FileReader` / `Blob` APIs to process files locally.
  - Support drag-and-drop and paste for images where appropriate.

- **Offer downloads**:
  - Generate downloadable output using `Blob` + `URL.createObjectURL()`.
  - If producing common formats (PNG/JPEG/ICS/etc.), use small CDN-loaded libraries when needed.

- **WebAssembly / Pyodide are allowed when they buy real capability**:
  - Pyodide can run Python in-browser and load pure-Python packages via `micropip`.
  - WebAssembly can unlock heavy tooling (OCR, codecs, etc.)—but mind download size and UX.

## Record prompts and provenance

When an agent creates or substantially modifies a tool:

- **Capture the origin**:
  - Add an HTML comment near the top with a short description and (if available) a link to the prompt/transcript.
  - If work was done via an agent session, include the transcript link in the eventual PR/commit message (when applicable).

- **Add a “View source” link** (recommended):
  - Include a footer link pointing to the file in this GitHub repo.

## Quality bar

- **Works when served statically** (GitHub Pages-compatible).
- **No console errors on load**.
- **Good empty states + clear instructions**.
- **Accessible basics**: labels for inputs, buttons with text, sensible focus order.

## Local preview (no build step)

- Open the `.html` file directly in a browser, or
- Run a static server:

```bash
npx serve .
```

(Use this when fetch/CORS behavior differs between `file://` and `http://`.)
