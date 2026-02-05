package com.pain.ai.chat.tools.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AiMessageResponse {

    /**
     * 生成的内容
     */
    private String content;

    /**
     * 请求是否成功
     */
    private boolean success;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 响应时间戳
     */
    private LocalDateTime timestamp;

    /**
     * 使用的模型名称
     */
    private String model;

    /**
     * 消耗的Token数量
     */
    private Integer tokenCount;

    /**
     * 处理耗时
     */
    private Long executeTimeMs;

    public AiMessageResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public AiMessageResponse(String content) {
        this();
        this.content = content;
        this.success = true;
    }

    public AiMessageResponse(String content, String model) {
        this(content);
        this.model = model;
    }

    public static AiMessageResponse success(String content) {
        return new AiMessageResponse(content);
    }

    public static AiMessageResponse success(String content, String model) {
        return new AiMessageResponse(content, model);
    }

    public static AiMessageResponse error(String errorMessage) {
        AiMessageResponse response = new AiMessageResponse();
        response.setSuccess(false);
        response.setErrorMessage(errorMessage);
        return response;
    }
}
