// 全局变量
let currentEventSource = null;
let isPaused = false;
let streamBuffer = '';
let conversationHistory = [];
let currentStreamMessageId = null;
let chatHistory = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Spring AI DeepSeek 智能平台加载完成');

    // 初始化滑块
    initSliders();

    // 检查服务状态
    checkServiceStatus();

    // 添加快捷键
    initKeyboardShortcuts();

    // 加载设置
    loadSettings();

    // 加载对话历史
    loadConversationHistory();
});

// 切换标签页
function switchTab(tabName) {
    // 隐藏所有标签页内容
    const allTabs = document.querySelectorAll('.content-card');
    allTabs.forEach(tab => tab.classList.remove('active'));

    // 移除所有导航按钮的active状态
    const allNavBtns = document.querySelectorAll('.nav-btn');
    allNavBtns.forEach(btn => btn.classList.remove('active'));

    // 显示选中的标签页内容
    document.getElementById(tabName + '-tab').classList.add('active');

    // 激活对应的导航按钮
    const activeNavBtn = document.querySelector(`.nav-btn[onclick="switchTab('${tabName}')"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }

    console.log(`切换到 ${tabName} 标签页`);

    // 如果是聊天标签页，滚动到底部
    if (tabName === 'chat' || tabName === 'stream') {
        setTimeout(() => {
            const responseArea = document.getElementById(tabName + '-response') ||
                document.getElementById(tabName + '-output');
            if (responseArea) {
                responseArea.scrollTop = responseArea.scrollHeight;
            }
        }, 100);
    }
}

// 初始化滑块控件
function initSliders() {
    const sliders = document.querySelectorAll('.slider-thumb');
    sliders.forEach(slider => {
        const container = slider.parentElement;
        const track = container.querySelector('.slider-track');
        const valueElement = document.getElementById(`${slider.dataset.param}-value`);

        // 设置初始值
        const min = parseFloat(slider.dataset.min);
        const max = parseFloat(slider.dataset.max);
        const step = parseFloat(slider.dataset.step);
        const initialValue = (max - min) * parseFloat(slider.style.left) / 100 + min;

        // 添加拖动功能
        let isDragging = false;

        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('touchstart', startDrag);

        function startDrag(e) {
            isDragging = true;
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('touchmove', onDrag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
            e.preventDefault();
        }

        function onDrag(e) {
            if (!isDragging) return;

            const rect = container.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let percentage = ((clientX - rect.left) / rect.width) * 100;

            // 限制范围
            percentage = Math.max(0, Math.min(100, percentage));

            // 按步长调整
            const steps = (max - min) / step;
            const stepPercentage = 100 / steps;
            percentage = Math.round(percentage / stepPercentage) * stepPercentage;

            // 更新UI
            slider.style.left = `${percentage}%`;
            track.style.width = `${percentage}%`;

            // 计算并显示值
            const value = (percentage / 100) * (max - min) + min;
            const displayValue = slider.dataset.param.includes('temp') ?
                value.toFixed(1) : Math.round(value);

            if (valueElement) {
                valueElement.textContent = displayValue;
            }

            e.preventDefault();
        }

        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    });
}

// 检查服务状态
async function checkServiceStatus() {
    try {
        const response = await fetch('/api/ai/health');
        const data = await response.text();

        updateStreamStatus('completed', '服务正常');
        document.getElementById('system-status').textContent = '正常';
        console.log('✅ 服务状态:', data);
    } catch (error) {
        console.warn('⚠️ 服务检查失败:', error);
        updateStreamStatus('error', '服务异常');
        document.getElementById('system-status').textContent = '异常';
    }
}

// 初始化键盘快捷键
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter 发送消息
        if (e.ctrlKey && e.key === 'Enter') {
            const activeTab = document.querySelector('.content-card.active').id;

            switch(activeTab) {
                case 'stream-tab':
                    startStream();
                    break;
                case 'marketing-tab':
                    generateMarketing();
                    break;
                case 'code-tab':
                    generateCode();
                    break;
                case 'qa-tab':
                    answerQuestion();
                    break;
                case 'chat-tab':
                    sendChat();
                    break;
            }
        }

        // Esc 停止流式响应
        if (e.key === 'Escape' && currentEventSource) {
            stopStream();
        }

        // Tab切换快捷键
        if (e.altKey && e.key >= '1' && e.key <= '6') {
            const tabIndex = parseInt(e.key) - 1;
            const tabs = ['stream', 'marketing', 'code', 'qa', 'chat', 'settings'];
            if (tabIndex < tabs.length) {
                switchTab(tabs[tabIndex]);
            }
        }
    });
}

// 更新流式状态
function updateStreamStatus(status, message) {
    const statusElement = document.getElementById('stream-status-text');
    const statusDot = document.querySelector('.status-dot');
    const typingIndicator = document.getElementById('typing-indicator');

    // 更新状态文本
    if (statusElement) {
        statusElement.textContent = message;
    }

    // 更新状态点
    if (statusDot) {
        statusDot.className = 'status-dot ' + status;
    }

    // 控制打字指示器
    if (typingIndicator) {
        if (status === 'streaming') {
            typingIndicator.style.display = 'flex';
        } else {
            typingIndicator.style.display = 'none';
        }
    }
}

// 添加消息到流式输出
function addStreamMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('stream-messages');
    if (!messagesContainer) return null;

    const timestamp = new Date().toLocaleTimeString();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'message-user' : 'message-ai'}`;
    messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-time">${timestamp}</div>
                    ${content}
                </div>
            `;

    messagesContainer.appendChild(messageDiv);

    // 如果是AI消息，记录ID以便更新
    if (!isUser) {
        currentStreamMessageId = messageDiv;
    }

    // 滚动到底部
    const output = document.getElementById('stream-output');
    if (output) {
        output.scrollTop = output.scrollHeight;
    }

    return messageDiv;
}

// 流式聊天
function startStream() {
    const message = document.getElementById('stream-input').value.trim();

    if (!message) {
        showNotification('请输入消息内容', 'warning');
        return;
    }

    // 停止之前的连接
    if (currentEventSource) {
        currentEventSource.close();
    }

    // 添加用户消息
    addStreamMessage(message, true);

    // 清空输入框
    document.getElementById('stream-input').value = '';

    // 重置状态
    isPaused = false;
    streamBuffer = '';

    // 更新状态和按钮
    updateStreamStatus('connecting', '连接中...');
    document.getElementById('pauseBtn').disabled = false;
    document.querySelector('button[onclick="startStream()"]').disabled = true;

    // 获取参数
    const temperature = parseFloat(document.getElementById('temp-value').textContent);
    const maxTokens = parseInt(document.getElementById('max-tokens-value').textContent);

    // 添加AI响应容器
    const aiMessageDiv = addStreamMessage('<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>', false);

    // 创建EventSource连接
    const encodedMessage = encodeURIComponent(message);
    const streamUrl = `/api/ai/tools/stream/chat?content=${encodedMessage}&temperature=${temperature}&maxTokens=${maxTokens}`;
    console.log('连接流式端点:', streamUrl);

    currentEventSource = new EventSource(streamUrl);

    currentEventSource.onopen = function() {
        console.log('SSE连接已建立');
        updateStreamStatus('streaming', '正在接收...');
    };

    currentEventSource.onmessage = function(event) {
        if (isPaused) return;

        console.log('收到SSE数据:', event.data);

        // 检查是否是完成信号
        if (event.data === '[DONE]') {
            console.log('流式响应完成');
            updateStreamStatus('completed', '完成');

            // 保存到历史记录
            conversationHistory.push({
                user: message,
                ai: streamBuffer,
                timestamp: new Date().toISOString()
            });

            // 清理连接
            currentEventSource.close();
            currentEventSource = null;
            document.querySelector('button[onclick="startStream()"]').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            return;
        }

        // 检查是否是错误信号
        if (event.data.startsWith('[ERROR]')) {
            console.error('流式响应错误:', event.data);
            updateStreamStatus('error', '错误');

            const errorMsg = event.data.replace('[ERROR]', '').trim();
            if (aiMessageDiv) {
                aiMessageDiv.querySelector('.message-content').innerHTML =
                    `<div class="message-time">${new Date().toLocaleTimeString()}</div>
                             ❌ ${errorMsg || '流式响应出现错误'}`;
            }

            // 清理连接
            currentEventSource.close();
            currentEventSource = null;
            document.querySelector('button[onclick="startStream()"]').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            return;
        }

        // 处理正常的流式数据
        if (event.data && event.data.trim() !== '') {
            // 累积响应内容
            streamBuffer += event.data;

            // 更新AI消息内容
            if (aiMessageDiv) {
                const contentDiv = aiMessageDiv.querySelector('.message-content');
                const escapedContent = streamBuffer
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>');

                contentDiv.innerHTML = `<div class="message-time">${new Date().toLocaleTimeString()}</div>${escapedContent}`;

                // 滚动到底部
                const output = document.getElementById('stream-output');
                if (output) {
                    output.scrollTop = output.scrollHeight;
                }
            }
        }
    };

    currentEventSource.onerror = function(event) {
        console.error('SSE连接错误:', event);

        // 如果连接已经被正常关闭，不处理错误
        if (!currentEventSource) return;

        updateStreamStatus('error', '连接错误');
        if (aiMessageDiv) {
            aiMessageDiv.querySelector('.message-content').innerHTML =
                `<div class="message-time">${new Date().toLocaleTimeString()}</div>
                         ❌ 连接错误，请检查网络或API配置`;
        }

        // 清理连接
        if (currentEventSource) {
            currentEventSource.close();
            currentEventSource = null;
        }

        // 重置按钮状态
        document.querySelector('button[onclick="startStream()"]').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    };
}

// 暂停/继续流式响应
function pauseStream() {
    const pauseBtn = document.getElementById('pauseBtn');
    if (!pauseBtn) return;

    if (isPaused) {
        isPaused = false;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
        updateStreamStatus('streaming', '继续接收...');
    } else {
        isPaused = true;
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
        updateStreamStatus('paused', '已暂停');
    }
}

// 停止流式响应
function stopStream() {
    if (currentEventSource) {
        currentEventSource.close();
        currentEventSource = null;
    }
    updateStreamStatus('completed', '已停止');
    document.querySelector('button[onclick="startStream()"]').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    isPaused = false;
    document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> 暂停';
}

// 清空流式输出
function clearStream() {
    const messagesContainer = document.getElementById('stream-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
                    <div class="message message-ai">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-time">现在</div>
                            欢迎使用DeepSeek AI流式聊天！我可以帮您：
                            <br><br>
                            • 回答问题并提供解释<br>
                            • 创作故事和文本内容<br>
                            • 进行头脑风暴和创意讨论<br>
                            • 编程和技术问题解答<br>
                            • 学习和教育辅导
                            <br><br>
                            请在上方输入框中输入您的问题，然后点击"开始对话"按钮。
                        </div>
                    </div>
                `;
    }
    updateStreamStatus('completed', '已清空');
    streamBuffer = '';
    conversationHistory = [];
    showNotification('对话已清空', 'success');
}

// 保存对话
function saveConversation() {
    if (conversationHistory.length === 0) {
        showNotification('暂无对话历史可保存', 'warning');
        return;
    }

    localStorage.setItem('deepseek_conversation', JSON.stringify(conversationHistory));
    showNotification('对话已保存到本地存储', 'success');
}

// 加载对话历史
function loadConversationHistory() {
    try {
        const saved = localStorage.getItem('deepseek_conversation');
        if (saved) {
            conversationHistory = JSON.parse(saved);
            console.log('已加载对话历史:', conversationHistory.length, '条记录');
        }
    } catch (error) {
        console.error('加载对话历史失败:', error);
    }
}

// 导出对话
function exportConversation() {
    const messagesContainer = document.getElementById('stream-messages');
    if (!messagesContainer) {
        showNotification('没有可导出的对话内容', 'warning');
        return;
    }

    const content = messagesContainer.innerText;
    if (!content.trim()) {
        showNotification('没有可导出的对话内容', 'warning');
        return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI对话_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('对话历史已导出', 'success');
}

// 复制对话
function copyConversation() {
    const messagesContainer = document.getElementById('stream-messages');
    if (!messagesContainer) {
        showNotification('没有可复制的对话内容', 'warning');
        return;
    }

    const content = messagesContainer.innerText;
    if (!content.trim()) {
        showNotification('没有可复制的对话内容', 'warning');
        return;
    }

    navigator.clipboard.writeText(content)
        .then(() => showNotification('对话已复制到剪贴板', 'success'))
        .catch(() => showNotification('复制失败', 'error'));
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除已有的通知
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 重置表单
function resetForm(formType) {
    const inputElement = document.getElementById(`${formType}-input`);
    const responseElement = document.getElementById(`${formType}-response`);

    if (inputElement) {
        inputElement.value = '';
    }

    if (responseElement) {
        if (formType === 'marketing') {
            responseElement.textContent = '营销文案将在这里显示...';
        } else if (formType === 'code') {
            responseElement.textContent = '生成的代码将在这里显示...';
        } else if (formType === 'qa') {
            responseElement.textContent = '问题的答案将在这里显示...';
        } else if (formType === 'chat') {
            responseElement.innerHTML = `
                        <div class="message message-ai">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <div class="message-time">现在</div>
                                您好！我是DeepSeek AI助手，很高兴为您服务。我可以与您进行各种话题的聊天对话，包括日常交流、问题解答、创意讨论等。有什么我可以帮助您的吗？
                            </div>
                        </div>
                    `;
            chatHistory = [];
        }
    }

    showNotification('表单已重置', 'info');
}

// 清空聊天历史
function clearChatHistory() {
    const chatResponse = document.getElementById('chat-response');
    if (chatResponse) {
        chatResponse.innerHTML = `
                    <div class="message message-ai">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-time">现在</div>
                            您好！我是DeepSeek AI助手，很高兴为您服务。我可以与您进行各种话题的聊天对话，包括日常交流、问题解答、创意讨论等。有什么我可以帮助您的吗？
                        </div>
                    </div>
                `;
        chatHistory = [];
        showNotification('聊天历史已清空', 'success');
    }
}

// 保存设置
function saveSettings() {
    const apiKey = document.getElementById('api-key').value;
    const defaultTemp = document.getElementById('default-temp-value').textContent;
    const defaultMaxTokens = document.getElementById('default-max-tokens-value').textContent;

    const settings = {
        apiKey: apiKey,
        defaultTemp: parseFloat(defaultTemp),
        defaultMaxTokens: parseInt(defaultMaxTokens),
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('deepseek_settings', JSON.stringify(settings));
    showNotification('设置已保存', 'success');

    // 更新API状态显示
    document.getElementById('api-status').textContent = apiKey ? '已配置' : '未配置';
}

// 加载设置
function loadSettings() {
    try {
        const saved = localStorage.getItem('deepseek_settings');
        if (saved) {
            const settings = JSON.parse(saved);

            if (document.getElementById('api-key')) {
                document.getElementById('api-key').value = settings.apiKey || '';
            }

            // 更新API状态显示
            document.getElementById('api-status').textContent = settings.apiKey ? '已配置' : '未配置';

            console.log('已加载设置:', settings);
            showNotification('设置已加载', 'success');
        }
    } catch (error) {
        console.error('加载设置失败:', error);
        showNotification('加载设置失败', 'error');
    }
}

// 重置设置
function resetSettings() {
    if (document.getElementById('api-key')) {
        document.getElementById('api-key').value = '';
    }

    // 重置滑块到默认值
    const defaultTempSlider = document.querySelector('.slider-thumb[data-param="default-temp"]');
    const defaultMaxTokensSlider = document.querySelector('.slider-thumb[data-param="default-max-tokens"]');

    if (defaultTempSlider) {
        defaultTempSlider.style.left = '35%';
        defaultTempSlider.previousElementSibling.style.width = '35%';
        document.getElementById('default-temp-value').textContent = '0.7';
    }

    if (defaultMaxTokensSlider) {
        defaultMaxTokensSlider.style.left = '50%';
        defaultMaxTokensSlider.previousElementSibling.style.width = '50%';
        document.getElementById('default-max-tokens-value').textContent = '1000';
    }

    showNotification('设置已恢复为默认值', 'success');
}

// 检查系统状态
function checkSystemStatus() {
    const statusElement = document.getElementById('system-status');
    statusElement.textContent = '检查中...';

    setTimeout(() => {
        checkServiceStatus();
    }, 1000);
}

// 通用API调用函数
async function callAPI(endpoint, data, loadingId, responseId) {
    const loading = document.getElementById(loadingId);
    const response = document.getElementById(responseId);

    if (loading) loading.classList.add('active');

    try {
        const result = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const jsonResponse = await result.json();

        if (jsonResponse.success) {
            if (response) {
                response.textContent = jsonResponse.content;
            }
            showNotification('请求成功', 'success');
        } else {
            if (response) {
                response.textContent = `错误: ${jsonResponse.errorMessage || '请求失败'}`;
            }
            showNotification('请求失败', 'error');
        }
    } catch (error) {
        if (response) {
            response.textContent = `网络错误: ${error.message}`;
        }
        showNotification('网络错误', 'error');
    } finally {
        if (loading) loading.classList.remove('active');
    }
}

// 营销文案生成
function generateMarketing() {
    const content = document.getElementById('marketing-input').value;
    const temperature = parseFloat(document.getElementById('marketing-temp-value').textContent);

    if (!content.trim()) {
        showNotification('请输入产品描述或需求', 'warning');
        return;
    }

    callAPI('/api/ai/tools/marketing/chat', {
        content: content,
        temperature: temperature,
        maxTokens: 1000
    }, 'marketing-loading', 'marketing-response');
}

// 代码生成
function generateCode() {
    const content = document.getElementById('code-input').value;
    const temperature = parseFloat(document.getElementById('code-temp-value').textContent);

    if (!content.trim()) {
        showNotification('请输入编程需求', 'warning');
        return;
    }

    callAPI('/api/ai/tools/coding/chat', {
        content: content,
        temperature: temperature,
        maxTokens: 1500
    }, 'code-loading', 'code-response');
}

// 智能问答
function answerQuestion() {
    const content = document.getElementById('qa-input').value;

    if (!content.trim()) {
        showNotification('请输入您的问题', 'warning');
        return;
    }

    callAPI('/api/ai/tools/qa/chat', {
        content: content,
        temperature: 0.7,
        maxTokens: 1000
    }, 'qa-loading', 'qa-response');
}

// 发送聊天消息
function sendChat() {
    const content = document.getElementById('chat-input').value;
    const temperature = parseFloat(document.getElementById('chat-temp-value').textContent);

    if (!content.trim()) {
        showNotification('请输入聊天消息', 'warning');
        return;
    }

    // 添加用户消息到聊天界面
    const chatResponse = document.getElementById('chat-response');
    if (!chatResponse) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'message message-user';
    userMessage.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    ${content}
                </div>
            `;
    chatResponse.appendChild(userMessage);

    // 保存到聊天历史
    chatHistory.push({
        role: 'user',
        content: content,
        timestamp: new Date().toISOString()
    });

    // 清空输入框
    document.getElementById('chat-input').value = '';

    // 滚动到底部
    chatResponse.scrollTop = chatResponse.scrollHeight;

    // 调用API
    callAPI('/api/ai/tools/common/chat', {
        content: content,
        temperature: temperature,
        maxTokens: 800
    }, 'chat-loading', 'chat-response');
}
