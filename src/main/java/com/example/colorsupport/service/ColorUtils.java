package com.example.colorsupport.service;

public final class ColorUtils {
    private ColorUtils() {
    }

    public static Hsl hexToHsl(String hex) {
        int[] rgb = hexToRgb(hex);
        return rgbToHsl(rgb[0], rgb[1], rgb[2]);
    }

    public static String hslToHex(Hsl hsl) {
        int[] rgb = hslToRgb(hsl.h(), hsl.s(), hsl.l());
        return rgbToHex(rgb[0], rgb[1], rgb[2]);
    }

    public static String shiftHsl(String hex, double h, double s, double l) {
        Hsl src = hexToHsl(hex);
        return hslToHex(new Hsl(wrapHue(src.h() + h), clamp(src.s() + s, 0, 100), clamp(src.l() + l, 0, 100)));
    }

    public static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    public static double wrapHue(double h) {
        double result = h % 360;
        return result < 0 ? result + 360 : result;
    }

    public static int[] hexToRgb(String hex) {
        String clean = hex.replace("#", "").trim();
        if (clean.length() == 3) {
            clean = "" + clean.charAt(0) + clean.charAt(0) + clean.charAt(1) + clean.charAt(1) + clean.charAt(2) + clean.charAt(2);
        }
        int num = Integer.parseInt(clean, 16);
        return new int[]{(num >> 16) & 255, (num >> 8) & 255, num & 255};
    }

    public static String rgbToHex(int r, int g, int b) {
        return String.format("#%02x%02x%02x", clampToByte(r), clampToByte(g), clampToByte(b));
    }

    private static int clampToByte(int value) {
        return Math.max(0, Math.min(255, value));
    }

    public static Hsl rgbToHsl(int red, int green, int blue) {
        double r = red / 255.0;
        double g = green / 255.0;
        double b = blue / 255.0;
        double max = Math.max(r, Math.max(g, b));
        double min = Math.min(r, Math.min(g, b));
        double h = 0;
        double s;
        double l = (max + min) / 2.0;

        if (max == min) {
            s = 0;
        } else {
            double d = max - min;
            s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);
            if (max == r) {
                h = (g - b) / d + (g < b ? 6 : 0);
            } else if (max == g) {
                h = (b - r) / d + 2;
            } else {
                h = (r - g) / d + 4;
            }
            h *= 60;
        }

        return new Hsl(h, s * 100, l * 100);
    }

    public static int[] hslToRgb(double h, double s, double l) {
        h = wrapHue(h);
        s = clamp(s, 0, 100) / 100.0;
        l = clamp(l, 0, 100) / 100.0;

        if (s == 0) {
            int gray = (int) Math.round(l * 255);
            return new int[]{gray, gray, gray};
        }

        double q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        double p = 2 * l - q;
        double hk = h / 360.0;

        double r = hue2rgb(p, q, hk + 1.0 / 3.0);
        double g = hue2rgb(p, q, hk);
        double b = hue2rgb(p, q, hk - 1.0 / 3.0);

        return new int[]{
                (int) Math.round(r * 255),
                (int) Math.round(g * 255),
                (int) Math.round(b * 255)
        };
    }

    private static double hue2rgb(double p, double q, double t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1.0 / 6.0) return p + (q - p) * 6 * t;
        if (t < 1.0 / 2.0) return q;
        if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6;
        return p;
    }

    public record Hsl(double h, double s, double l) {
    }
}
