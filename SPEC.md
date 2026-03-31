# Color Support App Specification

## Overview
Generate 5 UI color palette patterns based on a base color and user preferences.
Each palette contains 6 roles and follows WCAG AA contrast recommendations.

---

## Palette Patterns
- Baseline: Balanced & versatile
- Clarity: High readability
- Expression: Strong visual identity
- Serene: Soft & low fatigue
- Impact: Bold & eye-catching

---

## Color Roles (6)
- Base
- Background
- Surface
- Text
- Primary Accent
- Secondary Accent

---

## Input Parameters

### Base Color
- HEX input

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
- Warmth → hue shift
- Saturation → saturation adjustment
- Depth → lightness adjustment

### Step 3: Evaluate
Scores:
- Style
- Usability
- Accessibility

Final Score:
weighted sum based on user ratio

---

## Accessibility

### WCAG AA
- Text contrast >= 4.5:1

### Evaluation levels
- AAA (>=7)
- AA (>=4.5)
- Large AA (>=3)
- Fail

---

## Auto Fix Feature
If contrast < 4.5:
- adjust lightness of text first
- suggest % change

---

## Output
Return 5 palettes:
Each includes:
- 6 colors (HEX)
- role names
- contrast values
- grade (AA / AAA / Fail)
- explanation