const ROLE_ORDER = [
  "PRIMARY_ACCENT",
  "SECONDARY_ACCENT",
  "BACKGROUND",
  "SURFACE",
  "TEXT",
  "BORDER"
];

const ROLE_LABELS = {
  PRIMARY_ACCENT: "Primary Accent",
  SECONDARY_ACCENT: "Secondary Accent",
  BACKGROUND: "Background",
  SURFACE: "Surface",
  TEXT: "Text",
  BORDER: "Border"
};

const ROLE_DESCRIPTIONS = {
  PRIMARY_ACCENT: "",
  SECONDARY_ACCENT: "Supporting accent that helps pattern separation and emphasis.",
  BACKGROUND: "Main canvas color.",
  SURFACE: "Cards, panels, and layered sections.",
  TEXT: "Primary readable text color.",
  BORDER: "Lines, dividers, and subtle UI boundaries."
};

const RULE_LABELS = {
  FIXED: "Fixed",
  LIGHTNESS: "Lightness only",
  SATURATION: "Saturation only",
  LIGHTNESS_SATURATION: "Lightness + Saturation"
};

const PATTERN_BADGES = {
  BASELINE: "Balanced & versatile",
  CLARITY: "High readability",
  EXPRESSION: "Strong visual identity",
  SERENE: "Soft & low fatigue",
  IMPACT: "Bold & eye-catching"
};

const SCENE_META = {
  WEB: {
    label: "Web Page",
    badge: "Readability-first",
    summary: "Optimized for sustained reading, stable hierarchy, and calm emphasis.",
    priorities: ["Long-form readability", "Stable layering", "Balanced accents"]
  },
  MOBILE: {
    label: "Mobile App",
    badge: "Dense UI ready",
    summary: "Designed for compact screens with clear tap emphasis and strong separation.",
    priorities: ["Small-text clarity", "Clear tap emphasis", "Sharper separation"]
  },
  PRESENTATION: {
    label: "Presentation",
    badge: "Projection-safe",
    summary: "Tuned for distance viewing with stronger grouping and high legibility.",
    priorities: ["Distance readability", "Clear grouping", "Stronger emphasis"]
  },
  POSTER: {
    label: "Poster",
    badge: "High impact",
    summary: "Built for immediate visual impact with bold accents and clear focal points.",
    priorities: ["Immediate impact", "Hero emphasis", "Bold accents"]
  },
  MAGAZINE: {
    label: "Magazine",
    badge: "Editorial balance",
    summary: "Balanced for editorial rhythm, comfortable reading, and tasteful accents.",
    priorities: ["Comfortable reading", "Gentle transitions", "Tasteful accents"]
  }
};

const CVD_MODES = ["NORMAL", "PROTAN", "DEUTAN"];

function apiUrl(path) {
  if (window.location.protocol === "file:") {
    return `http://localhost:8080/api${path}`;
  }
  return `/api${path}`;
}

const state = { fixedColors: {}, activePatternIndex: 0, palettes: [], cvdMode: "NORMAL", cvdHintTimer: null, secondaryShuffleLocks: new Set() };

const elements = {
  scene: document.getElementById("scene"),
  backgroundMode: document.getElementById("backgroundMode"),
  warmth: document.getElementById("warmth"),
  saturation: document.getElementById("saturation"),
  depth: document.getElementById("depth"),
  style: document.getElementById("style"),
  usability: document.getElementById("usability"),
  accessibility: document.getElementById("accessibility"),
  warmthValue: document.getElementById("warmthValue"),
  saturationValue: document.getElementById("saturationValue"),
  depthValue: document.getElementById("depthValue"),
  styleLabel: document.getElementById("styleLabel"),
  usabilityLabel: document.getElementById("usabilityLabel"),
  accessibilityLabel: document.getElementById("accessibilityLabel"),
  weightSummary: document.getElementById("weightSummary"),
  primaryRoleContainer: document.getElementById("primaryRoleContainer"),
  secondaryRolesContainer: document.getElementById("secondaryRolesContainer"),
  sceneHeadline: document.getElementById("sceneHeadline"),
  sceneBadge: document.getElementById("sceneBadge"),
  sceneSummary: document.getElementById("sceneSummary"),
  scenePriorities: document.getElementById("scenePriorities"),
  results: document.getElementById("results"),
  resultsColumn: document.getElementById("resultsColumn"),
  message: document.getElementById("message"),
  cardPrevBtn: document.getElementById("cardPrevBtn"),
  cardNextBtn: document.getElementById("cardNextBtn"),
  activePatternNote: document.getElementById("activePatternNote"),
  generateBtn: document.getElementById("generateBtn"),
  shuffleSeedBtn: document.getElementById("shuffleSeedBtn"),
  cvdModeBtn: document.getElementById("cvdModeBtn"),
  cvdHint: document.getElementById("cvdHint")
};

function normalizeHex(hex) {
  const value = (hex || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : null;
}

function setMessage(text = "", isError = false) {
  elements.message.textContent = text;
  elements.message.className = isError ? "message error" : "message";
}

function updateAxisLabels() {
  const warmth = Number(elements.warmth.value);
  const saturation = Number(elements.saturation.value);
  const depth = Number(elements.depth.value);
  elements.warmthValue.textContent = warmth > 0 ? `Warm +${warmth}` : warmth < 0 ? `Cool ${warmth}` : "Neutral";
  elements.saturationValue.textContent = saturation > 0 ? `Vivid +${saturation}` : saturation < 0 ? `Muted ${saturation}` : "Balanced";
  elements.depthValue.textContent = depth > 0 ? `Deep +${depth}` : depth < 0 ? `Light ${depth}` : "Balanced";
}

function updateWeightLabels() {
  elements.styleLabel.textContent = `${elements.style.value}%`;
  elements.usabilityLabel.textContent = `${elements.usability.value}%`;
  elements.accessibilityLabel.textContent = `${elements.accessibility.value}%`;
}

function rebalanceWeights(targetKey, newValue) {
  const current = {
    style: Number(elements.style.value),
    usability: Number(elements.usability.value),
    accessibility: Number(elements.accessibility.value)
  };
  current[targetKey] = Number(newValue);
  const restKeys = Object.keys(current).filter((key) => key !== targetKey);
  const restTotal = restKeys.reduce((sum, key) => sum + current[key], 0);
  const remaining = Math.max(0, 100 - current[targetKey]);

  if (restTotal === 0) {
    const split = Math.floor(remaining / restKeys.length);
    restKeys.forEach((key, index) => {
      current[key] = index === restKeys.length - 1 ? remaining - split * index : split;
    });
  } else {
    let assigned = 0;
    restKeys.forEach((key, index) => {
      if (index === restKeys.length - 1) {
        current[key] = remaining - assigned;
      } else {
        const value = Math.round((current[key] / restTotal) * remaining);
        current[key] = value;
        assigned += value;
      }
    });
  }

  elements.style.value = String(current.style);
  elements.usability.value = String(current.usability);
  elements.accessibility.value = String(current.accessibility);
  updateWeightLabels();
}

async function loadDefaults(seedHex) {
  const response = await fetch(`${apiUrl("/defaults")}?baseHex=${encodeURIComponent(seedHex)}`);
  if (!response.ok) throw new Error("Failed to load default role colors.");
  const data = await response.json();
  state.fixedColors = data.fixedColors || {};
  renderFixedColors();
}

function roleCardMarkup(role, config) {
  const enabled = !!(config && config.enabled);
  return `
    <div class="fixed-color-card">
      <div class="role-top">
        <div>
          <h3>${ROLE_LABELS[role]}</h3>
          ${ROLE_DESCRIPTIONS[role] ? `<p>${ROLE_DESCRIPTIONS[role]}</p>` : ""}
        </div>
        <button class="toggle-pin ${enabled ? "is-on" : ""}" type="button" data-action="toggle" aria-pressed="${enabled ? "true" : "false"}">
          <span class="toggle-label">Pinned</span>
          <span class="toggle-switch" aria-hidden="true"></span>
        </button>
      </div>
      <div class="role-row">
        <input type="color" data-field="hexColor" value="${(config && config.hex) || "#000000"}">
        <input type="text" data-field="hexText" value="${(config && config.hex) || "#000000"}" maxlength="7">
        <select data-field="rule" class="inline-select role-select">
          ${Object.entries(RULE_LABELS).map(([value, label]) => `<option value="${value}" ${config && config.rule === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
    </div>
  `;
}

function attachRoleCardEvents(container, role, config) {
  container.querySelector('[data-action="toggle"]').addEventListener("click", () => {
    config.enabled = !config.enabled;
    renderFixedColors();
  });
  container.querySelector('[data-field="hexColor"]').addEventListener("input", (event) => {
    config.hex = event.target.value.toLowerCase();
    container.querySelector('[data-field="hexText"]').value = config.hex;
  });
  container.querySelector('[data-field="hexText"]').addEventListener("change", (event) => {
    const normalized = normalizeHex(event.target.value);
    if (!normalized) {
      event.target.value = config.hex;
      return;
    }
    config.hex = normalized;
    container.querySelector('[data-field="hexColor"]').value = normalized;
    event.target.value = normalized;
  });
  container.querySelector('[data-field="rule"]').addEventListener("change", (event) => {
    config.rule = event.target.value;
  });
}

function renderFixedColors() {
  elements.primaryRoleContainer.innerHTML = "";
  elements.secondaryRolesContainer.innerHTML = "";

  const primaryRole = "PRIMARY_ACCENT";
  const primaryConfig = state.fixedColors[primaryRole];
  const primaryWrapper = document.createElement("div");
  primaryWrapper.innerHTML = roleCardMarkup(primaryRole, primaryConfig);
  const primaryCard = primaryWrapper.firstElementChild;
  attachRoleCardEvents(primaryCard, primaryRole, primaryConfig);
  elements.primaryRoleContainer.appendChild(primaryCard);

  ROLE_ORDER.filter((role) => role !== "PRIMARY_ACCENT").forEach((role) => {
    const config = state.fixedColors[role];
    const wrapper = document.createElement("div");
    wrapper.innerHTML = roleCardMarkup(role, config);
    const card = wrapper.firstElementChild;
    attachRoleCardEvents(card, role, config);
    elements.secondaryRolesContainer.appendChild(card);
  });
}

function getReadableTextColor(hex) {
  return contrastRatio(hex, "#ffffff") > contrastRatio(hex, "#111111") ? "#ffffff" : "#111111";
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastLabel(ratio) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "Large AA only";
  return "Fail";
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToHex(rgb) {
  return `#${clampByte(rgb.r).toString(16).padStart(2, "0")}${clampByte(rgb.g).toString(16).padStart(2, "0")}${clampByte(rgb.b).toString(16).padStart(2, "0")}`;
}

function rgbToHsl(rgb) {
  const r = clampByte(rgb.r) / 255;
  const g = clampByte(rgb.g) / 255;
  const b = clampByte(rgb.b) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = 60 * (((g - b) / d) % 6);
        break;
      case g:
        h = 60 * ((b - r) / d + 2);
        break;
      default:
        h = 60 * ((r - g) / d + 4);
        break;
    }
  }

  if (h < 0) h += 360;
  return { h, s, l };
}

function hslToRgb(hsl) {
  const h = ((hsl.h % 360) + 360) % 360;
  const s = Math.max(0, Math.min(1, hsl.s));
  const l = Math.max(0, Math.min(1, hsl.l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: (r1 + m) * 255,
    g: (g1 + m) * 255,
    b: (b1 + m) * 255
  };
}

function randomSecondaryAccentHex(primaryHex) {
  const baseHsl = rgbToHsl(hexToRgb(primaryHex));
  const direction = Math.random() < 0.5 ? -1 : 1;
  const offset = 55 + Math.floor(Math.random() * 95);
  const h = (baseHsl.h + direction * offset + 360) % 360;
  const s = Math.max(0.42, Math.min(0.82, baseHsl.s + (Math.random() * 0.28 - 0.08)));
  const l = Math.max(0.35, Math.min(0.66, baseHsl.l + (Math.random() * 0.22 - 0.08)));
  return rgbToHex(hslToRgb({ h, s, l }));
}

function simulateCvdHex(hex, mode) {
  if (mode === "NORMAL") return hex;

  const { r, g, b } = hexToRgb(hex);
  const m = mode === "PROTAN"
    ? [
        [0.56667, 0.43333, 0.0],
        [0.55833, 0.44167, 0.0],
        [0.0, 0.24167, 0.75833]
      ]
    : [
        [0.625, 0.375, 0.0],
        [0.7, 0.3, 0.0],
        [0.0, 0.3, 0.7]
      ];

  return rgbToHex({
    r: m[0][0] * r + m[0][1] * g + m[0][2] * b,
    g: m[1][0] * r + m[1][1] * g + m[1][2] * b,
    b: m[2][0] * r + m[2][1] * g + m[2][2] * b
  });
}

function displayRolesForMode(roles) {
  const out = {};
  Object.entries(roles || {}).forEach(([role, hex]) => {
    out[role] = simulateCvdHex(hex, state.cvdMode);
  });
  return out;
}

function updateCvdButtonLabel() {
  if (!elements.cvdModeBtn) return;
  elements.cvdModeBtn.textContent =
    state.cvdMode === "NORMAL" ? "CVD: Normal"
      : state.cvdMode === "PROTAN" ? "CVD: P-type"
      : "CVD: D-type";
}

function cycleCvdMode() {
  const idx = CVD_MODES.indexOf(state.cvdMode);
  state.cvdMode = CVD_MODES[(idx + 1) % CVD_MODES.length];
  updateCvdButtonLabel();
  hideCvdHint();
  refreshResultsForCurrentScene();
}

function scrollToTopOnDesktop() {
  if (window.innerWidth <= 1200) return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideCvdHint() {
  if (!elements.cvdHint) return;
  elements.cvdHint.classList.remove("show");
  if (state.cvdHintTimer) {
    clearTimeout(state.cvdHintTimer);
    state.cvdHintTimer = null;
  }
}

function showCvdHint() {
  if (!elements.cvdHint) return;
  hideCvdHint();
  elements.cvdHint.classList.add("show");
  state.cvdHintTimer = setTimeout(() => {
    elements.cvdHint.classList.remove("show");
    state.cvdHintTimer = null;
  }, 5000);
}

function gradeClassName(grade) {
  if (grade === "AAA") return "grade-AAA";
  if (grade === "AA") return "grade-AA";
  if (grade === "Large AA") return "grade-LargeAA";
  if (grade === "Text AA / Accent Free") return "grade-TextAA";
  return "grade-Fail";
}

function formatRatio(value) {
  return `${Number(value).toFixed(2)}:1`;
}

function updateScenePanel() {
  const meta = SCENE_META[elements.scene.value];
  elements.sceneHeadline.textContent = meta.label;
  elements.sceneBadge.textContent = meta.badge;
  elements.sceneSummary.innerHTML = `${meta.label} <span class="context-badge">${meta.badge}</span>：${meta.summary}`;
  elements.scenePriorities.innerHTML = meta.priorities.map((item) => `<li>${item}</li>`).join("");
}

function refreshResultsForCurrentScene() {
  if (!state.palettes.length) return;
  renderResults(state.palettes);
}

function handleSceneChange() {
  updateScenePanel();
  refreshResultsForCurrentScene();
}

function scenePreviewMarkup(scene, roles) {
  const text = roles.TEXT;
  const bg = roles.BACKGROUND;
  const surface = roles.SURFACE;
  const primary = roles.PRIMARY_ACCENT;
  const secondary = roles.SECONDARY_ACCENT;
  const border = roles.BORDER;
  const primaryText = getReadableTextColor(primary);

  if (scene === "WEB") {
    return `<div class="preview-shell preview-web" style="background:${bg};"><div class="web-nav" style="background:${surface}; color:${text}; border-color:${border};"><div class="web-brand" style="color:${primary};">Studio</div><div class="web-links"><span>About</span><span>Work</span><span>Contact</span></div></div><div class="web-hero" style="background:${surface}; border-color:${border};"><div class="web-copy"><div class="preview-kicker" style="color:${secondary};">Web Page</div><h3 style="color:${text};">Readable layout with clear hierarchy.</h3><p style="color:${text};">The seed color now lives in Primary Accent, so the palette structure is easier to understand.</p><div class="preview-actions"><button class="secondary-button" style="background:${primary}; color:${primaryText}; border-color:${primary};">Primary</button><button class="secondary-button ghost" style="color:${secondary}; border-color:${secondary};">Secondary</button></div></div></div></div>`;
  }
  if (scene === "MOBILE") {
    return `<div class="preview-shell preview-mobile" style="background:${bg};"><div class="phone-frame" style="background:${surface}; border-color:${border};"><div class="phone-notch" style="background:${text};"></div><div class="phone-status" style="color:${text};"><span>9:41</span><span style="color:${primary};">5G 96%</span></div><div class="phone-appbar" style="border-color:${border}; color:${text};"><span>Color Feed</span><span class="phone-dot" style="background:${primary};"></span></div><div class="phone-story-row"><span style="background:${primary};"></span><span style="background:${secondary};"></span><span style="background:${border};"></span></div><div class="phone-card phone-hero" style="background:${bg}; border-color:${border};"><div class="preview-kicker" style="color:${secondary};">Mobile App</div><h3 style="color:${text};">Thumb-first interface with clear focus.</h3><p style="color:${text};">Cards and actions are sized for one-handed use and quick scanning.</p></div><div class="phone-list"><div class="phone-list-row" style="border-color:${border};"><span style="color:${text};">Recommended palette</span><strong style="color:${primary};">New</strong></div><div class="phone-list-row" style="border-color:${border};"><span style="color:${text};">Saved combinations</span><strong style="color:${secondary};">12</strong></div></div><button class="phone-cta" style="background:${primary}; color:${primaryText};">Apply Theme</button></div></div>`;
  }
  if (scene === "PRESENTATION") {
    return `<div class="preview-shell preview-presentation" style="background:${bg};"><div class="slide-frame" style="background:${surface}; border-color:${border};"><div class="slide-topbar" style="background:${primary}; color:${primaryText};">Quarterly Strategy</div><div class="slide-content"><div class="slide-left"><div class="preview-kicker" style="color:${secondary};">Presentation</div><h3 style="color:${text};">High-contrast messaging for distant viewing.</h3><p style="color:${text};">Clearer roles make the preview easier to understand while keeping pattern intent intact.</p></div><div class="slide-chart"><div class="bar" style="height:56%; background:${secondary};"></div><div class="bar" style="height:82%; background:${primary};"></div><div class="bar" style="height:68%; background:${border};"></div></div></div></div></div>`;
  }
  if (scene === "POSTER") {
    return `<div class="preview-shell preview-poster" style="background:${bg};"><div class="poster-stage" style="border-color:${border};"><div class="poster-glow" style="background:${primary};"></div><div class="poster-content"><div class="preview-kicker" style="color:${secondary};">Poster</div><h3 style="color:${text};">Bold hierarchy with immediate visual pull.</h3><p style="color:${text};">The chosen seed color is now directly reflected in the main hero accent.</p></div></div></div>`;
  }
  return `<div class="preview-shell preview-magazine" style="background:${bg};"><div class="magazine-frame" style="background:${surface}; border-color:${border};"><div class="magazine-masthead" style="border-color:${border}; color:${text};"><span class="magazine-issue">Issue 42</span><span class="magazine-title" style="color:${primary};">CITY TONES</span></div><div class="magazine-grid"><div class="magazine-column"><div class="preview-kicker" style="color:${secondary};">Magazine</div><h3 style="color:${text};">Editorial rhythm with stronger hierarchy.</h3><p style="color:${text};">Lead story, supporting column, and pull-quote mimic a real magazine spread.</p><p class="magazine-byline" style="color:${secondary};">By Color Desk</p></div><div class="magazine-side"><div class="magazine-photo" style="background:${primary};"><div class="magazine-badge" style="background:${bg}; color:${secondary}; border-color:${border};">Cover Story</div></div><blockquote class="magazine-quote" style="color:${text}; border-color:${border};">Contrast drives attention, whitespace keeps the page readable.</blockquote></div></div></div></div>`;
}

function patternNoteSummary(palette) {
  return translatePatternNotes((palette.notes || []).join(" "));
}

function updateActivePatternNote() {
  const palette = state.palettes[state.activePatternIndex];
  if (!palette) {
    elements.activePatternNote.innerHTML = "";
    return;
  }
  const badge = PATTERN_BADGES[palette.name] || "";
  elements.activePatternNote.innerHTML = `${toTitleCase(palette.name)} <span class="context-badge">${badge}</span>：${patternNoteSummary(palette)}`;
}

function updateStackLayout() {
  const stack = elements.results;
  if (!stack) return;

  const width = stack.clientWidth;
  if (width <= 0) return;

  const activeWidth = Math.max(320, Math.min(width * 0.34, 520));
  const inactiveWidth = Math.max(190, Math.min((width - activeWidth) / 4 + 48, 360));
  const overlap = Math.max(28, Math.min((inactiveWidth * 4 + activeWidth - width) / 4, 120));

  stack.style.setProperty("--stack-active-width", `${activeWidth}px`);
  stack.style.setProperty("--stack-inactive-width", `${inactiveWidth}px`);
  stack.style.setProperty("--stack-overlap", `${overlap}px`);
}

function updateCardNavState() {
  const disabled = state.palettes.length <= 1;
  if (elements.cardPrevBtn) elements.cardPrevBtn.disabled = disabled;
  if (elements.cardNextBtn) elements.cardNextBtn.disabled = disabled;
}

function shiftActiveCard(delta) {
  const total = state.palettes.length;
  if (!total) return;
  state.activePatternIndex = (state.activePatternIndex + delta + total) % total;
  renderResults(state.palettes);
}

function renderResults(palettes) {
  state.palettes = palettes || [];
  elements.results.innerHTML = "";

  state.palettes.forEach((palette, index) => {
    const card = document.createElement("article");
    card.className = `palette-card stack-card ${index === state.activePatternIndex ? "active" : ""}`;
    card.tabIndex = 0;
    const displayRoles = displayRolesForMode(palette.roles);

    const roleRows = ROLE_ORDER.map((role) => {
      const hex = displayRoles[role];
      const label = role === "SECONDARY_ACCENT"
        ? `<span class="role-label-with-action"><span>${ROLE_LABELS[role]}</span><button type="button" class="secondary-shuffle-btn" data-action="shuffle-secondary" data-index="${index}">Shuffle</button></span>`
        : `<span>${ROLE_LABELS[role]}</span>`;
      return `<div class="color-row-display" style="background:${hex};color:${getReadableTextColor(hex)};">${label}<span>${hex}</span></div>`;
    }).join("");

    card.innerHTML = `
      <div class="stack-content">
        <div class="palette-header">
          <div>
            <h2>${toTitleCase(palette.name)}</h2>
          </div>
          <span class="grade-badge ${gradeClassName(palette.grade)}">${palette.grade}</span>
        </div>
        <div class="color-stack">${roleRows}</div>
        <div class="preview-area">
          ${scenePreviewMarkup(elements.scene.value, displayRoles)}
        </div>
        <div class="meta-block">
          <div class="meta-card">
            <h4>Contrast</h4>
            <ul class="contrast-list">
              <li>Text / Background: ${formatRatio(palette.contrast.textOnBackground)} / ${contrastLabel(palette.contrast.textOnBackground)}</li>
              <li>Text / Surface: ${formatRatio(palette.contrast.textOnSurface)} / ${contrastLabel(palette.contrast.textOnSurface)}</li>
              <li>Primary / Background: ${formatRatio(palette.contrast.primaryOnBackground)}</li>
              <li>Secondary / Background: ${formatRatio(palette.contrast.secondaryOnBackground)}</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    const activate = () => {
      state.activePatternIndex = index;
      [...elements.results.children].forEach((el, i) => {
        el.classList.toggle("active", i === index);
      });
      updateActivePatternNote();
    };
    card.addEventListener("mouseenter", activate);
    card.addEventListener("focus", activate);
    card.addEventListener("click", activate);
    const shuffleBtn = card.querySelector('[data-action="shuffle-secondary"]');
    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        shuffleSecondaryForCard(index);
      });
    }
    elements.results.appendChild(card);
  });

  updateActivePatternNote();
  updateStackLayout();
  updateCardNavState();
}

function translatePatternNotes(text) {
  return text || "";
}

function toTitleCase(value) {
  return String(value || "").toLowerCase().replace(/(^|_)([a-z])/g, (_, p1, p2) => `${p1 ? " " : ""}${p2.toUpperCase()}`);
}

function collectRequest() {
  const seedHex = normalizeHex(state.fixedColors.PRIMARY_ACCENT?.hex);
  if (!seedHex) throw new Error("Primary Accent (Seed Color) must be a valid 6-digit hex value such as #4f46e5.");
  return {
    baseHex: seedHex,
    scene: elements.scene.value,
    backgroundMode: elements.backgroundMode.value,
    warmth: Number(elements.warmth.value),
    saturation: Number(elements.saturation.value),
    depth: Number(elements.depth.value),
    style: Number(elements.style.value),
    usability: Number(elements.usability.value),
    accessibility: Number(elements.accessibility.value),
    fixedColors: state.fixedColors
  };
}

async function generatePalettes() {
  try {
    setMessage("");
    updateScenePanel();
    const request = collectRequest();
    const response = await fetch(apiUrl("/palettes"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to generate palettes.");
    elements.resultsColumn.classList.remove("hidden");
    state.activePatternIndex = 0;
    renderResults(data.palettes || []);
    scrollToTopOnDesktop();
    showCvdHint();
  } catch (error) {
    elements.resultsColumn.classList.remove("hidden");
    if (error instanceof TypeError && String(error.message || "").includes("Failed to fetch")) {
      setMessage("Failed to fetch API. Run Spring Boot on http://localhost:8080 and open the app via that URL.", true);
      return;
    }
    setMessage(error.message || "Unexpected error.", true);
  }
}

function randomizeSeedColor() {
  const current = normalizeHex(state.fixedColors.PRIMARY_ACCENT?.hex) || "#4f46e5";
  const num = parseInt(current.slice(1), 16);
  const rotated = (num + 0x224466) % 0xffffff;
  const next = `#${rotated.toString(16).padStart(6, "0")}`;
  state.fixedColors.PRIMARY_ACCENT.hex = next;
  renderFixedColors();
}

function bindEvents() {
  elements.scene.addEventListener("change", handleSceneChange);
  elements.backgroundMode.addEventListener("change", updateScenePanel);
  elements.warmth.addEventListener("input", updateAxisLabels);
  elements.saturation.addEventListener("input", updateAxisLabels);
  elements.depth.addEventListener("input", updateAxisLabels);
  elements.style.addEventListener("input", (e) => rebalanceWeights("style", e.target.value));
  elements.usability.addEventListener("input", (e) => rebalanceWeights("usability", e.target.value));
  elements.accessibility.addEventListener("input", (e) => rebalanceWeights("accessibility", e.target.value));
  elements.generateBtn.addEventListener("click", generatePalettes);
  elements.shuffleSeedBtn.addEventListener("click", randomizeSeedColor);
  if (elements.cardPrevBtn) elements.cardPrevBtn.addEventListener("click", () => shiftActiveCard(-1));
  if (elements.cardNextBtn) elements.cardNextBtn.addEventListener("click", () => shiftActiveCard(1));
  if (elements.cvdModeBtn) {
    elements.cvdModeBtn.addEventListener("click", cycleCvdMode);
  }
  window.addEventListener("resize", updateStackLayout);
}

async function shuffleSecondaryForCard(index) {
  const palette = state.palettes[index];
  if (!palette || state.secondaryShuffleLocks.has(index)) return;

  state.secondaryShuffleLocks.add(index);
  try {
    const request = collectRequest();
    const primaryHex = (palette.roles && palette.roles.PRIMARY_ACCENT) || request.baseHex;
    const secondaryHex = randomSecondaryAccentHex(primaryHex);
    const fixedColors = JSON.parse(JSON.stringify(request.fixedColors || {}));

    fixedColors.PRIMARY_ACCENT = {
      ...(fixedColors.PRIMARY_ACCENT || {}),
      enabled: true,
      hex: primaryHex,
      rule: "FIXED"
    };
    fixedColors.SECONDARY_ACCENT = {
      ...(fixedColors.SECONDARY_ACCENT || {}),
      enabled: true,
      hex: secondaryHex,
      rule: "FIXED"
    };
    request.fixedColors = fixedColors;

    const response = await fetch(apiUrl("/palettes"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to shuffle Secondary Accent.");

    const updated = (data.palettes || []).find((item) => item.name === palette.name);
    if (!updated) throw new Error("Updated palette was not returned.");

    state.palettes[index] = updated;
    state.activePatternIndex = index;
    renderResults(state.palettes);
    setMessage(`${toTitleCase(palette.name)} Secondary Accent updated.`);
  } catch (error) {
    setMessage(error.message || "Failed to shuffle Secondary Accent.", true);
  } finally {
    state.secondaryShuffleLocks.delete(index);
  }
}

async function init() {
  bindEvents();
  updateAxisLabels();
  updateWeightLabels();
  updateScenePanel();
  updateCvdButtonLabel();
  updateStackLayout();
  try {
    await loadDefaults("#4f46e5");
  } catch (error) {
    elements.resultsColumn.classList.remove("hidden");
    setMessage(error.message || "Failed to initialize app.", true);
  }
}

init();
