# Palette Engine

Palette Engine is a Spring Boot app that generates a full six-role UI palette from one seed color.

## Current Features

- 5 pattern directions: `Baseline / Clarity / Expression / Serene / Impact`
- 6 color roles:
  - `Primary Accent` (seed anchor)
  - `Secondary Accent`
  - `Background / Surface / Text / Border`
- Control axes:
  - `Warmth / Saturation / Depth`
- Priority ratio (total 100):
  - `Style / Usability / Accessibility`
- Scene presets:
  - `Web Page / Mobile App / Presentation / Poster / Magazine`
- Background mode:
  - `Light / Dark`
- Per-role fixed rules:
  - `Fixed / Lightness only / Saturation only / Lightness + Saturation`
- Accessibility grading:
  - `AAA / AA / Text AA / Accent Free / Large AA / Fail`
- Card-specific `Secondary Accent` shuffle
  - Only the selected card is updated
- CVD simulation:
  - `Normal / P-type / D-type`
- About page:
  - `about.html` (table of contents + demo video)

## Tech Stack

- Java 17
- Spring Boot
- Maven
- Static frontend (`index.html`, `about.html`, `css`, `js`)

## Run

```bash
mvn spring-boot:run
```

Open:

```text
http://localhost:8080
```

## CORS (Render deployment)

Set allowed origins via env var:

```text
APP_CORS_ALLOWED_ORIGINS=https://<your-frontend>.onrender.com
```

For multiple origins, use comma-separated values:

```text
APP_CORS_ALLOWED_ORIGINS=https://<your-frontend>.onrender.com,https://<custom-domain>
```

## Frontend API base URL (optional)

When frontend and API are on different domains, set a global variable before loading `app.js`:

```html
<script>
  window.__API_BASE_URL__ = "https://<your-api>.onrender.com";
</script>
```

## Build

```bash
mvn clean package
```

## Main Paths

- Frontend:
  - `src/main/resources/static/index.html`
  - `src/main/resources/static/about.html`
  - `src/main/resources/static/css/style.css`
  - `src/main/resources/static/js/app.js`
- Backend:
  - `src/main/java/com/example/colorsupport/controller/PaletteController.java`
  - `src/main/java/com/example/colorsupport/service/PaletteService.java`

## API

- `GET /api/defaults?baseHex=%23RRGGBB` (URL-encoded `#`)
- `POST /api/palettes`
