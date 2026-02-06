package com.pain.ai.chat.tools.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class HealthController {

    @RequestMapping("/health")
    public String health() {
        return "OK";
    }
}
