package com.example.colorsupport.controller;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err -> fields.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("message", "Validation failed", "fields", fields));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> fields = new HashMap<>();
        ex.getConstraintViolations().forEach(v -> {
            String path = v.getPropertyPath() == null ? "" : v.getPropertyPath().toString();
            String field = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
            fields.put(field, v.getMessage());
        });
        return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid request parameters.",
                "fields", fields));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected server error"));
    }
}
