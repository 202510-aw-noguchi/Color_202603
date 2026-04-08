package com.example.colorsupport.service;

import com.example.colorsupport.model.BackgroundMode;
import com.example.colorsupport.model.FixedColorRule;
import com.example.colorsupport.model.PaletteOption;
import com.example.colorsupport.model.PaletteRequest;
import com.example.colorsupport.model.PaletteResponse;
import com.example.colorsupport.model.PatternName;
import com.example.colorsupport.model.RoleName;
import com.example.colorsupport.model.Scene;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PaletteServiceTest {

    private final PaletteService paletteService = new PaletteService(new ContrastService());

    @Test
    void generatePalettes_returnsFivePatternsAndCoreRoles() {
        PaletteRequest request = baseRequest("#4f46e5", 34, 33, 33);

        PaletteResponse response = paletteService.generatePalettes(request);

        assertNotNull(response);
        assertNotNull(response.getPalettes());
        assertEquals(5, response.getPalettes().size());

        List<PatternName> expectedOrder = List.of(
                PatternName.BASELINE,
                PatternName.CLARITY,
                PatternName.EXPRESSION,
                PatternName.SERENE,
                PatternName.IMPACT);
        List<PatternName> actualOrder = response.getPalettes().stream().map(PaletteOption::getName).toList();
        assertEquals(expectedOrder, actualOrder);

        Pattern hex = Pattern.compile("^#[0-9a-f]{6}$");
        Set<RoleName> expectedRoles = Set.of(RoleName.values());

        for (PaletteOption option : response.getPalettes()) {
            Map<RoleName, String> roles = option.getRoles();
            assertNotNull(roles);
            assertEquals(expectedRoles, roles.keySet());
            assertTrue(roles.values().stream().allMatch(v -> hex.matcher(v).matches()));
            assertTrue(option.getContrast().getTextOnBackground() >= 4.5,
                    () -> option.getName() + " text/background contrast should stay at least AA");
            assertTrue(option.getContrast().getTextOnSurface() >= 4.5,
                    () -> option.getName() + " text/surface contrast should stay at least AA");
        }
    }

    @Test
    void generatePalettes_throwsWhenWeightsDoNotTotal100() {
        PaletteRequest request = baseRequest("#4f46e5", 50, 30, 10);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> paletteService.generatePalettes(request));

        assertTrue(ex.getMessage().contains("must total 100"));
    }

    @Test
    void defaultFixedColors_setsPrimaryAsFixedSeedAndIncludesAllRoles() {
        Map<RoleName, FixedColorRule> defaults = paletteService.defaultFixedColors("#123abc");

        assertEquals(Set.of(RoleName.values()), defaults.keySet());

        FixedColorRule primary = defaults.get(RoleName.PRIMARY_ACCENT);
        assertNotNull(primary);
        assertTrue(primary.isEnabled());
        assertEquals("#123abc", primary.getHex());
        assertEquals(com.example.colorsupport.model.AdjustRule.FIXED, primary.getRule());

        Set<RoleName> missing = Set.of(RoleName.values()).stream()
                .filter(role -> defaults.get(role) == null)
                .collect(Collectors.toSet());
        assertTrue(missing.isEmpty(), () -> "Missing defaults for roles: " + missing);
    }

    private PaletteRequest baseRequest(String baseHex, int style, int usability, int accessibility) {
        PaletteRequest request = new PaletteRequest();
        request.setBaseHex(baseHex);
        request.setScene(Scene.WEB);
        request.setBackgroundMode(BackgroundMode.LIGHT);
        request.setWarmth(0);
        request.setSaturation(0);
        request.setDepth(0);
        request.setStyle(style);
        request.setUsability(usability);
        request.setAccessibility(accessibility);
        request.setFixedColors(paletteService.defaultFixedColors(baseHex));
        return request;
    }
}
