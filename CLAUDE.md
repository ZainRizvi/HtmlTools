# Agent guide

This repository is for **single-file "HTML tools"**: useful little web apps that combine **HTML + CSS + JavaScript in one `.html` file** and can be hosted as static files (GitHub Pages or any static host).

These guidelines are based on Simon Willison's post: [Useful patterns for building HTML tools](https://simonwillison.net/2025/Dec/10/html-tools/)

## What we mean by "HTML tool"

An HTML tool is:

- **One file**: inline CSS + inline JS in a single `.html` file.
- **No build step**: no bundlers, no JSX compilation.
- **Small**: ideally a few hundred lines; easy to rewrite/refactor with an LLM.
- **Static-hostable**: should work from GitHub Pages or any static host.

A **Tool** is defined as any HTML file in the root directory of the repository that is not `index.html`. Each tool represents a standalone, single-file web application that can be discovered and listed on the site homepage.

## Repository structure

- **Root `.html` files** — each is a standalone tool (except `index.html`)
- **`index.html`** — Homepage listing all available tools (auto-generated)
- **`scripts/`** — Automation scripts
  - `update-tools-list.js` — Discovers tools and updates the tools list in `index.html`
  - `install-pre-commit-hook.js` — Installs a git pre-commit hook to auto-update the tools list
- **`lib/`** — Optional shared JS used by multiple tools (deliberate, small, stable)
- **`assets/`** — Only if absolutely necessary (images, sample files, etc.)
- **`.beads/`** — Task tracking database (managed by bd CLI)

## Task tracking with bd

This repository uses `bd` (beads) for dependency-aware task tracking. **NEVER use TodoWrite** - all task management must go through bd.

### Core workflow

- **Finding work**: `bd ready` shows issues with no blockers
- **Creating tasks**: `bd create --title="..." --type=task|bug|feature --priority=2`
  - Priority: 0-4 (0=critical, 2=medium, 4=backlog)
  - Use parallel subagents when creating multiple tasks
- **Claiming work**: `bd update <id> --status=in_progress`
- **Completing work**: `bd close <id1> <id2> ...` (close multiple at once)
- **Dependencies**: `bd dep add <issue> <depends-on>` (issue depends on depends-on)

### Session close checklist

**CRITICAL**: Before saying "done" or "complete", run this checklist:

```bash
git status              # check changes
git add <files>         # stage code
bd sync                 # commit beads changes
git commit -m "..."     # commit code
bd sync                 # commit any new beads changes
git push                # push to remote
```

Work is not done until pushed.

### Common commands

- `bd list --status=open` - All open issues
- `bd show <id>` - Detailed issue view
- `bd blocked` - Show blocked issues
- `bd stats` - Project health
- `bd sync` - Sync with remote (run at session end)

### Integration notes

- Git hooks are installed and auto-sync bd changes
- Sync branch configured: `beads-sync`
- Never manually edit `.beads/*.jsonl` files
- Use `bd doctor` to check for issues

## Non-negotiables

- **Single-file by default**: implement each tool as a single `.html` file with embedded `<style>` and `<script>` whenever practical.
- **Avoid React / frameworks that require compilation**: do not introduce React/JSX or a build pipeline.
- **No build step**: keep tools runnable as static files without bundling/transpilation.
- **Dependencies**:
  - Prefer **version-pinned CDN URLs** (e.g. cdnjs/jsDelivr) for third-party libraries.
  - You may use **repo-local shared JavaScript** from `lib/` when it meaningfully reduces duplication across tools (see below).
- **Don't bake secrets into the file**: never hardcode API keys or tokens.
- **Never share CSS**: do not create shared CSS files or libraries. If you want to match styles across tools, always copy-paste the CSS directly into each tool's `<style>` block.

## Using `lib/` (shared JS) without turning this into a framework

Using a `lib/` folder is allowed, but should be **rare and intentional**.

Add (or extend) a file in `lib/` only when:

- The behavior is clearly **reusable by multiple tools** (rule of thumb: already used or imminently needed by **2+** tools).
- The abstraction is **small and stable** (utility-style functions, not "app frameworks").
- The calling pattern is consistent (a clean API surface, not a tangle of tool-specific conditionals).

Do **not** add `lib/` code when:

- It's only used by one tool (keep it inline).
- You're guessing it might be reusable "someday".
- It introduces a de-facto framework or complex cross-tool coupling.

If you do add shared code:

- Keep it **vanilla JS** (no transpilation).
- Keep it **dependency-light** and well-named.
- Prefer **copy/pasteability** of tools over over-abstraction.

## Code organization and modularity

### Write modular, reusable code

Organize your JavaScript into separate `<script>` blocks, each representing a distinct module:

```html
<!-- MODULE: Clipboard Copy with Visual Feedback
     Generic copy-to-clipboard function with button state feedback.
     Copy this entire <script> block into any tool that needs this functionality.
-->
<script>
    function copyToClipboard(text, button, options = {}) {
        // Implementation...
    }
</script>

<!-- MODULE: File Download Helper
     Generic function to trigger downloads of any blob/file.
     Works with SVG, JSON, CSV, images, etc.
-->
<script>
    function downloadFile(content, filename, mimeType) {
        // Implementation...
    }
</script>

<!-- APPLICATION: My Tool Main Logic
     This section ties together the reusable modules above.
-->
<script>
    // Tool-specific code here
</script>
```

**Key principles:**

- **One module per `<script>` block** - Each block should have a single, clear responsibility
- **Order from generic to specific** - Start with utilities (math, clipboard, download), end with application logic
- **Self-contained modules** - Each block should be independently copy-pasteable
- **Document each module** - Header comment explaining what it does and where it can be reused

### Copy/pasting is encouraged

**Actively copy `<script>` blocks between tools** when you need similar functionality:

- ✅ **Do this**: Copy the entire "Clipboard Copy" module from one tool to another
- ✅ **Do this**: Browse other tools in this repo to find reusable modules
- ❌ **Avoid**: Creating `lib/` files for one-off functionality
- ❌ **Avoid**: Complex dependencies between tools

This repo prefers **copy-paste modularity** over shared libraries because:
- Each tool remains self-contained and easy to understand
- No risk of breaking Tool A when modifying Tool B
- Easy to customize copied code for specific needs
- Tools stay simple and auditable

**When to use `lib/` vs copy/paste:**
- Use `lib/` only when code is used by 2+ tools AND is stable
- Default to copy/paste for everything else
- It's okay to have slightly different versions of similar code in different tools

### Module documentation standards

**Module header comments:**

```html
<!-- MODULE: [Name]
     [Brief description of what this module does]
     Copy this entire <script> block into any tool that needs [specific capability].
-->
```

**Function documentation (JSDoc style):**

```javascript
/**
 * Convert polar coordinates to cartesian coordinates
 * @param {number} centerX - X coordinate of circle center
 * @param {number} centerY - Y coordinate of circle center
 * @param {number} radius - Distance from center
 * @param {number} angleInDegrees - Angle in degrees (0° = top, clockwise)
 * @returns {{x: number, y: number}} Cartesian coordinates
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    // Implementation...
}
```

### Write generic, configurable code

Make modules reusable by avoiding hard-coded values:

**❌ Bad: Hard-coded for one tool**
```javascript
function updateDisplay() {
    document.getElementById('radiusVal').textContent = radius + 'px';
    document.getElementById('angleVal').textContent = angle + '°';
}
```

**✅ Good: Generic and configurable**
```javascript
/**
 * Update a display element with a formatted value
 * @param {string} elementId - ID of the display element
 * @param {number} value - Value to display
 * @param {string} unit - Unit suffix (default: '')
 */
function updateDisplay(elementId, value, unit = '') {
    document.getElementById(elementId).textContent = value + unit;
}
```

**Use options objects with defaults:**

```javascript
function createWidget(container, options = {}) {
    const {
        width = 100,
        height = 100,
        color = '#000000',
        onChange = () => {}
    } = options;

    // Implementation using the options
}
```

## Tool UX patterns (high leverage)

- **Copy/paste first**:
  - Accept pasted input (URLs, text, rich text, images, files).
  - Provide clear "Copy to clipboard" buttons (especially for mobile).
  - Consider reading multiple clipboard formats from paste events.

- **Build debugging helpers when exploring browser capabilities**:
  - When you're uncertain what's available (clipboard data, file metadata, key events, CORS behavior), it's valid to build a small debug panel or even a separate debug tool.

- **Persist state in the URL when it's shareable**:
  - Use query params or `location.hash` to store state that should be bookmarkable/shareable.
  - Keep it reasonably compact; encode JSON if needed.

- **Use `localStorage` for larger state or secrets**:
  - Use `localStorage` for drafts, larger inputs, and **API keys**.
  - Ask for keys via `prompt()` or a dedicated settings UI, then store locally.
  - Provide a "Clear stored data" / "Forget key" action.

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

## Adding a new tool

1. Create a new `.html` file in the root directory with a descriptive kebab-case name (e.g., `my-tool.html`)
2. Build the tool as a single HTML file with embedded `<style>` and `<script>` tags
3. Add a `<meta name="description" content="...">` tag in the `<head>` with a single sentence describing what the tool does
4. Run `node scripts/update-tools-list.js` to update the homepage
5. Commit both your tool and the updated `index.html`

## Maintaining the tools list

The `index.html` homepage automatically lists all available tools. This list is kept in sync via a script (`scripts/update-tools-list.js`).

**Before committing any changes that add, remove, or rename tools:**

1. Run the tool discovery script:
   ```bash
   node scripts/update-tools-list.js
   ```

2. Verify that `index.html` has been updated with the correct tools list.

3. Commit the updated `index.html` along with your tool changes.

The script converts filenames to display names (e.g., `svg-arc-generator.html` → "SVG Arc Generator") and handles common acronyms (SVG, JSON, HTML, CSS, JS, XML, API, URL, QR, RGB) by uppercasing them.

A git pre-commit hook can be installed to automate this:
```bash
node scripts/install-pre-commit-hook.js
```

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

## Local preview

Open the `.html` file directly in a browser, or run a static server:

```bash
npx serve .
```

Use this when fetch/CORS behavior differs between `file://` and `http://`.

## Sync note

This file (`CLAUDE.md`) should be kept identical to `AGENTS.md` in this repo. Different AI systems read one vs. the other. If either file is updated, copy the contents to the other to maintain consistency.
