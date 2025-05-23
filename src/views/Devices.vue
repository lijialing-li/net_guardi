<template>
  <div class="devices">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="device-tree-card">
          <template #header>
            <div class="card-header">
              <span>设备分类</span>
              <el-button type="primary" size="small" @click="refreshTree">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <el-tree
            ref="deviceTreeRef"
            :data="treeData"
            :props="defaultProps"
            @node-click="handleNodeClick"
            highlight-current
          />
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>设备列表</span>
              <div class="header-operations">
                <el-button type="success" @click="batchStart">批量启动</el-button>
                <el-button type="danger" @click="batchStop">批量停止</el-button>
                <el-button type="primary" @click="openDeviceDialog">添加设备</el-button>
              </div>
            </div>
          </template>
          <el-table
            :data="deviceList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="设备名称" />
            <el-table-column prop="ip" label="IP地址" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'running' ? 'success' : 'danger'">
                  {{ row.status === 'running' ? '运行中' : '已停止' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastActive" label="最后活跃时间" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="showDeviceDetail(row)">详情</el-button>
                <el-button 
                  size="small" 
                  :type="row.status === 'running' ? 'danger' : 'success'"
                  @click="toggleDeviceStatus(row)"
                >
                  {{ row.status === 'running' ? '停止' : '启动' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备详情弹窗 -->
    <el-dialog
      v-model="deviceDialogVisible"
      title="设备详情"
      width="70%"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备名称">{{ currentDevice.name }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{ currentDevice.ip }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentDevice.status === 'running' ? 'success' : 'danger'">
                {{ currentDevice.status === 'running' ? '运行中' : '已停止' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后活跃时间">{{ currentDevice.lastActive }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="性能指标" name="metrics">
          <!-- 这里将添加性能指标图表 -->
          <div class="metrics-chart" style="height: 400px">
            <!-- 图表将在后续添加 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="配置管理" name="config">
          <el-form :model="deviceConfig" label-width="120px">
            <el-form-item label="监控间隔(秒)">
              <el-input-number v-model="deviceConfig.interval" :min="1" :max="3600" />
            </el-form-item>
            <el-form-item label="告警阈值">
              <el-input-number v-model="deviceConfig.threshold" :min="0" :max="100" />
            </el-form-item>
            <el-form-item label="自动重启">
              <el-switch v-model="deviceConfig.autoRestart" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveDeviceConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

// 设备树相关
const deviceTreeRef = ref(null)
const treeData = ref([
  {
    label: '所有设备',
    children: [
      { label: '网络设备', children: [{ label: '路由器' }, { label: '交换机' }] },
      { label: '服务器', children: [{ label: '应用服务器' }, { label: '数据库服务器' }] },
      { label: '终端设备', children: [{ label: '工作站' }, { label: '打印机' }] }
    ]
  }
])
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 设备列表相关
const deviceList = ref([
  {
    name: 'Router-01',
    ip: '192.168.1.1',
    status: 'running',
    lastActive: '2024-01-20 10:30:00'
  },
  {
    name: 'Switch-01',
    ip: '192.168.1.2',
    status: 'stopped',
    lastActive: '2024-01-20 09:15:00'
  }
])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedDevices = ref([])

// 设备详情弹窗相关
const deviceDialogVisible = ref(false)
const activeTab = ref('info')
const currentDevice = ref({})
const deviceConfig = ref({
  interval: 60,
  threshold: 80,
  autoRestart: false
})

// 方法定义
const refreshTree = () => {
  // TODO: 实现刷新设备树逻辑
  ElMessage.success('设备树已刷新')
}

const handleNodeClick = (data) => {
  // TODO: 实现节点点击逻辑
  console.log('节点点击:', data)
}

const handleSelectionChange = (selection) => {
  selectedDevices.value = selection
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}

const showDeviceDetail = (device) => {
  currentDevice.value = device
  deviceDialogVisible.value = true
}

const toggleDeviceStatus = (device) => {
  // TODO: 实现设备状态切换逻辑
  device.status = device.status === 'running' ? 'stopped' : 'running'
  ElMessage.success(`设备${device.status === 'running' ? '启动' : '停止'}成功`)
}

const batchStart = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请选择要启动的设备')
    return
  }
  // TODO: 实现批量启动逻辑
  ElMessage.success('批量启动指令已发送')
}

const batchStop = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请选择要停止的设备')
    return
  }
  // TODO: 实现批量停止逻辑
  ElMessage.success('批量停止指令已发送')
}

const saveDeviceConfig = () => {
  // TODO: 实现保存设备配置逻辑
  ElMessage.success('配置保存成功')
}

onMounted(() => {
  // TODO: 初始化加载数据
})
</script>

<style scoped>
.devices {
  padding: 20px;
}

.device-tree-card {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mt-20 {
  margin-top: 20px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-card {
  margin-bottom: 20px;
}
</style>