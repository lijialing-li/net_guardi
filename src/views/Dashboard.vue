<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>实时流量</span>
              <el-select v-model="timeRange" size="small">
                <el-option label="1小时" value="1h" />
                <el-option label="6小时" value="6h" />
                <el-option label="24小时" value="24h" />
              </el-select>
            </div>
          </template>
          <div ref="trafficChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>网络拓扑</span>
              <el-switch
                v-model="autoRefresh"
                active-text="自动刷新"
                inactive-text=""
                size="small"
              />
            </div>
          </template>
          <div ref="topologyChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>设备状态</span>
              <el-tag size="small" type="success" effect="dark">{{ deviceTotal }}台设备</el-tag>
            </div>
          </template>
          <div ref="deviceChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>告警统计</span>
              <el-button type="danger" size="small" :loading="loading" @click="handleAlerts">
                {{ unhandledAlerts }}个未处理
              </el-button>
            </div>
          </template>
          <div ref="alertChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()
const timeRange = ref('1h')
const autoRefresh = ref(true)
const deviceTotal = ref(32)
const unhandledAlerts = ref(12)
const loading = ref(false)

// 图表实例
const trafficChart = ref(null)
const topologyChart = ref(null)
const deviceChart = ref(null)
const alertChart = ref(null)
let charts = []

// 初始化实时流量热力图
const initTrafficChart = () => {
  const chart = echarts.init(trafficChart.value)
  const data = [
    ['192.168.1.1', '10:20', 30],
    ['192.168.1.2', '10:40', 50],
    ['192.168.1.3', '11:00', 80],
    ['192.168.1.4', '11:20', 70],
    ['192.168.1.5', '11:40', 90],
  ]
  const option = {
    tooltip: {
      position: 'top'
    },
    grid: {
      top: '10%',
      left: '5%',
      right: '5%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: ['10:20', '10:40', '11:00', '11:20', '11:40', '12:00'],
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5'],
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
          '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    series: [{
      name: '流量',
      type: 'heatmap',
      data: data,
      emphasis: {
        itemStyle: {
          borderColor: '#333',
          borderWidth: 1
        }
      },
      progressive: 1000,
      animation: false
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 初始化网络拓扑图
const initTopologyChart = () => {
  const chart = echarts.init(topologyChart.value)
  const option = {
    tooltip: {},
    series: [{
      type: 'graph',
      layout: 'force',
      animation: false,
      draggable: true,
      data: [
        { name: 'Switch 1', value: 20, category: 0, symbolSize: 40 },
        { name: 'Switch 2', value: 20, category: 0, symbolSize: 40 },
        { name: 'Switch 3', value: 20, category: 0, symbolSize: 40 },
        { name: 'Host 1', value: 10, category: 1, symbolSize: 30 },
        { name: 'Host 2', value: 10, category: 1, symbolSize: 30 },
        { name: 'Host 3', value: 10, category: 1, symbolSize: 30 },
        { name: 'Host 4', value: 10, category: 1, symbolSize: 30 },
        { name: 'Host 5', value: 10, category: 1, symbolSize: 30 },
        { name: 'Host 6', value: 10, category: 1, symbolSize: 30 }
      ],
      links: [
        { source: 'Switch 1', target: 'Switch 2' },
        { source: 'Switch 2', target: 'Switch 3' },
        { source: 'Switch 1', target: 'Host 1' },
        { source: 'Switch 1', target: 'Host 2' },
        { source: 'Switch 2', target: 'Host 3' },
        { source: 'Switch 2', target: 'Host 4' },
        { source: 'Switch 3', target: 'Host 5' },
        { source: 'Switch 3', target: 'Host 6' }
      ],
      categories: [
        { name: 'Switch' },
        { name: 'Host' }
      ],
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      force: {
        repulsion: 100
      }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 初始化设备状态图
const initDeviceChart = () => {
  const chart = echarts.init(deviceChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
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
          { value: 8, name: '在线', itemStyle: { color: '#1890ff' } },
          { value: 8, name: '离线', itemStyle: { color: '#d9d9d9' } }
        ]
      }
    ]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 初始化告警统计图
const initAlertChart = () => {
  const chart = echarts.init(alertChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['严重', '警告', '一般'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '告警数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 5, itemStyle: { color: '#ff4d4f' } },
          { value: 4, itemStyle: { color: '#faad14' } },
          { value: 3, itemStyle: { color: '#52c41a' } }
        ]
      }
    ]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 处理告警按钮点击
const handleAlerts = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/alerts')
  }, 500)
}

// 监听窗口大小变化
const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

onMounted(() => {
  initTrafficChart()
  initTopologyChart()
  initDeviceChart()
  initAlertChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 320px;
}
</style>