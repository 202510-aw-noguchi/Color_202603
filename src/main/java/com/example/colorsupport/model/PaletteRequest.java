package com.example.colorsupport.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.HashMap;
import java.util.Map;

public class PaletteRequest {
    @NotBlank
    @Pattern(regexp = "^#[0-9a-fA-F]{6}$")
    private String baseHex;

    @NotNull
    private Scene scene;

    @NotNull
    private BackgroundMode backgroundMode;

    @Min(-5)
    @Max(5)
    private int warmth;

    @Min(-5)
    @Max(5)
    private int saturation;

    @Min(-5)
    @Max(5)
    private int depth;

    @Min(0)
    @Max(100)
    private int style;

    @Min(0)
    @Max(100)
    private int usability;

    @Min(0)
    @Max(100)
    private int accessibility;

    @Valid
    private Map<RoleName, FixedColorRule> fixedColors = new HashMap<>();

    public String getBaseHex() {
        return baseHex;
    }

    public void setBaseHex(String baseHex) {
        this.baseHex = baseHex;
    }

    public Scene getScene() {
        return scene;
    }

    public void setScene(Scene scene) {
        this.scene = scene;
    }

    public BackgroundMode getBackgroundMode() {
        return backgroundMode;
    }

    public void setBackgroundMode(BackgroundMode backgroundMode) {
        this.backgroundMode = backgroundMode;
    }

    public int getWarmth() {
        return warmth;
    }

    public void setWarmth(int warmth) {
        this.warmth = warmth;
    }

    public int getSaturation() {
        return saturation;
    }

    public void setSaturation(int saturation) {
        this.saturation = saturation;
    }

    public int getDepth() {
        return depth;
    }

    public void setDepth(int depth) {
        this.depth = depth;
    }

    public int getStyle() {
        return style;
    }

    public void setStyle(int style) {
        this.style = style;
    }

    public int getUsability() {
        return usability;
    }

    public void setUsability(int usability) {
        this.usability = usability;
    }

    public int getAccessibility() {
        return accessibility;
    }

    public void setAccessibility(int accessibility) {
        this.accessibility = accessibility;
    }

    public Map<RoleName, FixedColorRule> getFixedColors() {
        return fixedColors;
    }

    public void setFixedColors(Map<RoleName, FixedColorRule> fixedColors) {
        this.fixedColors = fixedColors;
    }
}
