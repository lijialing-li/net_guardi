<template>
  <div class="data-screen" :class="{ fullscreen: isFullscreen }">
    <div class="screen-header">
      <h2>网络安全态势感知平台</h2>
      <div class="header-right">
        <el-button type="primary" size="small" @click="toggleRefresh">
          <el-icon class="refresh-icon" :class="{ 'is-loading': autoRefresh }">
            <Refresh />
          </el-icon>
          {{ autoRefresh ? '停止刷新' : '自动刷新' }}
        </el-button>
        <el-button type="primary" size="small" @click="toggleFullscreen">
          <el-icon>
            <FullScreen v-if="!isFullscreen" />
            <Aim v-else />
          </el-icon>
          {{ isFullscreen ? '退出全屏' : '全屏显示' }}
        </el-button>
      </div>
    </div>

    <div class="screen-content">
      <el-row :gutter="20">
        <el-col :span="16">
          <div class="chart-panel main-chart">
            <h3>网络拓扑实时监控</h3>
            <div ref="topologyChart" class="topology-chart"></div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="chart-panel">
            <h3>设备状态分布</h3>
            <div class="status-numbers">
              <div class="status-item">
                <div class="number">{{ deviceStats.total }}</div>
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
            <div ref="deviceChart" class="device-chart"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-20">
        <el-col :span="12">
          <div class="chart-panel">
            <h3>实时流量监控</h3>
            <div ref="trafficChart" class="traffic-chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-panel">
            <h3>告警趋势分析</h3>
            <div class="alert-stats">
              <div class="alert-item critical">
                <el-icon><Warning /></el-icon>
                <span>严重告警：{{ alertStats.critical }}</span>
              </div>
              <div class="alert-item warning">
                <el-icon><InfoFilled /></el-icon>
                <span>一般告警：{{ alertStats.warning }}</span>
              </div>
            </div>
            <div ref="alertChart" class="alert-chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh, FullScreen, Aim, Warning, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 状态变量
const isFullscreen = ref(false)
const autoRefresh = ref(true)
const refreshInterval = ref(null)

// 图表引用
const topologyChart = ref(null)
const deviceChart = ref(null)
const trafficChart = ref(null)
const alertChart = ref(null)

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

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 切换自动刷新
const toggleRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    clearInterval(refreshInterval.value)
  }
}

// 初始化拓扑图
const initTopologyChart = () => {
  const chart = echarts.init(topologyChart.value)
  const nodes = [
    { name: '核心交换机', x: 300, y: 300, symbolSize: 50 },
    { name: '防火墙', x: 500, y: 300, symbolSize: 40 },
    { name: '路由器A', x: 200, y: 400, symbolSize: 30 },
    { name: '路由器B', x: 400, y: 400, symbolSize: 30 },
    { name: '服务器集群', x: 600, y: 400, symbolSize: 35 }
  ]
  const edges = [
    { source: '核心交换机', target: '防火墙' },
    { source: '核心交换机', target: '路由器A' },
    { source: '核心交换机', target: '路由器B' },
    { source: '防火墙', target: '服务器集群' }
  ]

  const option = {
    tooltip: {},
    series: [{
      type: 'graph',
      layout: 'none',
      symbolSize: 50,
      roam: true,
      label: {
        show: true
      },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [4, 10],
      edgeLabel: {
        fontSize: 20
      },
      data: nodes,
      links: edges,
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0
      }
    }]
  }
  chart.setOption(option)
}

// 初始化设备状态图表
const initDeviceChart = () => {
  const chart = echarts.init(deviceChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: ['60%', '80%'],
      avoidLabelOverlap: false,
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
      labelLine: {
        show: false
      },
      data: [
        { value: deviceStats.value.online, name: '在线设备', itemStyle: { color: '#67C23A' } },
        { value: deviceStats.value.offline, name: '离线设备', itemStyle: { color: '#909399' } }
      ]
    }]
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
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    },
    yAxis: {
      type: 'value',
      name: 'Mbps'
    },
    series: [{
      name: '入站流量',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 0
      },
      areaStyle: {
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(128, 255, 165)'
        }, {
          offset: 1,
          color: 'rgba(1, 191, 236)'
        }])
      },
      emphasis: {
        focus: 'series'
      },
      data: [140, 232, 101, 264, 90, 340, 250, 180]
    }, {
      name: '出站流量',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 0
      },
      areaStyle: {
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(0, 221, 255)'
        }, {
          offset: 1,
          color: 'rgba(77, 119, 255)'
        }])
      },
      emphasis: {
        focus: 'series'
      },
      data: [120, 282, 111, 234, 220, 340, 310, 150]
    }]
  }
  chart.setOption(option)
}

// 初始化告警趋势图表
const initAlertChart = () => {
  const chart = echarts.init(alertChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '严重告警',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#F56C6C'
      },
      data: [3, 4, 5, 2, 3, 1, 2]
    }, {
      name: '一般告警',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#E6A23C'
      },
      data: [8, 6, 5, 7, 9, 8, 7]
    }]
  }
  chart.setOption(option)
}

// 自动刷新数据
const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    // 模拟数据更新
    deviceStats.value = {
      total: Math.floor(Math.random() * 50) + 100,
      online: Math.floor(Math.random() * 30) + 80,
      offline: Math.floor(Math.random() * 20) + 20
    }
    alertStats.value = {
      critical: Math.floor(Math.random() * 8) + 2,
      warning: Math.floor(Math.random() * 15) + 8
    }
    
    // 更新图表
    initDeviceChart()
    initTrafficChart()
    initAlertChart()
    initTopologyChart()
  }, 5000)
}

// 生命周期钩子
onMounted(() => {
  initTopologyChart()
  initDeviceChart()
  initTrafficChart()
  initAlertChart()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.data-screen {
  height: 100vh;
  background-color: #0a1929;
  color: #fff;
  padding: 20px;
}

.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.screen-header h2 {
  margin: 0;
  font-size: 24px;
  background: linear-gradient(to right, #1890ff, #39c5bb);
  -webkit-background-clip: text;
  color: transparent;
}

.header-right .refresh-icon {
  animation: none;
}

.header-right .refresh-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.screen-content {
  height: calc(100vh - 100px);
}

.chart-panel {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 20px;
  height: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-panel h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #1890ff;
}

.main-chart {
  height: 500px;
}

.topology-chart {
  height: 100%;
  min-height: 400px;
}

.status-numbers {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.status-item {
  text-align: center;
}

.status-item .number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-item .number.online {
  color: #67C23A;
}

.status-item .number.offline {
  color: #909399;
}

.status-item .label {
  font-size: 14px;
  color: #909399;
}

.device-chart,
.traffic-chart,
.alert-chart {
  height: 300px;
}

.alert-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-item.critical {
  color: #F56C6C;
}

.alert-item.warning {
  color: #E6A23C;
}

.mt-20 {
  margin-top: 20px;
}

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}
</style>