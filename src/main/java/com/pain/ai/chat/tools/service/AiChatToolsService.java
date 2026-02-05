package com.pain.ai.chat.tools.service;

import com.pain.ai.chat.tools.request.AiMessageRequest;
import reactor.core.publisher.Flux;

public interface AiChatToolsService {

    /**
     * 实时流式聊天
     */
    Flux<String> streamAiChat(AiMessageRequest request);
}
