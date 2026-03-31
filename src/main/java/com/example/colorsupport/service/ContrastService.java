package com.example.colorsupport.service;

import com.example.colorsupport.service.ColorUtils.Hsl;
import org.springframework.stereotype.Service;

@Service
public class ContrastService {
    public double relativeLuminance(String hex) {
        int[] rgb = ColorUtils.hexToRgb(hex);
        double[] srgb = new double[3];
        for (int i = 0; i < 3; i++) {
            double v = rgb[i] / 255.0;
            srgb[i] = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        }
        return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    }

    public double contrastRatio(String foreground, String background) {
        double l1 = relativeLuminance(foreground);
        double l2 = relativeLuminance(background);
        double lighter = Math.max(l1, l2);
        double darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    public String contrastGrade(double ratio) {
        if (ratio >= 7) return "AAA";
        if (ratio >= 4.5) return "AA";
        if (ratio >= 3) return "Large AA";
        return "Fail";
    }

    public AdjustmentResult ensureTextContrast(String textHex, String backgroundHex, double minimum) {
        if (contrastRatio(textHex, backgroundHex) >= minimum) {
            return new AdjustmentResult(textHex, false, null);
        }

        Hsl original = ColorUtils.hexToHsl(textHex);
        Candidate lighter = null;
        Candidate darker = null;

        for (int i = 1; i <= 60; i++) {
            String up = ColorUtils.hslToHex(new Hsl(original.h(), original.s(), ColorUtils.clamp(original.l() + i, 0, 100)));
            if (lighter == null && contrastRatio(up, backgroundHex) >= minimum) {
                lighter = new Candidate(up, i);
            }

            String down = ColorUtils.hslToHex(new Hsl(original.h(), original.s(), ColorUtils.clamp(original.l() - i, 0, 100)));
            if (darker == null && contrastRatio(down, backgroundHex) >= minimum) {
                darker = new Candidate(down, i);
            }
            if (lighter != null && darker != null) {
                break;
            }
        }

        Candidate best = null;
        if (lighter != null && darker != null) {
            best = lighter.diff <= darker.diff ? lighter : darker;
        } else if (lighter != null) {
            best = lighter;
        } else if (darker != null) {
            best = darker;
        }

        if (best == null) {
            return new AdjustmentResult(textHex, false, "No lightness-only AA fix was found.");
        }

        String direction = lighter != null && best.color.equals(lighter.color) ? "Increase" : "Decrease";
        return new AdjustmentResult(best.color, true, direction + " text lightness by about " + best.diff + "% to reach AA.");
    }

    public record AdjustmentResult(String color, boolean changed, String suggestion) {
    }

    private record Candidate(String color, int diff) {
    }
}
