# Agent guide for this repo (HTML tools)

This repository is for **single-file "HTML tools"**: useful little web apps that combine **HTML + CSS + JavaScript in one `.html` file** and can be hosted as static files (eventually as a GitHub Pages site).

These guidelines are based on Simon Willison's post **"Useful patterns for building HTML tools"**: [Useful patterns for building HTML tools](https://simonwillison.net/2025/Dec/10/html-tools/)

**Note:** Keep this file in sync with `/Users/zain/.claude/CLAUDE.md`. If either file is updated with policies or conventions, copy the more recent version over the older one to maintain consistency.

## What we mean by "HTML tool"

An HTML tool is:

- **One file**: inline CSS + inline JS in a single `.html` file.
- **No build step**: no bundlers, no JSX compilation.
- **Small**: ideally a few hundred lines; easy to rewrite/refactor with an LLM.
- **Static-hostable**: should work from GitHub Pages or any static host.

## Tool definition

A **Tool** is defined as any HTML file in the root directory of the repository that is not `index.html`. Each tool represents a standalone, single-file web application that can be discovered and listed on the site homepage.

## Non-negotiables for agents

- **Single-file by default**: implement each tool as a single `.html` file with embedded `<style>` and `<script>` whenever practical.
- **Avoid React / frameworks that require compilation**: do not introduce React/JSX or a build pipeline.
- **No build step**: keep tools runnable as static files without bundling/transpilation.
- **Dependencies**:
  - Prefer **version-pinned CDN URLs** (e.g. cdnjs/jsDelivr) for third-party libraries.
  - You may use **repo-local shared JavaScript** from `lib/` when it meaningfully reduces duplication across tools (see below).
- **Don't bake secrets into the file**: never hardcode API keys or tokens.
- **Never share CSS**: do not create shared CSS files or libraries. If you want to match styles across tools, always copy-paste the CSS directly into each tool's `<style>` block.

## Recommended repo structure

Until a site generator exists, assume a simple static layout:

- `index.html` – landing page listing tools (planned)
- `tools/` – each tool as `tools/<slug>.html` (planned)
- `lib/` – optional shared JS used by multiple tools (deliberate, small, stable)
- `assets/` – only if absolutely necessary (images, sample files, etc.)

If a future GitHub Pages setup requires a different structure (e.g. `/docs`), follow that, but keep tools as single `.html` files.

## Using `lib/` (shared JS) without turning this into a framework

Using a `lib/` folder is allowed, but should be **rare and intentional**.

Add (or extend) a file in `lib/` only when:

- The behavior is clearly **reusable by multiple tools** (rule of thumb: already used or imminently needed by **2+** tools).
- The abstraction is **small and stable** (utility-style functions, not “app frameworks”).
- The calling pattern is consistent (a clean API surface, not a tangle of tool-specific conditionals).

Do **not** add `lib/` code when:

- It’s only used by one tool (keep it inline).
- You’re guessing it might be reusable “someday”.
- It introduces a de-facto framework or complex cross-tool coupling.

If you do add shared code:

- Keep it **vanilla JS** (no transpilation).
- Keep it **dependency-light** and well-named.
- Prefer **copy/pasteability** of tools over over-abstraction.

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

## Maintaining the tools list

The `index.html` homepage automatically lists all available tools. This list is kept in sync via a script (`scripts/update-tools-list.js`).

**Before committing any changes that add, remove, or rename tools:**

1. Run the tool discovery script:
   ```bash
   node scripts/update-tools-list.js
   ```

2. Verify that `index.html` has been updated with the correct tools list.

3. Commit the updated `index.html` along with your tool changes.

A git pre-commit hook can be installed to automate this check. See the setup instructions in `scripts/install-pre-commit-hook.js`.

## Record prompts and provenance

When an agent creates or substantially modifies a tool:

- **Capture the origin**:
  - Add an HTML comment near the top with a short description and (if available) a link to the prompt/transcript.
  - If work was done via an agent session, include the transcript link in the eventual PR/commit message (when applicable).

- **Add a "View source" link** (recommended):
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
