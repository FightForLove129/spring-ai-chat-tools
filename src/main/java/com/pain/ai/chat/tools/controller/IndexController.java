package com.pain.ai.chat.tools.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

    @GetMapping("/")
    public String home() {
        return "redirect:/index.html";
    }

    @GetMapping("/index")
    public String index() {
        return "redirect:/index.html";
    }
}
