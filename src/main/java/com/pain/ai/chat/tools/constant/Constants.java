package com.pain.ai.chat.tools.constant;

/**
 * @author binghe(微信 : hacker_binghe)
 * @version 1.0.0
 * @description 常量类
 * @github https://github.com/binghe001
 * @copyright 公众号: 冰河技术
 */
public class Constants {

    /**
     * content参数
     */
    public static final String CONTENT_PARAMS = "{content}";
    /**
     * content的key
     */
    public static final String CONTENT_KEY = "content";

    /**
     * 完成标识
     */
    public static final String DONE = "[DONE]";

    /**
     * 默认最大Token数量
     */
    public static final int DEFAULT_MAX_TOKENS = 800;

    /**
     * 默认的温度参数
     */
    public static final double DEFAULT_TEMPERATURE = 0.9;

    /**
     * 实时流式聊天提示词
     */
    public static final String PROMPT_STREAM_CHAT  = """
                你是一位对人友好、有帮助的AI助手。
                请以自然、亲切的方式与用户对话，用中文回复。
                涉及专业词汇，尽量解释清楚。
                涉及复杂问题，分步骤耐心讲解。
                """;
}
