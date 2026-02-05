package com.pain.ai.chat.tools.service;

import com.pain.ai.chat.tools.request.AiMessageRequest;
import com.pain.ai.chat.tools.response.AiMessageResponse;
import reactor.core.publisher.Flux;

public interface AiChatToolsService {

    /**
     * 实时流式聊天
     */
    Flux<String> streamAiChat(AiMessageRequest request);

    /**
     * 营销文案生成
     */
    AiMessageResponse marketingAiChat(AiMessageRequest request);

    /**
     * 智能代码生成
     */
    AiMessageResponse codingAiChat(AiMessageRequest request);

    /**
     * 智能问答
     */
    AiMessageResponse qaAiChat(AiMessageRequest request);

    /**
     * 通用对话聊天
     */
    AiMessageResponse commonAiChat(AiMessageRequest request);


}
