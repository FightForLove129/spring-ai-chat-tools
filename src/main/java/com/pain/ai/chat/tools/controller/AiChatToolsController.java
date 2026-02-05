package com.pain.ai.chat.tools.controller;

import com.pain.ai.chat.tools.constant.Constants;
import com.pain.ai.chat.tools.request.AiMessageRequest;
import com.pain.ai.chat.tools.service.AiChatToolsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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
}
