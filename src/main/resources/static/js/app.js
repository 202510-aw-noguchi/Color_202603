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
  PRIMARY_ACCENT: "Seed Color · the user-selected anchor color for the palette.",
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

const SCENE_META = {
  WEB: {
    label: "Web Page",
    badge: "Readability-first",
    summary: "読みやすさと情報整理を優先した、標準的で安定感のある構成です。",
    priorities: ["Long-form readability", "Stable layering", "Balanced accents"]
  },
  MOBILE: {
    label: "Mobile App",
    badge: "Dense UI ready",
    summary: "小さな部品でも見分けやすく、情報密度の高い画面でも使いやすい構成です。",
    priorities: ["Small-text clarity", "Clear tap emphasis", "Sharper separation"]
  },
  PRESENTATION: {
    label: "Presentation",
    badge: "Projection-safe",
    summary: "遠くからでも読みやすいように、文字と強調要素の視認性を高めた構成です。",
    priorities: ["Distance readability", "Clear grouping", "Stronger emphasis"]
  },
  POSTER: {
    label: "Poster",
    badge: "High impact",
    summary: "第一印象の強さを重視し、主役となる色の存在感を引き上げた構成です。",
    priorities: ["Immediate impact", "Hero emphasis", "Bold accents"]
  },
  MAGAZINE: {
    label: "Magazine",
    badge: "Editorial balance",
    summary: "読み物としての落ち着きと、誌面らしい上品なアクセントの両立を狙った構成です。",
    priorities: ["Comfortable reading", "Gentle transitions", "Tasteful accents"]
  }
};

const state = { fixedColors: {}, activePatternIndex: 0, palettes: [] };

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
  activePatternNote: document.getElementById("activePatternNote"),
  generateBtn: document.getElementById("generateBtn"),
  shuffleSeedBtn: document.getElementById("shuffleSeedBtn")
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
  const entries = [
    { label: "Style", value: Number(elements.style.value) },
    { label: "Usability", value: Number(elements.usability.value) },
    { label: "Accessibility", value: Number(elements.accessibility.value) }
  ].sort((a, b) => b.value - a.value);
  elements.weightSummary.textContent = `${entries[0].label} leads, followed by ${entries[1].label}.`;
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
  const response = await fetch(`/api/defaults?baseHex=${encodeURIComponent(seedHex)}`);
  if (!response.ok) throw new Error("Failed to load default role colors.");
  const data = await response.json();
  state.fixedColors = data.fixedColors || {};
  renderFixedColors();
}

function roleCardMarkup(role, config) {
  return `
    <div class="fixed-color-card ${role === "PRIMARY_ACCENT" ? "seed-card" : ""}">
      <div class="role-top">
        <div>
          <h3>${ROLE_LABELS[role]}${role === "PRIMARY_ACCENT" ? ' <span class="seed-pill">Seed</span>' : ""}</h3>
          <p>${ROLE_DESCRIPTIONS[role]}</p>
        </div>
        <button class="mini-button" type="button" data-action="toggle">${config && config.enabled ? "Pinned" : "Open"}</button>
      </div>
      <div class="role-row">
        <input type="color" data-field="hexColor" value="${(config && config.hex) || "#000000"}">
        <input type="text" data-field="hexText" value="${(config && config.hex) || "#000000"}" maxlength="7">
        <select data-field="rule">
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
  elements.sceneSummary.textContent = meta.summary;
  elements.scenePriorities.innerHTML = meta.priorities.map((item) => `<li>${item}</li>`).join("");
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
    return `<div class="preview-shell preview-mobile" style="background:${bg};"><div class="phone-frame" style="background:${surface}; border-color:${border};"><div class="phone-status" style="color:${text};"><span>9:41</span><span style="color:${primary};">● ● ●</span></div><div class="phone-card phone-hero" style="background:${bg}; border-color:${border};"><div class="preview-kicker" style="color:${secondary};">Mobile App</div><h3 style="color:${text};">Quick scanning on compact screens.</h3><p style="color:${text};">Primary Accent doubles as the seed color, reducing confusion in the controls.</p></div><button class="phone-cta" style="background:${primary}; color:${primaryText};">Continue</button></div></div>`;
  }
  if (scene === "PRESENTATION") {
    return `<div class="preview-shell preview-presentation" style="background:${bg};"><div class="slide-frame" style="background:${surface}; border-color:${border};"><div class="slide-topbar" style="background:${primary}; color:${primaryText};">Quarterly Strategy</div><div class="slide-content"><div class="slide-left"><div class="preview-kicker" style="color:${secondary};">Presentation</div><h3 style="color:${text};">High-contrast messaging for distant viewing.</h3><p style="color:${text};">Clearer roles make the preview easier to understand while keeping pattern intent intact.</p></div><div class="slide-chart"><div class="bar" style="height:56%; background:${secondary};"></div><div class="bar" style="height:82%; background:${primary};"></div><div class="bar" style="height:68%; background:${border};"></div></div></div></div></div>`;
  }
  if (scene === "POSTER") {
    return `<div class="preview-shell preview-poster" style="background:${bg};"><div class="poster-stage" style="border-color:${border};"><div class="poster-glow" style="background:${primary};"></div><div class="poster-content"><div class="preview-kicker" style="color:${secondary};">Poster</div><h3 style="color:${text};">Bold hierarchy with immediate visual pull.</h3><p style="color:${text};">The chosen seed color is now directly reflected in the main hero accent.</p></div></div></div>`;
  }
  return `<div class="preview-shell preview-magazine" style="background:${bg};"><div class="magazine-frame" style="background:${surface}; border-color:${border};"><div class="magazine-column"><div class="preview-kicker" style="color:${secondary};">Magazine</div><h3 style="color:${text};">Editorial rhythm with calmer emphasis.</h3><p style="color:${text};">Seed and fixed-role controls are now merged into one simpler color roles section.</p></div><div class="magazine-photo" style="background:${primary};"><div class="magazine-badge" style="background:${bg}; color:${secondary}; border-color:${border};">Feature</div></div></div></div>`;
}

function patternNoteSummary(palette) {
  return translatePatternNotes((palette.notes || []).join(" "));
}

function updateActivePatternNote() {
  const palette = state.palettes[state.activePatternIndex];
  elements.activePatternNote.textContent = palette ? patternNoteSummary(palette) : "";
}

function renderResults(palettes) {
  state.palettes = palettes || [];
  elements.results.innerHTML = "";

  state.palettes.forEach((palette, index) => {
    const card = document.createElement("article");
    card.className = `palette-card stack-card ${index === state.activePatternIndex ? "active" : ""}`;
    card.tabIndex = 0;

    const roleRows = ROLE_ORDER.map((role) => {
      const hex = palette.roles[role];
      return `<div class="color-row-display" style="background:${hex};color:${getReadableTextColor(hex)};"><span>${ROLE_LABELS[role]}</span><span>${hex}</span></div>`;
    }).join("");

    card.innerHTML = `
      <div class="stack-label" title="${toTitleCase(palette.name)}">${toTitleCase(palette.name)}</div>
      <div class="stack-content">
        <div class="palette-header">
          <div>
            <h2>${toTitleCase(palette.name)}</h2>
            <p>${palette.subtitle}</p>
          </div>
          <span class="grade-badge ${gradeClassName(palette.grade)}">${palette.grade}</span>
        </div>
        <div class="color-stack">${roleRows}</div>
        <div class="preview-area">
          ${scenePreviewMarkup(elements.scene.value, palette.roles)}
        </div>
        <div class="meta-block">
          <div class="meta-card">
            <h4>Contrast</h4>
            <ul class="contrast-list">
              <li>Text / Background: ${formatRatio(palette.contrast.textOnBackground)} · ${contrastLabel(palette.contrast.textOnBackground)}</li>
              <li>Text / Surface: ${formatRatio(palette.contrast.textOnSurface)} · ${contrastLabel(palette.contrast.textOnSurface)}</li>
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
    elements.results.appendChild(card);
  });

  updateActivePatternNote();
}

function translatePatternNotes(text) {
  if (!text) return "";
  const rules = [
    ["Primary Accent acts as the production-safe seed color anchor.", "Primary Accent を起点色として扱う、最も安全性の高い基準案です。"],
    ["Text readability is emphasized more strongly than Baseline.", "Baseline よりも文字の読みやすさを強く重視した案です。"],
    ["Accent freedom is expanded while core text pairs stay protected.", "本文まわりの可読性を守りつつ、アクセント色の自由度を高めた案です。"],
    ["Accent relationships are softened for a calmer feel.", "アクセント同士の関係をやわらかくし、落ち着いた印象に寄せた案です。"],
    ["Accent contrast is freer to create stronger visual punch.", "より強い印象を出すために、アクセントの差を大きく取った案です。"]
  ];
  let out = text;
  rules.forEach(([en, ja]) => { out = out.replaceAll(en, ja); });
  return out;
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
    const response = await fetch("/api/palettes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to generate palettes.");
    elements.resultsColumn.classList.remove("hidden");
    state.activePatternIndex = 0;
    renderResults(data.palettes || []);
  } catch (error) {
    elements.resultsColumn.classList.remove("hidden");
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
  elements.scene.addEventListener("change", updateScenePanel);
  elements.backgroundMode.addEventListener("change", updateScenePanel);
  elements.warmth.addEventListener("input", updateAxisLabels);
  elements.saturation.addEventListener("input", updateAxisLabels);
  elements.depth.addEventListener("input", updateAxisLabels);
  elements.style.addEventListener("input", (e) => rebalanceWeights("style", e.target.value));
  elements.usability.addEventListener("input", (e) => rebalanceWeights("usability", e.target.value));
  elements.accessibility.addEventListener("input", (e) => rebalanceWeights("accessibility", e.target.value));
  elements.generateBtn.addEventListener("click", generatePalettes);
  elements.shuffleSeedBtn.addEventListener("click", randomizeSeedColor);
}

async function init() {
  bindEvents();
  updateAxisLabels();
  updateWeightLabels();
  updateScenePanel();
  try {
    await loadDefaults("#4f46e5");
  } catch (error) {
    elements.resultsColumn.classList.remove("hidden");
    setMessage(error.message || "Failed to initialize app.", true);
  }
}

init();
