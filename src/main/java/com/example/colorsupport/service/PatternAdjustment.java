package com.example.colorsupport.service;

import com.example.colorsupport.model.PatternName;

public record PatternAdjustment(
        double backgroundShift,
        double surfaceShift,
        double textShift,
        double primaryHueShift,
        double secondaryHueShift,
        double primarySaturationShift,
        double secondarySaturationShift,
        double primaryLightnessShift,
        double secondaryLightnessShift,
        double readabilityBoost,
        double expressionBoost
) {
    public static PatternAdjustment forPattern(PatternName pattern) {
        return switch (pattern) {
            case BASELINE -> new PatternAdjustment(0, 0, 0, 0, 10, 0, 0, 0, 0, 0.10, 0.10);
            case CLARITY -> new PatternAdjustment(2, 2, -4, 0, 18, -10, -12, -4, -2, 0.45, -0.10);
            case EXPRESSION -> new PatternAdjustment(-1, -1, 0, 20, 40, 12, 8, -4, 2, -0.05, 0.55);
            case SERENE -> new PatternAdjustment(1.5, 1.0, 0, -6, 8, -16, -18, 8, 10, 0.20, -0.20);
            case IMPACT -> new PatternAdjustment(-2, -2, -1, 34, 85, 16, 10, -10, -2, 0.05, 0.70);
        };
    }
}
