# Palette Engine Specification

## Overview

Generate five UI palette patterns from one seed color and user controls.
Each palette uses six fixed role slots.

- Baseline keeps WCAG AA for core text pairs.
- Other patterns relax accent constraints for expression.

---

## Palette Patterns

- Baseline: safest default for production use
- Clarity: stronger readability and separation
- Expression: stronger visual identity
- Serene: softer, lower-fatigue direction
- Impact: bolder, higher-attention direction

---

## Color Roles (6)

- Primary Accent (Seed Color)
- Secondary Accent
- Background
- Surface
- Text
- Border

---

## Input Parameters

### Seed Color

- HEX input
- Used as Primary Accent

### Direction Axes

- Warmth (-5 to +5)
- Saturation (-5 to +5)
- Depth (-5 to +5)

### Scene

- Web Page
- Mobile App
- Presentation
- Poster
- Magazine

### Background Mode

- Light
- Dark

### Priority Ratio (total = 100)

- Style
- Usability
- Accessibility

---

## Fixed Color Rules

Each role can be:

- fixed
- lightness adjustable
- saturation adjustable
- lightness + saturation adjustable

---

## Algorithm Requirements

### Step 1: Generate candidates

- Analogous
- Complementary
- Triadic
- Monochrome

### Step 2: Apply constraints

- Warmth: hue shift
- Saturation: saturation adjustment
- Depth: lightness adjustment

### Step 3: Evaluate

Scores:

- Style
- Usability
- Accessibility

Final score:
weighted sum based on user ratio

---

## Accessibility

### WCAG

- Baseline: AA required (>= 4.5:1)
- Others: relaxed accent constraints

### Evaluation levels

- AAA (>= 7)
- AA (>= 4.5)
- Large AA (>= 3)
- Fail

---

## UI Requirements

### Layout

- Left: controls
- Right: results (hidden until Generate)

---

### Scene Panel

Contains:

- Context label
- Scene label + scene badge
- Baseline line with pattern badge and note text
- CVD simulation button

---

### Pattern Display

#### Structure

- 5 cards
- All cards share identical structure

#### Behavior

- Cards overlap horizontally
- Information is not removed by mode switching
- Visibility is controlled mainly by overlap and active state
- Hover/focus activates target card

#### Card Content

- Pattern name
- 6 color roles
- Scene preview
- Contrast metrics

---

## Design Principles

### Information

- Do not remove information
- Control visibility via structure

### Consistency

- Keep patterns comparable with the same card structure

### Usability

- Keep listability while preserving detail

---

## Current Key Decisions

- Primary Accent equals seed color
- UI accent tone uses gray
- Scene summary is fully visible (no ellipsis)
- Pattern explanation is shown in the context area
- Cards keep a shared structure across all patterns

---

## Output

Return five palettes.
Each palette includes:

- 6 role colors (HEX)
- role names
- contrast values
- grade (AAA / AA / Large AA / Fail)
- pattern note text

---

## Future Enhancements

- richer mock preview variations
- export features
- design tool integration

---

End of specification
