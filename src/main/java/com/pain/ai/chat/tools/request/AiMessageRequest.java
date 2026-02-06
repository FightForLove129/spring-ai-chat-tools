package com.pain.ai.chat.tools.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiMessageRequest {

    /**
     * 用户输入内容
     */
    @NotBlank(message = "输入内容不能为空")
    @Size(max = 2000, message = "输入内容不能超过2000字")
    private String content;

    /**
     * 温度参数
     * 控制生成文本的随机性，0.0表示确定性，1.0表示最大随机性
     */
    @DecimalMin(value = "0.0", message = "温度参数不能小于0.0")
    @DecimalMax(value = "2.0", message = "温度参数不能大于2.0")
    private Double temperature;

    /**
     * 最大生成Token数
     */
    private Integer maxTokens;

    /**
     * 系统提示词
     */
    private String systemPrompt;

    public AiMessageRequest() {}

    public AiMessageRequest(String content) {
        this.content = content;
    }

    public AiMessageRequest(String content, Double temperature) {
        this.content = content;
        this.temperature = temperature;
    }

    public AiMessageRequest(String content, Double temperature, Integer maxTokens) {
        this.content = content;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
    }
}
