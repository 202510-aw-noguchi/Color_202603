package com.example.colorsupport.service;

import com.example.colorsupport.model.AdjustRule;
import com.example.colorsupport.model.BackgroundMode;
import com.example.colorsupport.model.FixedColorRule;
import com.example.colorsupport.model.PaletteOption;
import com.example.colorsupport.model.PaletteRequest;
import com.example.colorsupport.model.PaletteResponse;
import com.example.colorsupport.model.PatternName;
import com.example.colorsupport.model.RoleName;
import com.example.colorsupport.model.Scene;
import com.example.colorsupport.model.ContrastSummary;
import com.example.colorsupport.service.ColorUtils.Hsl;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaletteService {

    private final ContrastService contrastService;

    public PaletteService(ContrastService contrastService) {
        this.contrastService = contrastService;
    }

    public PaletteResponse generatePalettes(PaletteRequest request) {
        validateWeights(request);

        List<PaletteOption> options = List.of(
                generatePattern(PatternName.BASELINE, request),
                generatePattern(PatternName.CLARITY, request),
                generatePattern(PatternName.EXPRESSION, request),
                generatePattern(PatternName.SERENE, request),
                generatePattern(PatternName.IMPACT, request));

        return new PaletteResponse(options);
    }

    public Map<RoleName, FixedColorRule> defaultFixedColors(String seedHex) {
        Map<RoleName, FixedColorRule> map = new EnumMap<>(RoleName.class);

        map.put(RoleName.PRIMARY_ACCENT, fixed(seedHex, true, AdjustRule.FIXED));
        map.put(RoleName.SECONDARY_ACCENT, fixed(
                ColorUtils.shiftHsl(seedHex, 40, -10, 8),
                false,
                AdjustRule.LIGHTNESS_SATURATION));
        map.put(RoleName.BACKGROUND, fixed("#ffffff", false, AdjustRule.LIGHTNESS_SATURATION));
        map.put(RoleName.SURFACE, fixed("#f7f7f7", false, AdjustRule.LIGHTNESS_SATURATION));
        map.put(RoleName.TEXT, fixed("#111111", false, AdjustRule.LIGHTNESS));
        map.put(RoleName.BORDER, fixed("#d0d7e2", false, AdjustRule.LIGHTNESS_SATURATION));

        return map;
    }

    private FixedColorRule fixed(String hex, boolean enabled, AdjustRule rule) {
        FixedColorRule fixed = new FixedColorRule();
        fixed.setHex(hex);
        fixed.setEnabled(enabled);
        fixed.setRule(rule);
        return fixed;
    }

    private void validateWeights(PaletteRequest request) {
        int total = request.getStyle() + request.getUsability() + request.getAccessibility();
        if (total != 100) {
            throw new IllegalArgumentException("Style + Usability + Accessibility must total 100.");
        }
    }

    private PaletteOption generatePattern(PatternName pattern, PaletteRequest request) {
        Hsl seed = ColorUtils.hexToHsl(request.getBaseHex());
        SceneAdjusted adjusted = sceneAdjusted(seed, request);
        PatternPolicy policy = patternPolicy(pattern, request);

        double bgL = adjusted.backgroundLightness();
        double surfaceL = adjusted.surfaceLightness();
        double textL = adjusted.textLightness();
        double borderL = adjusted.borderLightness();

        double primaryHue = adjusted.hueBase();
        double secondaryHue = adjusted.hueBase() + adjusted.baseAccentSeparation();

        double primarySat = adjusted.satBase();
        double secondarySat = adjusted.satBase() * 0.8;

        double primaryL = adjusted.primaryLightness();
        double secondaryL = primaryL + 8;

        switch (pattern) {
            case BASELINE -> {
                secondaryHue += 12;
                primarySat = ColorUtils.clamp(primarySat - 4, 10, 88);
                secondarySat = ColorUtils.clamp(secondarySat - 6, 8, 78);
            }
            case CLARITY -> {
                bgL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 98.5 : 7.5;
                surfaceL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 94.5 : 14.0;
                borderL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 84.0 : 28.0;
                textL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 9.0 : 96.5;

                secondaryHue += 55;
                primarySat = ColorUtils.clamp(primarySat - 10, 8, 76);
                secondarySat = ColorUtils.clamp(secondarySat - 12, 8, 70);
                primaryL = request.getBackgroundMode() == BackgroundMode.LIGHT ? primaryL - 8 : primaryL + 8;
            }
            case EXPRESSION -> {
                primaryHue += 24 + request.getWarmth() * 4;
                secondaryHue += 95;
                primarySat = ColorUtils.clamp(primarySat + 12, 18, 100);
                secondarySat = ColorUtils.clamp(secondarySat + 14, 18, 100);
                primaryL = request.getBackgroundMode() == BackgroundMode.LIGHT ? primaryL - 8 : primaryL + 8;
                secondaryL = request.getBackgroundMode() == BackgroundMode.LIGHT ? secondaryL - 2 : secondaryL + 8;
            }
            case SERENE -> {
                bgL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 98.4 : 13.5;
                surfaceL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 96.6 : 20.0;
                borderL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 90.5 : 24.0;
                textL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 20.5 : 87.5;

                secondaryHue += 16;
                primarySat = ColorUtils.clamp(primarySat - 26, 5, 52);
                secondarySat = ColorUtils.clamp(secondarySat - 30, 5, 46);
                primaryL += 10;
                secondaryL += 14;
            }
            case IMPACT -> {
                bgL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 93.0 : 8.0;
                surfaceL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 88.0 : 15.5;
                borderL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 76.0 : 32.0;
                textL = request.getBackgroundMode() == BackgroundMode.LIGHT ? 12.0 : 95.0;

                primaryHue += 32;
                secondaryHue += 140;
                primarySat = ColorUtils.clamp(primarySat + 18, 24, 100);
                secondarySat = ColorUtils.clamp(secondarySat + 14, 18, 100);
                primaryL = request.getBackgroundMode() == BackgroundMode.LIGHT ? primaryL - 12 : primaryL + 10;
                secondaryL = request.getBackgroundMode() == BackgroundMode.LIGHT ? secondaryL - 6 : secondaryL + 8;
            }
        }

        Map<RoleName, String> roles = new LinkedHashMap<>();
        roles.put(RoleName.BACKGROUND, ColorUtils.hslToHex(new Hsl(primaryHue, 10, bgL)));
        roles.put(RoleName.SURFACE, ColorUtils.hslToHex(new Hsl(primaryHue + 2, 12, surfaceL)));
        roles.put(RoleName.TEXT, ColorUtils.hslToHex(new Hsl(primaryHue, 5, textL)));
        roles.put(RoleName.PRIMARY_ACCENT, ColorUtils.hslToHex(new Hsl(primaryHue, primarySat, primaryL)));
        roles.put(RoleName.SECONDARY_ACCENT, ColorUtils.hslToHex(new Hsl(secondaryHue, secondarySat, secondaryL)));
        roles.put(RoleName.BORDER, ColorUtils.hslToHex(new Hsl(primaryHue, 8, borderL)));

        applyFixedColorRules(roles, request.getFixedColors());
        enforcePrintSafePalette(roles, request.getScene(), request.getBackgroundMode(), request.getFixedColors());

        ensureCoreTextContrast(roles, request.getFixedColors(), policy.textMinContrast());
        tuneSereneTextToAaBand(roles, pattern, request.getFixedColors());

        double textBg = contrastService.contrastRatio(
                roles.get(RoleName.TEXT),
                roles.get(RoleName.BACKGROUND));
        double textSurface = contrastService.contrastRatio(
                roles.get(RoleName.TEXT),
                roles.get(RoleName.SURFACE));
        double primaryBg = contrastService.contrastRatio(
                roles.get(RoleName.PRIMARY_ACCENT),
                roles.get(RoleName.BACKGROUND));
        double secondaryBg = contrastService.contrastRatio(
                roles.get(RoleName.SECONDARY_ACCENT),
                roles.get(RoleName.BACKGROUND));

        ContrastSummary contrast = new ContrastSummary();
        contrast.setTextOnBackground(textBg);
        contrast.setTextOnSurface(textSurface);
        contrast.setPrimaryOnBackground(primaryBg);
        contrast.setSecondaryOnBackground(secondaryBg);

        PaletteOption option = new PaletteOption();
        option.setName(pattern);
        option.setSubtitle(subtitle(pattern));
        option.setDescription(description(pattern));
        option.setRoles(roles);
        option.setContrast(contrast);
        option.setGrade(gradeForPolicy(policy, textBg, textSurface, primaryBg, secondaryBg));
        option.setAccessibilityComment(accessibilityComment(pattern, option.getGrade()));
        option.setNotes(List.of(patternNote(pattern)));

        return option;
    }

    private void ensureCoreTextContrast(
            Map<RoleName, String> roles,
            Map<RoleName, FixedColorRule> fixedColors,
            double minimum) {
        ContrastService.AdjustmentResult textOnBackground = enforceTextContrast(
                RoleName.TEXT,
                RoleName.BACKGROUND,
                roles,
                fixedColors,
                minimum);
        roles.put(RoleName.TEXT, textOnBackground.color());

        ContrastService.AdjustmentResult textOnSurface = enforceTextContrast(
                RoleName.TEXT,
                RoleName.SURFACE,
                roles,
                fixedColors,
                minimum);
        roles.put(RoleName.TEXT, textOnSurface.color());
    }

    private void tuneSereneTextToAaBand(
            Map<RoleName, String> roles,
            PatternName pattern,
            Map<RoleName, FixedColorRule> fixedColors) {
        if (pattern != PatternName.SERENE || isFixedLocked(RoleName.TEXT, fixedColors)) {
            return;
        }

        String text = roles.get(RoleName.TEXT);
        String background = roles.get(RoleName.BACKGROUND);
        String surface = roles.get(RoleName.SURFACE);
        if (text == null || background == null || surface == null) {
            return;
        }

        String tuned = findAaBandText(text, background, surface);
        if (tuned != null) {
            roles.put(RoleName.TEXT, tuned);
        }
    }

    private String findAaBandText(String currentText, String background, String surface) {
        Hsl base = ColorUtils.hexToHsl(currentText);
        double target = 5.4;
        String best = null;
        double bestScore = Double.MAX_VALUE;

        for (double lightness = 0; lightness <= 100; lightness += 0.5) {
            String candidate = ColorUtils.hslToHex(new Hsl(base.h(), base.s(), lightness));
            double cBg = contrastService.contrastRatio(candidate, background);
            double cSurface = contrastService.contrastRatio(candidate, surface);
            double worst = Math.min(cBg, cSurface);

            if (worst < 4.5 || worst >= 7.0) {
                continue;
            }

            double score = Math.abs(worst - target) + Math.abs(lightness - base.l()) * 0.02;
            if (score < bestScore) {
                bestScore = score;
                best = candidate;
            }
        }

        return best;
    }

    private ContrastService.AdjustmentResult enforceTextContrast(
            RoleName foregroundRole,
            RoleName backgroundRole,
            Map<RoleName, String> roles,
            Map<RoleName, FixedColorRule> fixedColors,
            double minimum) {
        FixedColorRule textRule = fixedColors != null ? fixedColors.get(foregroundRole) : null;
        boolean textIsFixed = textRule != null
                && textRule.isEnabled()
                && textRule.getRule() == AdjustRule.FIXED;

        ContrastService.AdjustmentResult adjustment = contrastService.ensureTextContrast(
                roles.get(foregroundRole),
                roles.get(backgroundRole),
                minimum);

        if (!textIsFixed) {
            roles.put(foregroundRole, adjustment.color());
        }

        return adjustment;
    }

    private void applyFixedColorRules(Map<RoleName, String> roles, Map<RoleName, FixedColorRule> fixedColors) {
        if (fixedColors == null) {
            return;
        }

        for (RoleName role : RoleName.values()) {
            FixedColorRule fixed = fixedColors.get(role);
            if (fixed == null || !fixed.isEnabled() || fixed.getHex() == null || fixed.getHex().isBlank()) {
                continue;
            }

            String candidate = roles.get(role);
            if (candidate == null) {
                continue;
            }

            if (fixed.getRule() == AdjustRule.FIXED) {
                roles.put(role, fixed.getHex());
                continue;
            }

            Hsl src = ColorUtils.hexToHsl(candidate);
            Hsl ref = ColorUtils.hexToHsl(fixed.getHex());
            Hsl next;

            if (fixed.getRule() == AdjustRule.LIGHTNESS) {
                next = new Hsl(ref.h(), ref.s(), src.l());
            } else if (fixed.getRule() == AdjustRule.SATURATION) {
                next = new Hsl(ref.h(), src.s(), ref.l());
            } else {
                next = new Hsl(ref.h(), src.s(), src.l());
            }

            roles.put(role, ColorUtils.hslToHex(next));
        }
    }

    private void enforcePrintSafePalette(
            Map<RoleName, String> roles,
            Scene scene,
            BackgroundMode backgroundMode,
            Map<RoleName, FixedColorRule> fixedColors) {
        if (scene != Scene.POSTER && scene != Scene.MAGAZINE) {
            return;
        }

        double accentSatMax = scene == Scene.POSTER ? 82 : 72;

        for (RoleName role : RoleName.values()) {
            String current = roles.get(role);
            if (current == null || isFixedLocked(role, fixedColors)) {
                continue;
            }

            Hsl hsl = ColorUtils.hexToHsl(current);
            Hsl adjusted = adjustForPrintRole(hsl, role, backgroundMode, accentSatMax);

            // Approximate CMYK total area coverage reduction for print-friendly output.
            double tacLimit = role == RoleName.TEXT ? 320 : 300;
            String printableHex = reduceTotalInkCoverage(ColorUtils.hslToHex(adjusted), tacLimit);
            roles.put(role, printableHex);
        }
    }

    private boolean isFixedLocked(RoleName role, Map<RoleName, FixedColorRule> fixedColors) {
        if (fixedColors == null) {
            return false;
        }
        FixedColorRule fixed = fixedColors.get(role);
        return fixed != null && fixed.isEnabled() && fixed.getRule() == AdjustRule.FIXED;
    }

    private Hsl adjustForPrintRole(Hsl hsl, RoleName role, BackgroundMode backgroundMode, double accentSatMax) {
        double s = hsl.s();
        double l = hsl.l();

        switch (role) {
            case BACKGROUND -> {
                s = ColorUtils.clamp(s, 2, 12);
                l = backgroundMode == BackgroundMode.DARK
                        ? ColorUtils.clamp(l, 7, 18)
                        : ColorUtils.clamp(l, 90, 98);
            }
            case SURFACE -> {
                s = ColorUtils.clamp(s, 2, 14);
                l = backgroundMode == BackgroundMode.DARK
                        ? ColorUtils.clamp(l, 10, 24)
                        : ColorUtils.clamp(l, 84, 96);
            }
            case TEXT -> {
                s = ColorUtils.clamp(s, 0, 12);
                l = backgroundMode == BackgroundMode.DARK
                        ? ColorUtils.clamp(l, 82, 98)
                        : ColorUtils.clamp(l, 8, 24);
            }
            case BORDER -> {
                s = ColorUtils.clamp(s, 2, 16);
                l = backgroundMode == BackgroundMode.DARK
                        ? ColorUtils.clamp(l, 20, 42)
                        : ColorUtils.clamp(l, 68, 90);
            }
            case PRIMARY_ACCENT, SECONDARY_ACCENT -> {
                s = ColorUtils.clamp(s, 10, accentSatMax);
                l = ColorUtils.clamp(l, 20, 74);
            }
        }
        return new Hsl(hsl.h(), s, l);
    }

    private String reduceTotalInkCoverage(String hex, double maxTac) {
        String current = hex;
        Hsl tuned = ColorUtils.hexToHsl(current);

        for (int i = 0; i < 28; i++) {
            if (totalInkCoverage(current) <= maxTac) {
                return current;
            }
            tuned = new Hsl(
                    tuned.h(),
                    ColorUtils.clamp(tuned.s() - 1.5, 0, 95),
                    ColorUtils.clamp(tuned.l() + 1.2, 4, 98));
            current = ColorUtils.hslToHex(tuned);
        }
        return current;
    }

    private double totalInkCoverage(String hex) {
        int[] rgb = ColorUtils.hexToRgb(hex);
        double r = rgb[0] / 255.0;
        double g = rgb[1] / 255.0;
        double b = rgb[2] / 255.0;

        double k = 1.0 - Math.max(r, Math.max(g, b));
        if (k >= 0.999999) {
            return 400.0;
        }

        double denominator = 1.0 - k;
        double c = denominator == 0 ? 0 : (1.0 - r - k) / denominator;
        double m = denominator == 0 ? 0 : (1.0 - g - k) / denominator;
        double y = denominator == 0 ? 0 : (1.0 - b - k) / denominator;

        c = ColorUtils.clamp(c, 0, 1);
        m = ColorUtils.clamp(m, 0, 1);
        y = ColorUtils.clamp(y, 0, 1);
        k = ColorUtils.clamp(k, 0, 1);

        return (c + m + y + k) * 100.0;
    }

    private String gradeForPolicy(
            PatternPolicy policy,
            double textBg,
            double textSurface,
            double primaryBg,
            double secondaryBg) {
        double coreWorst = Math.min(textBg, textSurface);
        double accentWorst = Math.min(primaryBg, secondaryBg);

        if (coreWorst >= 7.0 && (!policy.enforceAccentSafety() || accentWorst >= 4.5)) {
            return "AAA";
        }
        if (coreWorst >= policy.textMinContrast() && (!policy.enforceAccentSafety() || accentWorst >= 3.0)) {
            return "AA";
        }
        if (coreWorst >= policy.textMinContrast()) {
            return "Text AA / Accent Free";
        }
        if (coreWorst >= 3.0) {
            return "Large AA";
        }
        return "Fail";
    }

    private PatternPolicy patternPolicy(PatternName pattern, PaletteRequest request) {
        return switch (pattern) {
            case BASELINE -> new PatternPolicy(4.5, true);
            case CLARITY -> new PatternPolicy(
                    request.getScene() == Scene.PRESENTATION ? 5.5 : 4.8,
                    true);
            case EXPRESSION, SERENE, IMPACT -> new PatternPolicy(4.5, false);
        };
    }

    private SceneAdjusted sceneAdjusted(Hsl seed, PaletteRequest request) {
        ScenePreset preset = switch (request.getScene()) {
            case WEB -> new ScenePreset(96, 92, 14, 10, 16, 94, 86, 26, 40);
            case MOBILE -> new ScenePreset(97, 91, 12, 8, 18, 95, 30, 28, 52);
            case PRESENTATION -> new ScenePreset(98, 90, 10, 7, 18, 96, 34, 30, 68);
            case POSTER -> new ScenePreset(94, 89, 13, 8, 16, 94, 78, 32, 92);
            case MAGAZINE -> new ScenePreset(96, 93, 16, 11, 20, 91, 84, 24, 34);
        };

        double hue = ColorUtils.wrapHue(seed.h() + request.getWarmth() * 8);
        double sat = ColorUtils.clamp(seed.s() + request.getSaturation() * 12, 6, 95);
        double primaryLightness = ColorUtils.clamp(
                seed.l() + request.getDepth() * 8 + (request.getBackgroundMode() == BackgroundMode.DARK ? 2 : 0),
                16,
                72);

        double bg = request.getBackgroundMode() == BackgroundMode.DARK
                ? ColorUtils.clamp(preset.darkBackgroundL() - request.getDepth() * 1.6, 4, 18)
                : ColorUtils.clamp(preset.lightBackgroundL() - request.getDepth() * 2.2, 88, 99);

        double surface = request.getBackgroundMode() == BackgroundMode.DARK
                ? ColorUtils.clamp(preset.darkSurfaceL() - request.getDepth(), 8, 24)
                : ColorUtils.clamp(preset.lightSurfaceL() - request.getDepth() * 1.5, 82, 97);

        double text = request.getBackgroundMode() == BackgroundMode.DARK
                ? ColorUtils.clamp(preset.darkTextL() + request.getDepth() * 1.2, 82, 98)
                : ColorUtils.clamp(preset.lightTextL() - request.getDepth() * 1.5, 6, 24);

        double border = request.getBackgroundMode() == BackgroundMode.DARK
                ? ColorUtils.clamp(preset.darkBorderL() - request.getDepth(), 18, 40)
                : ColorUtils.clamp(preset.lightBorderL() - request.getDepth() * 1.2, 70, 92);

        return new SceneAdjusted(
                hue,
                sat,
                bg,
                surface,
                text,
                border,
                primaryLightness,
                preset.baseAccentSeparation());
    }

    private String subtitle(PatternName pattern) {
        return switch (pattern) {
            case BASELINE -> "Balanced & versatile";
            case CLARITY -> "High readability";
            case EXPRESSION -> "Strong visual identity";
            case SERENE -> "Soft & low fatigue";
            case IMPACT -> "Bold & eye-catching";
        };
    }

    private String description(PatternName pattern) {
        return switch (pattern) {
            case BASELINE -> "The most balanced proposal for practical daily use.";
            case CLARITY -> "Prioritizes WCAG text readability and clearer role separation.";
            case EXPRESSION -> "Leans into character, identity, and mood while protecting text readability.";
            case SERENE -> "Lower visual fatigue with softer accents and calmer transitions.";
            case IMPACT -> "Higher punch and stronger attention guidance with freer accent contrast.";
        };
    }

    private String patternNote(PatternName pattern) {
        return switch (pattern) {
            case BASELINE -> "Primary Accent acts as the production-safe seed color anchor.";
            case CLARITY -> "Text readability is emphasized more strongly than Baseline.";
            case EXPRESSION -> "Accent freedom is expanded while core text pairs stay protected.";
            case SERENE -> "Accent relationships are softened for a calmer feel.";
            case IMPACT -> "Accent contrast is freer to create stronger visual punch.";
        };
    }

    private String accessibilityComment(PatternName pattern, String grade) {
        if (pattern == PatternName.BASELINE) {
            return switch (grade) {
                case "AAA" -> "Baseline clears AAA on core text pairs and remains the safest default.";
                case "AA" -> "Baseline keeps WCAG AA on core text pairs and is the safest production-ready option.";
                default -> "Baseline should normally stay at AA for text. Review fixed colors or lightness settings.";
            };
        }

        if (pattern == PatternName.CLARITY) {
            return switch (grade) {
                case "AAA" -> "Clarity delivers the strongest readability posture and clears AAA on core text pairs.";
                case "AA" -> "Clarity keeps WCAG AA on core text pairs while pushing separation harder than Baseline.";
                default ->
                    "Clarity should normally remain AA on core text pairs. Review fixed text or surface settings.";
            };
        }

        return switch (grade) {
            case "AA", "AAA" ->
                "Core text pairs stay at AA while accent freedom is intentionally expanded for this pattern.";
            case "Text AA / Accent Free" ->
                "Text pairs stay at AA. Accent contrast is intentionally freer and should be treated as guidance, not a hard gate.";
            default ->
                "This pattern protects text first, but at least one core pair fell below AA after constraints were applied.";
        };
    }

    private record ScenePreset(
            double lightBackgroundL,
            double lightSurfaceL,
            double lightTextL,
            double darkBackgroundL,
            double darkSurfaceL,
            double darkTextL,
            double lightBorderL,
            double darkBorderL,
            double baseAccentSeparation) {
    }

    private record SceneAdjusted(
            double hueBase,
            double satBase,
            double backgroundLightness,
            double surfaceLightness,
            double textLightness,
            double borderLightness,
            double primaryLightness,
            double baseAccentSeparation) {
    }

    private record PatternPolicy(
            double textMinContrast,
            boolean enforceAccentSafety) {
    }
}
