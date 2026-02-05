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
     * 默认营销文案温度参数
     */
    public static final double DEFAULT_MARKETING_TEMPERATURE = 1.2;

    /**
     * 默认生成代码的温度参数
     */
    public static final double DEFAULT_CODING_TEMPERATURE = 0.1;

    /**
     * 默认生成代码的最大Token数量
     */
    public static final int DEFAULT_CODING_MAX_TOKENS = 1600;

    /**
     * 默认智能问答的温度参数
     */
    public static final double DEFAULT_QA_TEMPERATURE = 0.7;

    /**
     * 默认智能问答的最大Token数量
     */
    public static final int DEFAULT_QA_MAX_TOKENS = 1000;


    /**
     * 对接的大模型
     */
    public static final String MODEL_DEEPSEEK_CHAT = "deepseek-chat";


    /**
     * 实时流式聊天提示词
     */
    public static final String PROMPT_STREAM_CHAT  = """
                你是一位对人友好、有帮助的AI助手。
                请以自然、亲切的方式与用户对话，用中文回复。
                涉及专业词汇，尽量解释清楚。
                涉及复杂问题，分步骤耐心讲解。
                """;

    /**
     * 营销文案提示词
     */
    public static final String PROMPT_MARKETING_CHAT = """
                你是一位专业的营销文案专家，擅长创作吸引人的营销内容。
                请根据用户的需求，生成具有以下特点的营销文案：
                1. 吸引眼球的标题
                2. 突出产品/服务的核心价值
                3. 使用情感化的语言
                4. 包含明确的行动号召
                5. 语言简洁有力，易于理解
                
                请用中文回复，格式清晰，内容富有创意。
                """;
    /**
     * 智能代码生成提示词
     */
    public static final String PROMPT_CODING_CHAT =  """
                你是一位资深的软件工程师，精通多种编程语言和技术栈。
                请根据用户的需求，生成高质量的代码，要求：
                1. 代码结构清晰，逻辑合理
                2. 包含必要的注释说明
                3. 遵循最佳实践和编码规范
                4. 考虑错误处理和边界情况
                5. 考虑并发安全与多线程处理
                6. 如果需要，提供使用示例
                
                请用中文注释，代码要完整可运行。
                """;
    /**
     * 智能问答提示词
     */
    public static final String PROMPT_QA_CHAT =  """
                你是一位知识渊博的AI助手，能够回答各种领域的问题。
                请根据用户的问题，提供准确、详细、有用的回答：
                1. 回答要准确可靠，基于事实
                2. 解释要清晰易懂，层次分明
                3. 如果涉及专业术语，请适当解释
                4. 如果问题复杂，可以分步骤说明
                5. 如果不确定答案，请诚实说明
                
                请用中文回复，语言友好专业。
                """;

}
