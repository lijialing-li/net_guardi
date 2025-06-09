<template>
  <div class="device-list">
    <div class="list-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/devices' }"
          >设备管理</el-breadcrumb-item
        >
        <el-breadcrumb-item>设备列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-row :gutter="20">
      <!-- 设备分类树 -->
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

      <!-- 设备列表 -->
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span>设备列表</span>
                <el-tag type="info" class="device-count"
                  >共 {{ total }} 台设备</el-tag
                >
              </div>
              <div class="header-operations">
                <el-button type="success" @click="batchStart"
                  >批量启动</el-button
                >
                <el-button type="danger" @click="batchStop">批量停止</el-button>
                <el-button type="primary" @click="openDeviceDialog"
                  >添加设备</el-button
                >
              </div>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <div class="search-bar">
            <el-input
              v-model="searchQuery"
              placeholder="搜索设备名称/IP"
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="设备状态" clearable>
              <el-option label="运行中" value="running" />
              <el-option label="已停止" value="stopped" />
              <el-option label="离线" value="offline" />
            </el-select>
            <el-select v-model="regionFilter" placeholder="所属地区" clearable>
              <el-option
                v-for="region in regions"
                :key="region.value"
                :label="region.label"
                :value="region.value"
              />
            </el-select>
          </div>

          <!-- 设备列表表格 -->
          <el-table
            :data="deviceList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="设备名称" />
            <el-table-column prop="ip" label="IP地址" />
            <el-table-column prop="type" label="设备类型" />
            <el-table-column prop="region" label="所属地区" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastActive" label="最后活跃时间" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="showDeviceDetail(row)"
                  >详情</el-button
                >
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

          <!-- 分页 -->
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
    <el-dialog v-model="deviceDialogVisible" title="设备详情" width="70%">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备名称">{{
              currentDevice.name
            }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{
              currentDevice.ip
            }}</el-descriptions-item>
            <el-descriptions-item label="MAC地址">{{
              currentDevice.mac
            }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{
              currentDevice.type
            }}</el-descriptions-item>
            <el-descriptions-item label="所属地区">{{
              currentDevice.region
            }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentDevice.status)">
                {{ getStatusText(currentDevice.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后活跃时间">{{
              currentDevice.lastActive
            }}</el-descriptions-item>
            <el-descriptions-item label="首次登记时间">{{
              currentDevice.createTime
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="配置管理" name="config">
          <el-form :model="deviceConfig" label-width="120px">
            <el-form-item label="监控间隔(秒)">
              <el-input-number
                v-model="deviceConfig.interval"
                :min="1"
                :max="3600"
              />
            </el-form-item>
            <el-form-item label="告警阈值">
              <el-input-number
                v-model="deviceConfig.threshold"
                :min="0"
                :max="100"
              />
            </el-form-item>
            <el-form-item label="自动重启">
              <el-switch v-model="deviceConfig.autoRestart" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveDeviceConfig"
                >保存配置</el-button
              >
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
import { Refresh, Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 设备树相关
const deviceTreeRef = ref(null)
const treeData = ref([
  {
    label: '所有设备',
    children: [
      {
        label: '网络设备',
        children: [{ label: '路由器' }, { label: '交换机' }]
      },
      {
        label: '服务器',
        children: [{ label: '应用服务器' }, { label: '数据库服务器' }]
      },
      {
        label: '终端设备',
        children: [{ label: '工作站' }, { label: '打印机' }]
      }
    ]
  }
])
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')
const regionFilter = ref('')
const regions = [
  { value: 'zhejiang', label: '浙江' },
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangdong', label: '广东' }
]

// 设备列表相关
const deviceList = ref([
  {
    name: 'Router-01',
    ip: '192.168.1.1',
    mac: '00:11:22:33:44:55',
    type: '路由器',
    region: '浙江',
    status: 'running',
    lastActive: '2024-01-20 10:30:00',
    createTime: '2023-12-01 08:00:00'
  },
  {
    name: 'Switch-01',
    ip: '192.168.1.2',
    mac: '00:11:22:33:44:66',
    type: '交换机',
    region: '北京',
    status: 'stopped',
    lastActive: '2024-01-20 09:15:00',
    createTime: '2023-12-01 08:00:00'
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

// 图表实例
const cpuChartRef = ref(null)
const memoryChartRef = ref(null)
const networkChartRef = ref(null)
let cpuChart = null
let memoryChart = null
let networkChart = null

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

const getStatusType = (status) => {
  const types = {
    running: 'success',
    stopped: 'danger',
    offline: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    stopped: '已停止',
    offline: '离线'
  }
  return texts[status] || '未知'
}

const showDeviceDetail = (device) => {
  currentDevice.value = { ...device }
  deviceDialogVisible.value = true
  activeTab.value = 'info'
  // 在切换到性能指标标签时初始化图表
}

const toggleDeviceStatus = (device) => {
  // TODO: 实现设备状态切换逻辑
  const action = device.status === 'running' ? '停止' : '启动'
  ElMessage.success(`设备${action}成功`)
}

const batchStart = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请选择要启动的设备')
    return
  }
  // TODO: 实现批量启动逻辑
  ElMessage.success('批量启动成功')
}

const batchStop = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请选择要停止的设备')
    return
  }
  // TODO: 实现批量停止逻辑
  ElMessage.success('批量停止成功')
}

const openDeviceDialog = () => {
  // TODO: 实现添加设备逻辑
}

const saveDeviceConfig = () => {
  // TODO: 实现保存设备配置逻辑
  ElMessage.success('配置保存成功')
}

// 初始化图表
const initCharts = () => {
  // CPU使用率图表
  cpuChart = echarts.init(cpuChartRef.value)
  const cpuOption = {
    title: { text: 'CPU使用率' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [30, 45, 35, 50, 40, 35, 30],
        type: 'line',
        smooth: true
      }
    ]
  }
  cpuChart.setOption(cpuOption)

  // 内存使用率图表
  memoryChart = echarts.init(memoryChartRef.value)
  const memoryOption = {
    title: { text: '内存使用率' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [60, 70, 65, 75, 80, 70, 65],
        type: 'line',
        smooth: true
      }
    ]
  }
  memoryChart.setOption(memoryOption)

  // 网络流量图表
  networkChart = echarts.init(networkChartRef.value)
  const networkOption = {
    title: { text: '网络流量' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['上行', '下行'] },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '上行',
        type: 'line',
        smooth: true,
        data: [120, 150, 130, 170, 160, 140, 130]
      },
      {
        name: '下行',
        type: 'line',
        smooth: true,
        data: [220, 250, 230, 270, 260, 240, 230]
      }
    ]
  }
  networkChart.setOption(networkOption)
}

// 监听标签页切换
const watchTabChange = () => {
  if (activeTab.value === 'metrics') {
    // 等待DOM更新后初始化图表
    setTimeout(() => {
      initCharts()
    }, 0)
  }
}

onMounted(() => {
  // 监听标签页变化
  watchTabChange()
})
</script>

<style scoped>
.device-list {
  padding: 20px;
}

.list-header {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.device-count {
  margin-left: 10px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.metrics-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart {
  height: 300px;
}
</style>
