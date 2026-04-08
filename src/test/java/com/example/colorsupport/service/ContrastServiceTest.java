package com.example.colorsupport.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContrastServiceTest {

    private final ContrastService contrastService = new ContrastService();

    @Test
    void contrastRatio_blackOnWhite_is21() {
        double ratio = contrastService.contrastRatio("#000000", "#ffffff");
        assertEquals(21.0, ratio, 0.000001);
    }

    @Test
    void ensureTextContrast_returnsSameColorWhenAlreadyPassing() {
        ContrastService.AdjustmentResult result = contrastService.ensureTextContrast("#111111", "#ffffff", 4.5);

        assertEquals("#111111", result.color());
        assertFalse(result.changed());
    }

    @Test
    void ensureTextContrast_adjustsColorWhenContrastIsInsufficient() {
        ContrastService.AdjustmentResult result = contrastService.ensureTextContrast("#777777", "#808080", 4.5);

        assertTrue(result.changed());
        assertNotNull(result.suggestion());
        assertTrue(contrastService.contrastRatio(result.color(), "#808080") >= 4.5);
    }

    @Test
    void ensureTextContrast_returnsSuggestionWhenNoFixFound() {
        ContrastService.AdjustmentResult result = contrastService.ensureTextContrast("#777777", "#808080", 20.0);

        assertFalse(result.changed());
        assertEquals("#777777", result.color());
        assertEquals("No lightness-only AA fix was found.", result.suggestion());
    }
}
