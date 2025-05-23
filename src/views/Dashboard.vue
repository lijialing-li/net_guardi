<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 设备状态监控 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>设备状态监控</span>
              <el-button-group>
                <el-button :icon="Refresh" circle @click="refreshData" />
                <el-button :loading="autoRefresh" type="primary" @click="toggleAutoRefresh">
                  {{ autoRefresh ? '停止刷新' : '自动刷新' }}
                </el-button>
              </el-button-group>
            </div>
          </template>
          <div class="status-overview">
            <div class="status-item">
              <div class="number total">{{ deviceStats.total }}</div>
              <div class="label">设备总数</div>
            </div>
            <div class="status-item">
              <div class="number online">{{ deviceStats.online }}</div>
              <div class="label">在线设备</div>
            </div>
            <div class="status-item">
              <div class="number offline">{{ deviceStats.offline }}</div>
              <div class="label">离线设备</div>
            </div>
          </div>
          <div ref="deviceChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 流量质量监控 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>流量质量监控</span>
            </div>
          </template>
          <div ref="trafficChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 设备性能监控 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>设备性能监控</span>
            </div>
          </template>
          <div ref="performanceChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 网络协议分析 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>网络协议分析</span>
            </div>
          </template>
          <div ref="protocolChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 网络拓扑图 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>网络拓扑监控</span>
            </div>
          </template>
          <div ref="topologyChart" class="chart-container topology"></div>
        </el-card>
      </el-col>

      <!-- 告警统计 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>告警统计</span>
            </div>
          </template>
          <div class="alert-overview">
            <div class="alert-item critical">
              <el-icon><Warning /></el-icon>
              <span>严重告警：{{ alertStats.critical }}</span>
            </div>
            <div class="alert-item warning">
              <el-icon><InfoFilled /></el-icon>
              <span>一般告警：{{ alertStats.warning }}</span>
            </div>
          </div>
          <div ref="alertChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 安全事件分布 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>安全事件分布</span>
            </div>
          </template>
          <div ref="securityChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 流量质量指标 -->
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>流量质量指标</span>
            </div>
          </template>
          <div ref="qualityChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh, Warning, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 状态变量
const autoRefresh = ref(false)
const refreshInterval = ref(null)

// 图表引用
const deviceChart = ref(null)
const trafficChart = ref(null)
const topologyChart = ref(null)
const alertChart = ref(null)
const performanceChart = ref(null)
const protocolChart = ref(null)
const securityChart = ref(null)
const qualityChart = ref(null)

// 模拟数据
const deviceStats = ref({
  total: 128,
  online: 98,
  offline: 30
})

const alertStats = ref({
  critical: 5,
  warning: 12
})

const performanceStats = ref({
  cpu: 45,
  memory: 60,
  disk: 35
})

const protocolStats = ref({
  tcp: 65,
  udp: 25,
  icmp: 10
})

const securityStats = ref({
  ddos: 15,
  intrusion: 8,
  malware: 12,
  other: 5
})

const qualityStats = ref({
  latency: 25,
  packetLoss: 2,
  jitter: 8
})

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    clearInterval(refreshInterval.value)
  }
}

// 刷新数据
const refreshData = () => {
  initDeviceChart()
  initTrafficChart()
  initTopologyChart()
  initAlertChart()
  initPerformanceChart()
  initProtocolChart()
  initSecurityChart()
  initQualityChart()
}

// 启动自动刷新
const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    refreshData()
  }, 30000) // 每30秒刷新一次
}

// 初始化设备状态图表
const initDeviceChart = () => {
  const chart = echarts.init(deviceChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: deviceStats.value.online, name: '在线设备' },
          { value: deviceStats.value.offline, name: '离线设备' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化流量监控图表
const initTrafficChart = () => {
  const chart = echarts.init(trafficChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['入站流量', '出站流量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入站流量',
        type: 'line',
        stack: 'Total',
        data: [120, 132, 101, 134, 90, 230, 210, 180]
      },
      {
        name: '出站流量',
        type: 'line',
        stack: 'Total',
        data: [220, 182, 191, 234, 290, 330, 310, 230]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化拓扑图
const initTopologyChart = () => {
  const chart = echarts.init(topologyChart.value)
  const option = {
    tooltip: {},
    series: [
      {
        type: 'graph',
        layout: 'force',
        animation: false,
        label: {
          show: true,
          position: 'right'
        },
        draggable: true,
        data: [
          {
            name: '核心交换机',
            symbolSize: 50,
            category: 0,
            itemStyle: { color: '#4e79a7' }
          },
          {
            name: '防火墙',
            symbolSize: 40,
            category: 1,
            itemStyle: { color: '#f28e2c' }
          },
          {
            name: '路由器A',
            symbolSize: 30,
            category: 1,
            itemStyle: { color: '#e15759' }
          },
          {
            name: '路由器B',
            symbolSize: 30,
            category: 1,
            itemStyle: { color: '#76b7b2' }
          }
        ],
        categories: [
          { name: '核心设备' },
          { name: '网络设备' }
        ],
        force: {
          repulsion: 100,
          edgeLength: 100
        },
        edges: [
          { source: '核心交换机', target: '防火墙' },
          { source: '核心交换机', target: '路由器A' },
          { source: '核心交换机', target: '路由器B' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化告警图表
const initAlertChart = () => {
  const chart = echarts.init(alertChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['严重告警', '一般告警']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '严重告警',
        type: 'bar',
        data: [5, 7, 3, 4, 6, 2, 1],
        itemStyle: { color: '#e15759' }
      },
      {
        name: '一般告警',
        type: 'bar',
        data: [12, 15, 8, 10, 13, 7, 5],
        itemStyle: { color: '#f28e2c' }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化设备性能图表
const initPerformanceChart = () => {
  const chart = echarts.init(performanceChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['CPU使用率', '内存使用率', '磁盘使用率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        data: [performanceStats.value.cpu, 42, 48, 50, 45, 42]
      },
      {
        name: '内存使用率',
        type: 'line',
        data: [performanceStats.value.memory, 58, 65, 62, 58, 55]
      },
      {
        name: '磁盘使用率',
        type: 'line',
        data: [performanceStats.value.disk, 32, 38, 35, 30, 28]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化网络协议分析图表
const initProtocolChart = () => {
  const chart = echarts.init(protocolChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        name: '协议分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        data: [
          { value: protocolStats.value.tcp, name: 'TCP' },
          { value: protocolStats.value.udp, name: 'UDP' },
          { value: protocolStats.value.icmp, name: 'ICMP' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化安全事件分布图表
const initSecurityChart = () => {
  const chart = echarts.init(securityChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '安全事件',
        type: 'pie',
        radius: '50%',
        data: [
          { value: securityStats.value.ddos, name: 'DDoS攻击' },
          { value: securityStats.value.intrusion, name: '入侵检测' },
          { value: securityStats.value.malware, name: '恶意软件' },
          { value: securityStats.value.other, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化流量质量指标图表
const initQualityChart = () => {
  const chart = echarts.init(qualityChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    radar: {
      indicator: [
        { name: '网络延迟', max: 100 },
        { name: '丢包率', max: 10 },
        { name: '网络抖动', max: 20 }
      ]
    },
    series: [
      {
        name: '流量质量指标',
        type: 'radar',
        data: [
          {
            value: [
              qualityStats.value.latency,
              qualityStats.value.packetLoss,
              qualityStats.value.jitter
            ],
            name: '当前值'
          }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 组件挂载时初始化所有图表
onMounted(() => {
  refreshData()
  window.addEventListener('resize', () => {
    deviceChart.value?.resize()
    trafficChart.value?.resize()
    topologyChart.value?.resize()
    alertChart.value?.resize()
    performanceChart.value?.resize()
    protocolChart.value?.resize()
    securityChart.value?.resize()
    qualityChart.value?.resize()
  })
})

// 组件卸载时清理定时器和事件监听
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.dashboard-card {
  height: 100%;
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-overview {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.status-item {
  text-align: center;
}

.number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.number.total { color: #409EFF; }
.number.online { color: #67C23A; }
.number.offline { color: #F56C6C; }

.label {
  color: #606266;
}

.chart-container {
  height: 300px;
}

.chart-container.topology {
  height: 400px;
}

.alert-overview {
  margin-bottom: 20px;
}

.alert-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
}

.alert-item.critical {
  background-color: #fef0f0;
  color: #f56c6c;
}

.alert-item.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.alert-item .el-icon {
  margin-right: 8px;
  font-size: 20px;
}
</style>