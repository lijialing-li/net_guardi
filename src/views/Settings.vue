<template>
  <div class="settings">
    <h2>系统设置</h2>
    <el-tabs type="border-card">
      <el-tab-pane label="告警规则">
        <h3>告警规则设置</h3>
        <el-form :model="ruleForm" label-width="120px">
          <el-form-item label="规则名称">
            <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
          </el-form-item>
          <el-form-item label="规则类型">
            <el-select v-model="ruleForm.type" placeholder="请选择规则类型">
              <el-option label="阈值告警" value="threshold" />
              <el-option label="异常检测" value="anomaly" />
              <el-option label="模式匹配" value="pattern" />
            </el-select>
          </el-form-item>
          <el-form-item label="严重程度">
            <el-radio-group v-model="ruleForm.severity">
              <el-radio label="critical">严重</el-radio>
              <el-radio label="warning">警告</el-radio>
              <el-radio label="info">信息</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="启用状态">
            <el-switch v-model="ruleForm.enabled" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveRule">保存</el-button>
            <el-button @click="resetRule">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Redis缓存">
        <h3>Redis缓存设置</h3>
        <el-form :model="redisForm" label-width="120px">
          <el-form-item label="缓存TTL(秒)">
            <el-input-number v-model="redisForm.ttl" :min="60" :max="86400" />
          </el-form-item>
          <el-form-item label="归档任务">
            <el-input v-model="redisForm.cron" placeholder="请输入Cron表达式" />
          </el-form-item>
          <el-form-item label="启用归档">
            <el-switch v-model="redisForm.enabled" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveRedisConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="API密钥">
        <h3>API密钥管理</h3>
        <el-form :model="apiKeyForm" label-width="120px">
          <el-form-item label="当前密钥">
            <el-input v-model="apiKeyForm.maskedKey" readonly>
              <template #append>
                <el-button @click="copyApiKey">复制</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="调用统计">
            <div ref="apiKeyChart" style="height: 200px"></div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generateApiKey">生成新密钥</el-button>
            <el-button type="danger" @click="revokeApiKey">撤销密钥</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="AI助手配置">
        <h3>AI模型设置</h3>
        <el-form :model="aiConfig" label-width="120px">
          <el-form-item label="AI模型">
            <el-select v-model="aiConfig.model" placeholder="请选择AI模型">
              <el-option label="OpenAI GPT" value="gpt" />
              <el-option label="通义千问" value="qianwen" />
              <el-option label="ChatGLM" value="chatglm" />
              <el-option label="Baichuan" value="baichuan" />
            </el-select>
          </el-form-item>
          <el-form-item label="API密钥">
            <el-input v-model="aiConfig.apiKey" type="password" show-password placeholder="请输入API密钥" />
          </el-form-item>
          <el-form-item label="API地址">
            <el-input v-model="aiConfig.apiEndpoint" placeholder="请输入API地址" />
          </el-form-item>
          <el-form-item label="上下文窗口">
            <el-input-number v-model="aiConfig.contextWindow" :min="1" :max="20" />
          </el-form-item>
          <el-form-item label="温度系数">
            <el-slider v-model="aiConfig.temperature" :min="0" :max="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="启用RAG">
            <el-switch v-model="aiConfig.enableRAG" />
            <span class="setting-tip">启用检索增强生成，提供更准确的上下文相关回答</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveAIConfig">保存配置</el-button>
            <el-button @click="testAIConnection">测试连接</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const ruleForm = ref({
  name: '',
  type: '',
  severity: 'warning',
  enabled: true
})

const redisForm = ref({
  ttl: 3600,
  cron: '',
  enabled: true
})

const apiKeyForm = ref({
  maskedKey: 'sk_******' + Math.random().toString(36).slice(-4),
  usageData: []
})

const aiConfig = ref({
  model: 'gpt',
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1',
  contextWindow: 5,
  temperature: 0.7,
  enableRAG: true
})

const saveRedisConfig = () => {
  ElMessage.success('Redis配置保存成功')
}

const copyApiKey = () => {
  navigator.clipboard.writeText(apiKeyForm.value.maskedKey)
  ElMessage.success('密钥已复制到剪贴板')
}

const generateApiKey = () => {
  apiKeyForm.value.maskedKey = 'sk_' + Math.random().toString(36).slice(2, 10) + '_' + Math.random().toString(36).slice(2, 6)
  ElMessage.success('新密钥生成成功')
}

const revokeApiKey = () => {
  apiKeyForm.value.maskedKey = ''
  ElMessage.warning('密钥已撤销')
}

const saveAIConfig = () => {
  // TODO: 实现配置保存逻辑
  ElMessage.success('AI配置保存成功')
}

const testAIConnection = async () => {
  try {
    // TODO: 实现AI连接测试逻辑
    ElMessage.success('AI连接测试成功')
  } catch (error) {
    ElMessage.error('AI连接测试失败：' + error.message)
  }
}

const saveRule = () => {
  ElMessage.success('规则保存成功')
}

const resetRule = () => {
  ruleForm.value = {
    name: '',
    type: '',
    severity: 'warning',
    enabled: true
  }
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.setting-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>