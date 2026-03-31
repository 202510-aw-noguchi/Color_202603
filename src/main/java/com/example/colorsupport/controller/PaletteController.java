package com.example.colorsupport.controller;

import com.example.colorsupport.model.PaletteRequest;
import com.example.colorsupport.model.PaletteResponse;
import com.example.colorsupport.service.PaletteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PaletteController {
    private final PaletteService paletteService;

    public PaletteController(PaletteService paletteService) {
        this.paletteService = paletteService;
    }

    @GetMapping("/defaults")
    public ResponseEntity<?> defaults(@RequestParam(defaultValue = "#4f46e5") String baseHex) {
        return ResponseEntity.ok(Map.of("fixedColors", paletteService.defaultFixedColors(baseHex)));
    }

    @PostMapping("/palettes")
    public ResponseEntity<PaletteResponse> generate(@Valid @RequestBody PaletteRequest request) {
        return ResponseEntity.ok(paletteService.generatePalettes(request));
    }
}
