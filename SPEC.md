# Color Support App Specification

## Overview

Generate 5 UI color palette patterns based on a seed color and user preferences.
Each palette contains 6 roles.

* Baseline guarantees WCAG AA contrast
* Other patterns relax constraints for expression

---

## Palette Patterns

* Baseline: Standard, safest structure (WCAG AA)
* Clarity: High readability & separation
* Expression: Strong visual identity
* Serene: Calm & low fatigue
* Impact: Bold & high contrast impression

---

## Color Roles (6)

* Primary Accent (＝ Seed Color)
* Secondary Accent
* Background
* Surface
* Text
* Border

---

## Input Parameters

### Seed Color

* HEX input
* Used as Primary Accent

### Direction Axes

* Warmth (-5 to +5)
* Saturation (-5 to +5)
* Depth (-5 to +5)

### Scene

* Web Page
* Mobile App
* Presentation
* Poster
* Magazine

### Background Mode

* Light
* Dark

### Priority Ratio (total = 100)

* Style
* Usability
* Accessibility

---

## Fixed Color Rules

Each role can be:

* fixed
* lightness adjustable
* saturation adjustable
* lightness + saturation adjustable

---

## Algorithm Requirements

### Step 1: Generate candidates

* Analogous
* Complementary
* Triadic
* Monochrome

### Step 2: Apply constraints

* Warmth → hue shift
* Saturation → saturation adjustment
* Depth → lightness adjustment

### Step 3: Evaluate

Scores:

* Style
* Usability
* Accessibility

Final Score:
weighted sum based on user ratio

---

## Accessibility

### WCAG

* Baseline: AA required (>= 4.5:1)
* Others: relaxed constraints

### Evaluation levels

* AAA (>=7)
* AA (>=4.5)
* Large AA (>=3)
* Fail

---

## UI Requirements

### Layout

* Left: controls
* Right: results (hidden until Generate)

---

### Scene Panel

Contains:

* Scene name
* Badge
* Full description (no truncation)
* Priority tags
* Active pattern description (integrated inside panel)

---

### Pattern Display

#### Structure

* 5 cards
* All cards share identical structure

#### Behavior

* Cards overlap horizontally
* Information is NOT reduced
* Only hidden by overlap (clipped)
* Hover expands target card

#### Card Content

* Pattern name
* Subtitle
* 6 color roles
* Preview
* Contrast metrics

---

## Design Principles

### Information

* Do not remove information
* Control visibility via layout only

### Consistency

* No alternate compact UI
* Same structure for all cards

### Usability

* Maintain listability even when overlapped

---

## Current Key Decisions

* Primary Accent = Seed Color
* UI accent color = gray (not blue)
* Scene description is fully visible (no ellipsis)
* Pattern description is inside Scene panel
* Cards = identical information, partially hidden by overlap

---

## Output

Return 5 palettes:

Each includes:

* 6 colors (HEX)
* role names
* contrast values
* grade (AA / AAA / Fail)
* explanation

---

## Future Enhancements

* Mock UI preview expansion
* Export functionality
* Design tool integration

---

End of specification
