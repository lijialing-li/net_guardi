<template>
  <div class="ai-assistant" :class="{ 'is-open': isOpen }">
    <div class="assistant-trigger" @click="toggleAssistant">
      <el-button type="primary" circle class="sized-button">
        <el-icon><ChatDotRound /></el-icon>
      </el-button>
    </div>

    <el-card v-show="isOpen" class="assistant-panel">
      <template #header>
        <div class="panel-header">
          <span>NetAI 助手</span>
          <el-button type="text" @click="toggleAssistant">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="chat-container" ref="chatContainer">
        <div class="chat-messages" ref="messageList">
          <div v-for="(msg, index) in messages" :key="index" 
               :class="['message', msg.role === 'assistant' ? 'assistant' : 'user']">
            <div class="message-content">
              <v-md-preview :text="msg.content" />
            </div>
            <div v-if="msg.role === 'assistant'" class="message-actions">
              <el-button-group size="small" >
                <el-button type="text" @click="handleFeedback(msg.id, 'like')">
                  <el-icon><ThumbsUp /></el-icon>
                </el-button>
                <el-button type="text" @click="handleFeedback(msg.id, 'dislike')">
                  <el-icon><ThumbsDown /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div v-if="loading" class="message assistant">
            <div class="message-content">
              <el-skeleton :rows="2" animated />
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="2"
          placeholder="请输入您的问题，按 Ctrl + Enter 发送"
          @keydown.ctrl.enter.prevent="sendMessage"
          :disabled="loading"
        />
        <el-button 
          type="primary" 
          :icon="loading ? 'Loading' : 'Position'"
          :loading="loading"
          @click="sendMessage"
          :disabled="!userInput.trim()"
        >
          发送
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Close, ThumbsUp, ThumbsDown } from '@element-plus/icons-vue'


// 状态变量
const isOpen = ref(false)
const loading = ref(false)
const userInput = ref('')
const messages = ref([])
const chatContainer = ref(null)
const messageList = ref(null)

// 切换助手显示状态
const toggleAssistant = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 发送消息
const sendMessage = async () => {
  const input = userInput.value.trim()
  if (!input || loading.value) return

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: input
  })

  userInput.value = ''
  loading.value = true

  try {
    // TODO: 调用AI服务API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟AI响应
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: `您的问题是：${input}\n\n这是一个示例回答，支持 **Markdown** 格式。\n\n- 项目1\n- 项目2\n\n\`\`\`python\nprint("Hello World")\n\`\`\``
    })

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    ElMessage.error('请求失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 处理反馈
const handleFeedback = (messageId, type) => {
  // TODO: 发送反馈到服务器
  ElMessage.success(`感谢您的${type === 'like' ? '好评' : '反馈'}`)
}

// 滚动到底部
const scrollToBottom = () => {
  const container = chatContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// 注册快捷键
onMounted(() => {
  const handleKeydown = (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      toggleAssistant()
    }
  }
  window.addEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}
.sized-button {
  width: 50px !important;
  height: 50px;
}
.assistant-trigger {
  cursor: pointer;
}

.assistant-panel {
  position: absolute;
  right: 0;
  bottom: 60px;
  width: 400px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 15px;
  max-width: 85%;
}

.message.user {
  margin-left: auto;
}

.message.assistant {
  margin-right: auto;
}

.message-content {
  padding: 10px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
}

.message.user .message-content {
  background: var(--el-color-primary);
  color: white;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  gap: 10px;
}

:deep(.v-md-editor__preview) {
  background: transparent !important;
  padding: 0 !important;
}

:deep(.message.user .v-md-editor__preview) {
  color: white !important;
}
</style>