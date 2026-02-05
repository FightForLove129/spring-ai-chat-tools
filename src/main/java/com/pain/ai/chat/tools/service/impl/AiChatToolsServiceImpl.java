package com.pain.ai.chat.tools.service.impl;

import com.pain.ai.chat.tools.constant.Constants;
import com.pain.ai.chat.tools.request.AiMessageRequest;
import com.pain.ai.chat.tools.response.AiMessageResponse;
import com.pain.ai.chat.tools.service.AiChatToolsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.deepseek.DeepSeekChatOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.Map;

@Slf4j
@Service
public class AiChatToolsServiceImpl implements AiChatToolsService {

    @Autowired
    private ChatModel chatModel;

    @Override
    public Flux<String> streamAiChat(AiMessageRequest request) {
        try {
            // 构建提示词
            PromptTemplate promptTemplate = new PromptTemplate(Constants.PROMPT_STREAM_CHAT.concat("\n\n用户: ").concat(Constants.CONTENT_PARAMS));
            Prompt prompt = promptTemplate.create(Map.of(Constants.CONTENT_KEY, request.getContent()));

            // 构建deepseek聊天的配置信息
            DeepSeekChatOptions options = DeepSeekChatOptions.builder()
                    .temperature(request.getTemperature() == null ? Constants.DEFAULT_TEMPERATURE : request.getTemperature())
                    .maxTokens(request.getMaxTokens() == null ? Constants.DEFAULT_MAX_TOKENS : request.getMaxTokens())
                    .build();

            return chatModel.stream(new Prompt(prompt.getInstructions(), options))
                    .map(chatResponse -> chatResponse.getResult().getOutput().getText())
                    .doOnNext(debugMsg -> log.debug("流式数据响应：{}", debugMsg))
                    .doOnComplete(() -> log.info("实时流式聊天成功"))
                    .doOnError(errMsg -> log.error("实时流式聊天失败： ", errMsg));
        } catch (Exception e) {
            log.error("实时流式聊天失败 ", e);
            return Flux.error(e);
        }
    }

    @Override
    public AiMessageResponse marketingAiChat(AiMessageRequest request) {
        try {
            long startTime = System.currentTimeMillis();
            // 构建提示词
            PromptTemplate promptTemplate = new PromptTemplate(Constants.PROMPT_MARKETING_CHAT.concat("\n\n用户: ").concat(Constants.CONTENT_PARAMS));
            Prompt prompt = promptTemplate.create(Map.of(Constants.CONTENT_KEY, request.getContent()));

            // 设置营销文案参数
            DeepSeekChatOptions options = DeepSeekChatOptions.builder()
                    .temperature(request.getTemperature() == null ? Constants.DEFAULT_TEMPERATURE : request.getTemperature())
                    .maxTokens(request.getMaxTokens() == null ? Constants.DEFAULT_MAX_TOKENS : request.getMaxTokens())
                    .build();
            ChatResponse chatResponse = chatModel.call(new Prompt(prompt.getInstructions(), options));
            String content = chatResponse.getResult().getOutput().getText();

            long executeTime = System.currentTimeMillis() - startTime;
            log.info("生成营销文案耗时：{}ms", executeTime);

            AiMessageResponse aiMessageResponse = AiMessageResponse.success(content, Constants.MODEL_DEEPSEEK_CHAT);
            aiMessageResponse.setExecuteTimeMs(executeTime);
            return aiMessageResponse;
        } catch (Exception e) {
            log.error("生成营销文案失败：", e);
            return AiMessageResponse.error("生成营销文案失败：" + e.getMessage());
        }
    }

    @Override
    public AiMessageResponse codingAiChat(AiMessageRequest request) {
        try{
            long startTime = System.currentTimeMillis();

            // 设置提示词
            PromptTemplate promptTemplate = new PromptTemplate(Constants.PROMPT_CODING_CHAT.concat("\n\n编程需求:").concat(Constants.CONTENT_PARAMS));
            Prompt prompt = promptTemplate.create(Map.of(Constants.CONTENT_KEY, request.getContent()));

            // 设置代码生成参数
            DeepSeekChatOptions options = DeepSeekChatOptions.builder()
                    .temperature(request.getTemperature() == null ? Constants.DEFAULT_CODING_TEMPERATURE : request.getTemperature())
                    .maxTokens(request.getMaxTokens() == null ? Constants.DEFAULT_CODING_MAX_TOKENS : request.getMaxTokens())
                    .build();

            ChatResponse chatResponse = chatModel.call(new Prompt(prompt.getInstructions(), options));
            String content = chatResponse.getResult().getOutput().getText();

            long executeTime = System.currentTimeMillis() - startTime;
            log.info("生成代码耗时: {}ms",  executeTime);

            AiMessageResponse aiMessageResponse = AiMessageResponse.success(content, Constants.MODEL_DEEPSEEK_CHAT);
            aiMessageResponse.setExecuteTimeMs(executeTime);
            return aiMessageResponse;

        }catch (Exception e){
            log.error("生成代码失败: ", e);
            return AiMessageResponse.error("生成代码失败: " +  e.getMessage());
        }
    }

}
