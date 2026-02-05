package com.pain.ai.chat.tools.controller;

import com.pain.ai.chat.tools.constant.Constants;
import com.pain.ai.chat.tools.request.AiMessageRequest;
import com.pain.ai.chat.tools.response.AiMessageResponse;
import com.pain.ai.chat.tools.service.AiChatToolsService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
@RequestMapping("/api/ai/tools")
@CrossOrigin(origins = "*")
public class AiChatToolsController {
    @Autowired
    private AiChatToolsService aiChatToolsService;

    /**
     * 实时流式聊天
     */
    @GetMapping(value = "/stream/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestBody AiMessageRequest request) {
        log.info("收到流式聊天请求：{}", request.toString());

        return aiChatToolsService.streamAiChat(request)
                .filter(data -> data != null && !data.trim().isEmpty())
                .doOnNext(data -> log.debug("原始数据：'{}'", data))
                .map(data -> data.trim())
                .filter(data -> !data.isEmpty())
                .concatWith(Flux.just(Constants.DONE))
                .doOnSubscribe(subscription -> log.info("开始实时流式聊天响应数据"))
                .doOnComplete(() -> log.info("实时流式聊天响应完成"))
                .doOnError(error -> log.error("实时流式聊天响应报错：", error))
                .onErrorReturn("[ERROR] 实时流式聊天响应报错");
    }

    @PostMapping("/marketing/chat")
    public ResponseEntity<AiMessageResponse> marketingChat(@Valid @RequestBody AiMessageRequest request) {
        log.info("收到生成营销文案的请求：{}", request.getContent());
        try {
            AiMessageResponse response = aiChatToolsService.marketingAiChat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.info("生成营销文案报错：", e);
            return ResponseEntity.internalServerError().body(AiMessageResponse.error("生成营销文案失败：" + e.getMessage()));
        }
    }

    @PostMapping("/coding/chat")
    public ResponseEntity<AiMessageResponse> codingChat(@Valid @RequestBody AiMessageRequest request) {
        log.info("收到生成智能代码的请求：{}", request.getContent());
        try {
            AiMessageResponse response = aiChatToolsService.marketingAiChat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.info("生成代码失败：", e);
            return ResponseEntity.internalServerError().body(AiMessageResponse.error("生成代码失败：" + e.getMessage()));
        }
    }
}
