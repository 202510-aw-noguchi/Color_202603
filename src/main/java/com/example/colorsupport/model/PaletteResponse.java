package com.example.colorsupport.model;

import java.util.List;

public class PaletteResponse {
    private List<PaletteOption> palettes;

    public PaletteResponse() {
    }

    public PaletteResponse(List<PaletteOption> palettes) {
        this.palettes = palettes;
    }

    public List<PaletteOption> getPalettes() {
        return palettes;
    }

    public void setPalettes(List<PaletteOption> palettes) {
        this.palettes = palettes;
    }
}
