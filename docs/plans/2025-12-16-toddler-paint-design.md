# Toddler Paint App - Design Document

**Date:** 2025-12-16
**Tool Name:** `toddler-paint.html`
**Purpose:** A simple, touch-friendly paint application for toddlers with bright colors, responsive controls, and multi-touch support.

---

## Design Overview

Single-file HTML application with embedded CSS and vanilla JavaScript. No external dependencies except optional CDN fonts. Deployed as static file (GitHub Pages compatible).

### Core Principles

- **Toddler-friendly:** Big buttons, bright colors, immediate visual feedback
- **Touch-optimized:** Primary use case is touchscreen devices
- **Simple interactions:** One brush type, 8 colors, size controls
- **Safe by design:** Gesture blocking prevents accidental interactions
- **Immersive option:** Fullscreen mode hides browser chrome and OS controls

---

## Visual Design

### Control Panel

**Position (adaptive to orientation):**
- Landscape: Vertical strip on left or right edge (short side)
- Portrait: Horizontal strip along top edge
- Solid white background panel for clear separation from canvas

**Button Layout (top to bottom / left to right):**

1. **8 Circular Color Buttons** (filled with paint colors)
   - Hot Pink (`#FF1493`)
   - Sky Blue (`#87CEEB`)
   - Lime Green (`#32CD32`)
   - Sunny Yellow (`#FFD700`)
   - Orange (`#FF8C00`)
   - Purple (`#9370DB`)
   - Brown (`#8B4513`)
   - Black (`#000000`)

2. **Visual Divider/Spacing**

3. **Rounded Square Control Buttons:**
   - **Bigger Button** - Green background
   - **Smaller Button** - Orange background
   - **Clear Button** - Red background

### Button Sizing & Appearance

- **Size:** Responsive - 15% of viewport's short dimension
- **Minimum:** 60px × 60px (toddler-friendly touch target)
- **Color buttons:** Perfect circles, filled with paint color
- **Control buttons:** Rounded squares with icons/text

### Selection Indicator

- **Active color button** shows:
  - Soft glow effect (box-shadow)
  - 10% scale increase
- Creates obvious, playful visual feedback

### Canvas Area

- **Background:** Off-white (`#F5F5DC`)
- **Fills:** Remaining viewport after control panel
- **Cursor:** Colored circle matching current brush (65% opacity preview)

---

## Interaction Model

### Painting

**Brush Behavior:**
- Circular brush stroke with smooth antialiased edges
- Opacity: 65% (allows layering for visual discovery)
- Overlapping strokes create darker/richer colors
- Size range: 20px to 150px diameter
- Size increments: 15px per Bigger/Smaller click
- Default starting size: 85px (middle of range)

**Multi-touch Support:**
- All simultaneous touches paint with current active color
- Each touch creates independent stroke
- If color changes mid-stroke, all active strokes switch to new color
- Unlimited simultaneous touches (device-limited)

**Cursor Preview:**
- Default cursor hidden on canvas
- Shows colored circle at touch/pointer position
- Circle diameter matches brush size
- Circle color matches currently selected color
- Semi-transparent preview (30% opacity) for visibility

### Controls

**Color Selection:**
- Tap any of the 8 color buttons to change active color
- Selected button shows glow + scale up effects
- Cursor immediately reflects new color
- All ongoing strokes switch to new color mid-stroke

**Brush Size:**
- **Bigger Button:** Increases size by 15px (up to 150px max)
- **Smaller Button:** Decreases size by 15px (down to 20px min)
- Cursor preview updates immediately
- Can tap repeatedly to reach desired size

**Clear Canvas:**
- **Clear Button:** Instantly wipes entire canvas to blank
- No undo (keeps it simple for toddlers)
- Accidental clears are difficult due to button position and size

### Initial State

- **Starting color:** Random from the 8 available colors
- **Starting size:** 85px (medium)
- **Canvas:** Blank, ready to paint

### Gesture Prevention

- **CSS `touch-action: none`** on canvas
- Prevents: pinch-zoom, double-tap zoom, pull-to-refresh, swipe
- Control panel allows normal button interaction

### Fullscreen Mode

- **Fullscreen Button:** Small icon in corner opposite to control panel
- **Visibility:** Shows when NOT fullscreen; hides when IN fullscreen
- **Entrance:** Click fullscreen button to enter immersive mode
- **Exit:** ESC key only (no button to accidentally tap)
- **Behavior:** Hides browser chrome, URL bar, system navigation
- **Implementation:** Uses Fullscreen API requesting full document
- **OS Gestures:** Fullscreen mode helps prevent OS-level gestures (app switching, notification drawer)

### Orientation Changes

- Canvas and panel reposition automatically on orientation change
- Painting persists during reorientation
- Control panel updates position (left/right in landscape, top in portrait)

---

## Canvas Management

- **Fresh Start:** New blank canvas on every page load
- **No Persistence:** Drawing does not save between sessions
- **No Undo/Redo:** Keeps interface simple

---

## Code Architecture

### Modules (Vanilla JavaScript)

Each module is a separate `<script>` block following HtmlTools patterns:

1. **MODULE: Canvas Setup & Management**
   - Initialize canvas context
   - Handle viewport resize and orientation changes
   - Clear canvas function
   - Maintain drawing state during reorientations

2. **MODULE: Brush Engine**
   - Draw circular strokes with specified opacity
   - Handle brush size changes
   - Render cursor preview circle

3. **MODULE: Multi-touch Paint Handler**
   - Track multiple simultaneous pointer events (Pointer Events API)
   - Map each active touch to stroke path
   - Handle color changes mid-stroke
   - Manage stroke lifecycle (start, move, end)

4. **MODULE: Control Panel UI**
   - Render buttons (color and control buttons)
   - Adaptive positioning (landscape vs portrait)
   - Button state management and visual feedback
   - Selection indicators (glow + scale)

5. **MODULE: Fullscreen Toggle**
   - Fullscreen button functionality
   - Toggle icon visibility based on fullscreen state
   - Handle fullscreen request/exit
   - Listen for ESC key to exit
   - Adapted from `toddler-time.html` pattern

6. **APPLICATION: Toddler Paint Bootstrap**
   - Initialize all modules
   - Set random starting color and medium brush size
   - Set up event listeners
   - Focus canvas for accessibility

### Technology Stack

- **Canvas 2D API:** Core drawing engine
- **Pointer Events API:** Multi-touch and mouse input
- **Fullscreen API:** Immersive mode
- **CSS:** Layout, responsive sizing, gesture prevention
- **Vanilla JavaScript:** No frameworks or build tools

### No External Dependencies

- Pure JavaScript - no jQuery, canvas libraries, or frameworks
- Optional: Google Fonts for kid-friendly typography (future enhancement)

---

## Accessibility & UX Notes

- Large buttons (minimum 60px) suitable for toddler fingers
- High contrast between colors and backgrounds
- Clear visual feedback for all interactions
- No keyboard navigation required (touch-first design)
- Fullscreen mode removes distracting UI elements
- ESC key as familiar exit mechanism

---

## File Structure

```
toddler-paint.html (single file)
├── <head>
│   ├── Meta tags (charset, viewport, description)
│   └── <style> (embedded CSS)
└── <body>
    ├── Canvas element
    ├── Control panel (buttons)
    ├── Fullscreen button
    └── <script> blocks (modules + app)
```

---

## Implementation Checklist

- [ ] Create `toddler-paint.html` file
- [ ] Implement Canvas Setup & Management module
- [ ] Implement Brush Engine module
- [ ] Implement Multi-touch Paint Handler module
- [ ] Implement Control Panel UI module
- [ ] Implement Fullscreen Toggle module
- [ ] Implement Application Bootstrap module
- [ ] Test on touch devices (phone, tablet)
- [ ] Test orientation changes
- [ ] Test fullscreen mode
- [ ] Test gesture prevention
- [ ] Add meta description tag
- [ ] Run `node scripts/update-tools-list.js` to register tool
- [ ] Commit tool and updated `index.html`

