---
description: Refactor an HTML tool into clean, reusable modules
argument-hint: [tool-filename.html]
allowed-tools: Read, Write, AskUserQuestion
---

# Refactor HTML Tool into Reusable Modules

You are refactoring a single-file HTML tool from the HtmlTools project into clean, reusable modules.

## CRITICAL REQUIREMENTS

1. **KEEP FUNCTIONALITY IDENTICAL** - The refactored tool must work exactly the same way as the original
2. **NO MULTIPLE FILES** - All modules stay in the same HTML file as separate `<script>` blocks
3. **SHOW PLAN FIRST** - Present the planned modules to the user and get approval BEFORE making any changes
4. **COPY-PASTEABLE MODULES** - Each module should be generic enough to copy/paste into other tools

## Target File

Tool to refactor: **$ARGUMENTS**

If no filename provided, ask the user which tool to refactor.

## Workflow

### Phase 1: Analysis

1. Read the HTML tool file
2. Identify distinct, reusable chunks of functionality
3. Look for these common module types:
   - **Math/Geometry utilities** (coordinate conversion, path generation)
   - **UI enhancements** (drag-to-adjust inputs, visual pickers, widgets)
   - **Generic helpers** (copy-to-clipboard, file download, data serialization)
   - **Canvas/SVG helpers** (grid overlays, coordinate systems, element creation)
   - **Event handling patterns** (value display sync, input validation)

### Phase 2: Present Plan

**STOP and present the planned modules to the user in this format:**

```markdown
## Proposed Refactoring for [tool-name]

I've identified the following reusable modules:

### 1. [Module Name]
- **Functions**: `functionName()`, `anotherFunction()`
- **Purpose**: [What it does in 1-2 sentences]
- **Reusability**: [Where else this could be used]
- **Lines**: ~[estimated line count]

### 2. [Module Name]
...

**Total estimated additions**: ~[X] lines of documentation and structure
**Modules that could benefit other tools**: [list the most generally useful ones]

Should I proceed with this refactoring?
```

**Wait for user approval before proceeding.**

### Phase 3: Refactoring (Only after approval)

For each module, create a separate `<script>` block with:

1. **Module header comment** explaining what it does and where it can be reused:
   ```html
   <!-- MODULE: [Name]
        [Brief description of functionality]
        Copy this entire <script> block into any tool that needs [capability].
   -->
   ```

2. **JSDoc-style function documentation**:
   ```javascript
   /**
    * [Function description]
    * @param {type} paramName - Description
    * @returns {type} Description
    */
   ```

3. **Configuration options** with sensible defaults where applicable

4. **Generic, reusable code** - avoid hard-coding values specific to this tool

### Phase 4: Organization

Order the modules from most generic (low-level utilities) to most specific (application logic):

1. Math/geometry utilities (most reusable)
2. Generic helpers (clipboard, download, etc.)
3. UI enhancements (drag handlers, widgets)
4. Domain-specific helpers (SVG canvas, specific widgets)
5. Application logic (tool-specific code)

The final `<script>` block should be labeled:
```html
<!-- APPLICATION: [Tool Name] Main Logic
     This section contains the app-specific code that ties together the reusable modules above.
-->
```

### Phase 5: Verification

After refactoring, verify:
- [ ] File is valid HTML (no syntax errors)
- [ ] All functionality preserved (same inputs produce same outputs)
- [ ] Each module is documented
- [ ] Modules are ordered from generic to specific
- [ ] Each module is self-contained and copy-pasteable

## Example Module Structure

```html
<!-- MODULE: Clipboard Copy with Visual Feedback
     Generic copy-to-clipboard function with button state feedback.
     Works with any text content and any button element.
-->
<script>
    /**
     * Copy text to clipboard and show visual feedback on a button
     * @param {string} text - Text to copy
     * @param {HTMLElement} button - Button element to show feedback on
     * @param {Object} options - Configuration options
     * @param {string} options.successText - Text to show on success (default: 'Copied!')
     * @param {number} options.duration - How long to show feedback in ms (default: 2000)
     */
    function copyToClipboard(text, button, options = {}) {
        const {
            successText = 'Copied!',
            originalText = button.textContent,
            successClass = 'copied',
            duration = 2000
        } = options;

        navigator.clipboard.writeText(text).then(() => {
            button.textContent = successText;
            button.classList.add(successClass);
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove(successClass);
            }, duration);
        });
    }
</script>
```

## Output

After completing the refactoring, provide a summary:

```markdown
## Refactoring Complete

Extracted [N] reusable modules:
1. **[Module Name]** - [one-line description]
2. **[Module Name]** - [one-line description]
...

**Line count delta**: +[X] lines (original: [Y], refactored: [Z])

The increase comes from module documentation and clearer organization. Each module is now copy-pasteable into other HTML tools in this project.

**Most reusable modules for other tools**:
- [Module Name] - [where else it's useful]
- [Module Name] - [where else it's useful]
```

## Remember

- Keep functionality IDENTICAL
- Show the plan BEFORE executing
- Make modules generic and well-documented
- Everything stays in one HTML file
