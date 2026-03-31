package com.example.colorsupport.model;

public class ContrastSummary {
    private double textOnBackground;
    private double textOnSurface;
    private double primaryOnBackground;
    private double secondaryOnBackground;

    public double getTextOnBackground() {
        return textOnBackground;
    }

    public void setTextOnBackground(double textOnBackground) {
        this.textOnBackground = textOnBackground;
    }

    public double getTextOnSurface() {
        return textOnSurface;
    }

    public void setTextOnSurface(double textOnSurface) {
        this.textOnSurface = textOnSurface;
    }

    public double getPrimaryOnBackground() {
        return primaryOnBackground;
    }

    public void setPrimaryOnBackground(double primaryOnBackground) {
        this.primaryOnBackground = primaryOnBackground;
    }

    public double getSecondaryOnBackground() {
        return secondaryOnBackground;
    }

    public void setSecondaryOnBackground(double secondaryOnBackground) {
        this.secondaryOnBackground = secondaryOnBackground;
    }
}
