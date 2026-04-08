# Palette Engine Specification

## Overview

Palette Engine generates five UI palette patterns from one seed color.
Each palette uses six role slots and is evaluated for text readability.

- Baseline keeps WCAG AA for core text pairs and enforces accent safety.
- Clarity strengthens readability posture.
- Expression / Serene / Impact prioritize expression while protecting core text pairs.

---

## Palette Patterns

- Baseline
- Clarity
- Expression
- Serene
- Impact

---

## Color Roles (6)

- Primary Accent (seed color anchor)
- Secondary Accent
- Background
- Surface
- Text
- Border

---

## Input Controls

### Scene

- Web Page
- Mobile App
- Presentation
- Poster
- Magazine

### Background Mode

- Light
- Dark

### Tone Controls

- Warmth (-5 to +5)
- Saturation (-5 to +5)
- Depth (-5 to +5)

### Priority Ratio (total = 100)

- Style
- Usability
- Accessibility

### Primary Accent Input

- Primary Accent is manually editable (color picker + HEX).
- Other roles are generated automatically by the palette engine.

---

## Generation Logic

### Base

- Seed is treated as the primary anchor.
- Scene and tone controls shift hue/saturation/lightness.
- Pattern policies apply different contrast and expression constraints.

### Constraint and Safety

- Primary Accent is treated as fixed seed input.
- Poster/Magazine apply print-safe adjustments (including approximate TAC reduction).
- Core text contrast is rechecked and corrected.
- Serene text is tuned into an AA band when possible.

### Output Grade

- AAA
- AA
- Text AA / Accent Free
- Large AA
- Fail

---

## Card UI

### Structure

Each card shows:

- Pattern name
- Grade badge
- 6 role rows (label + HEX)
- Scene preview mock
- Contrast metrics

### Behavior

- Five cards are stacked with overlap on desktop.
- Hover/focus activates a card.
- Narrow width uses Prev/Next navigation.

### Secondary Accent Shuffle (per card)

- A `Shuffle` action exists on the `Secondary Accent` row.
- On shuffle:
  - Primary Accent of that card is fixed.
  - Secondary Accent is re-proposed.
  - Background / Surface / Text / Border are recalculated from that condition.
- Only the selected card is updated.
- Other cards remain unchanged.

---

## Context Panel (right top)

Contains:

- Scene label
- Scene summary line (`badge + summary`)
- Active pattern note line (`Pattern + badge + note`)
- CVD mode button and temporary hint message

---

## Color Vision Simulation

Mode cycles via button:

- Normal
- P-type (Protanopia approximation)
- D-type (Deuteranopia approximation)

Displayed role colors are transformed per selected simulation mode.

---

## API Contract

### `GET /api/defaults?baseHex=%23RRGGBB` (URL-encoded `#`)

Returns default fixed-color rules for all roles.

### `POST /api/palettes`

Request includes:

- baseHex
- scene
- backgroundMode
- warmth / saturation / depth
- style / usability / accessibility
- fixedColors map

Response returns five palettes. Each palette includes:

- name
- description
- roles
- contrast summary
- grade
- accessibilityComment
- notes

---

## Layout and Style Decisions

- Left: controls
- Right: context + results (hidden until first generation)
- Flat, modern style (no shadows, no corner radius)
- Gray-focused UI accents
- Responsive desktop/mobile layout tuning

---

## About Page

- Separate `about.html` is linked under `Generate Palettes`.
- Includes table of contents anchors and demo video embedding.

---

End of specification
