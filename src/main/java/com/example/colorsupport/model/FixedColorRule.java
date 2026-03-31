package com.example.colorsupport.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class FixedColorRule {
    private boolean enabled;

    @Pattern(regexp = "^#[0-9a-fA-F]{6}$")
    private String hex;

    @NotNull
    private AdjustRule rule = AdjustRule.LIGHTNESS_SATURATION;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getHex() {
        return hex;
    }

    public void setHex(String hex) {
        this.hex = hex;
    }

    public AdjustRule getRule() {
        return rule;
    }

    public void setRule(AdjustRule rule) {
        this.rule = rule;
    }
}
