<template>
  <div class="alerts">
    <el-row :gutter="20">
      <!-- 告警列表 -->
      <el-col :span="8">
        <el-card class="alert-list-card">
          <template #header>
            <div class="card-header">
              <span>告警列表</span>
              <div class="header-operations">
                <el-button type="primary" size="small" @click="refreshAlerts">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <el-table :data="alertList" style="width: 100%">
            <el-table-column width="40">
              <template #default="{ row }">
                <el-icon v-if="row.urgent" color="#F56C6C"><Warning /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="告警标题" />
            <el-table-column prop="level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="getAlertLevelType(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="180" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 处理流程 -->
      <el-col :span="8">
        <el-card class="process-card">
          <template #header>
            <div class="card-header">
              <span>处理流程</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :type="activity.type"
              :color="activity.color"
              :timestamp="activity.timestamp"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- AI建议 -->
      <el-col :span="8">
        <el-card class="ai-suggestion-card">
          <template #header>
            <div class="card-header">
              <span>AI建议</span>
              <el-button type="primary" size="small" @click="getAISuggestion">
                获取建议
              </el-button>
            </div>
          </template>
          <div class="ai-content" v-loading="aiLoading">
            <div v-if="aiSuggestion" class="suggestion-text">
              {{ aiSuggestion }}
            </div>
            <el-empty v-else description="暂无AI建议" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Warning } from '@element-plus/icons-vue'

// WebSocket连接
const ws = ref(null)

// 告警列表数据
const alertList = ref([
  {
    id: 1,
    title: '服务器CPU使用率过高',
    level: '严重',
    time: '2024-01-20 15:30:00',
    urgent: true
  },
  {
    id: 2,
    title: '网络连接异常',
    level: '警告',
    time: '2024-01-20 15:25:00',
    urgent: false
  }
])

// 处理流程数据
const activities = ref([
  {
    content: '系统自动检测到异常',
    timestamp: '2024-01-20 15:30:00',
    type: 'warning',
    color: '#E6A23C'
  },
  {
    content: '告警通知已发送',
    timestamp: '2024-01-20 15:30:05',
    type: 'info',
    color: '#909399'
  }
])

// AI建议相关
const aiSuggestion = ref('')
const aiLoading = ref(false)

// 方法定义
const getAlertLevelType = (level) => {
  const typeMap = {
    '严重': 'danger',
    '警告': 'warning',
    '提示': 'info'
  }
  return typeMap[level] || 'info'
}

const refreshAlerts = () => {
  // TODO: 实现刷新告警列表逻辑
  ElMessage.success('告警列表已刷新')
}

const getAISuggestion = async () => {
  aiLoading.value = true
  try {
    // TODO: 调用Flask API获取AI建议
    await new Promise(resolve => setTimeout(resolve, 1000))
    aiSuggestion.value = '建议检查服务器资源使用情况，可能需要进行负载均衡或扩容...'
  } catch (error) {
    ElMessage.error('获取AI建议失败')
  } finally {
    aiLoading.value = false
  }
}

const initWebSocket = () => {
  // TODO: 实现WebSocket连接
  console.log('WebSocket连接已初始化')
}

// 生命周期钩子
onMounted(() => {
  initWebSocket()
})

onBeforeUnmount(() => {
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<style scoped>
.alerts {
  padding: 20px;
}

.alert-list-card,
.process-card,
.ai-suggestion-card {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.ai-content {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.suggestion-text {
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>