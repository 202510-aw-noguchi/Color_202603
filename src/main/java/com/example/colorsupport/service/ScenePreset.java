package com.example.colorsupport.service;

import com.example.colorsupport.model.BackgroundMode;
import com.example.colorsupport.model.Scene;

public record ScenePreset(
        double lightBackgroundMin,
        double lightBackgroundMax,
        double darkBackgroundMin,
        double darkBackgroundMax,
        double lightSurfaceDeltaMin,
        double lightSurfaceDeltaMax,
        double darkSurfaceDeltaMin,
        double darkSurfaceDeltaMax,
        double textMinContrast,
        double primaryMinContrast,
        double accentSaturationBoostMin,
        double accentSaturationBoostMax,
        double accentHueSeparationMin,
        double accentHueSeparationMax,
        double styleMultiplier,
        double usabilityMultiplier,
        double accessibilityMultiplier,
        double readabilityEmphasis,
        double balanceEmphasis,
        double expressionEmphasis
) {
    public static ScenePreset forScene(Scene scene) {
        return switch (scene) {
            case WEB -> new ScenePreset(
                    95, 99,
                    8, 14,
                    3, 6,
                    4, 8,
                    4.5, 3.0,
                    0, 6,
                    25, 55,
                    1.00, 1.10, 1.10,
                    1.15, 1.15, 0.95
            );
            case MOBILE -> new ScenePreset(
                    96, 99,
                    7, 12,
                    5, 8,
                    6, 10,
                    5.0, 3.5,
                    4, 10,
                    35, 70,
                    0.95, 1.15, 1.20,
                    1.25, 1.20, 0.90
            );
            case PRESENTATION -> new ScenePreset(
                    97, 100,
                    6, 10,
                    6, 10,
                    7, 11,
                    5.5, 4.0,
                    6, 12,
                    45, 90,
                    1.00, 1.00, 1.25,
                    1.30, 1.00, 1.00
            );
            case POSTER -> new ScenePreset(
                    90, 98,
                    5, 12,
                    2, 6,
                    3, 7,
                    4.5, 3.0,
                    10, 20,
                    60, 140,
                    1.20, 0.90, 1.00,
                    0.95, 0.85, 1.30
            );
            case MAGAZINE -> new ScenePreset(
                    93, 98,
                    10, 16,
                    2, 5,
                    3, 6,
                    4.5, 3.0,
                    -4, 4,
                    20, 45,
                    1.05, 1.05, 1.10,
                    1.10, 1.10, 0.95
            );
        };
    }

    public double backgroundLightness(BackgroundMode mode, double depth) {
        double min = mode == BackgroundMode.LIGHT ? lightBackgroundMin : darkBackgroundMin;
        double max = mode == BackgroundMode.LIGHT ? lightBackgroundMax : darkBackgroundMax;
        double center = (min + max) / 2.0;
        double spread = (max - min) / 2.0;
        return ColorUtils.clamp(center - depth * Math.max(1.2, spread * 0.35), min, max);
    }

    public double surfaceDelta(BackgroundMode mode, double depth) {
        double min = mode == BackgroundMode.LIGHT ? lightSurfaceDeltaMin : darkSurfaceDeltaMin;
        double max = mode == BackgroundMode.LIGHT ? lightSurfaceDeltaMax : darkSurfaceDeltaMax;
        double center = (min + max) / 2.0;
        return ColorUtils.clamp(center + Math.abs(depth) * 0.35, min, max);
    }

    public double accentSaturationBoost(double styleWeight, double expressionWeight) {
        double min = accentSaturationBoostMin;
        double max = accentSaturationBoostMax;
        double t = ColorUtils.clamp((styleWeight * 0.55) + (expressionWeight * 0.45), 0, 1);
        return min + (max - min) * t;
    }

    public double accentHueSeparation(double styleWeight, double usabilityWeight) {
        double min = accentHueSeparationMin;
        double max = accentHueSeparationMax;
        double t = ColorUtils.clamp((styleWeight * 0.6) + ((1 - usabilityWeight) * 0.4), 0, 1);
        return min + (max - min) * t;
    }
}
