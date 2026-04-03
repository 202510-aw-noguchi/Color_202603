package com.example.colorsupport.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PaletteOption {
    private PatternName name;
    private String description;
    private Map<RoleName, String> roles = new LinkedHashMap<>();
    private ContrastSummary contrast;
    private String grade;
    private String accessibilityComment;
    private List<String> notes = new ArrayList<>();

    public PatternName getName() {
        return name;
    }

    public void setName(PatternName name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Map<RoleName, String> getRoles() {
        return roles;
    }

    public void setRoles(Map<RoleName, String> roles) {
        this.roles = roles;
    }

    public ContrastSummary getContrast() {
        return contrast;
    }

    public void setContrast(ContrastSummary contrast) {
        this.contrast = contrast;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getAccessibilityComment() {
        return accessibilityComment;
    }

    public void setAccessibilityComment(String accessibilityComment) {
        this.accessibilityComment = accessibilityComment;
    }

    public List<String> getNotes() {
        return notes;
    }

    public void setNotes(List<String> notes) {
        this.notes = notes;
    }
}
