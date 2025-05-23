<template>
  <div class="device-overview">
    <div class="overview-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/devices' }">设备管理</el-breadcrumb-item>
        <el-breadcrumb-item>全国站点</el-breadcrumb-item>
      </el-breadcrumb>
      <el-button type="primary" @click="refreshData">刷新数据</el-button>
    </div>

    <!-- 设备总览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="total-card">
            <template #header>
              <div class="card-header">
                <span>设备总数</span>
                <el-icon><Monitor /></el-icon>
              </div>
            </template>
            <div class="card-content">
              <div class="number">{{ totalDevices }}</div>
              <div class="trend" :class="{ 'up': deviceTrend > 0, 'down': deviceTrend < 0 }">
                较上月{{ Math.abs(deviceTrend) }}%
                <el-icon><component :is="deviceTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="health-card">
            <template #header>
              <div class="card-header">
                <span>健康设备</span>
                <el-icon><CircleCheck /></el-icon>
              </div>
            </template>
            <div class="card-content">
              <div class="number">{{ healthyDevices }}</div>
              <div class="trend up">
                较上月{{ healthyTrend }}%
                <el-icon><ArrowUp /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="alert-card">
            <template #header>
              <div class="card-header">
                <span>告警设备</span>
                <el-icon><Warning /></el-icon>
              </div>
            </template>
            <div class="card-content">
              <div class="number">{{ alertDevices }}</div>
              <div class="trend" :class="{ 'up': alertTrend > 0, 'down': alertTrend < 0 }">
                较上月{{ Math.abs(alertTrend) }}%
                <el-icon><component :is="alertTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 地图区域 -->
    <div class="map-container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>全国站点分布</span>
            <el-select v-model="selectedRegion" placeholder="选择地区" clearable>
              <el-option
                v-for="region in regions"
                :key="region.value"
                :label="region.label"
                :value="region.value"
              />
            </el-select>
          </div>
        </template>
        <div class="map" ref="mapRef"></div>
      </el-card>
    </div>

    <!-- 数据统计图表 -->
    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>设备状态分布</span>
              </div>
            </template>
            <div class="chart" ref="statusChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>设备流量趋势</span>
              </div>
            </template>
            <div class="chart" ref="trafficChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Monitor, CircleCheck, Warning, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 数据统计
const totalDevices = ref(2012)
const deviceTrend = ref(-10)
const healthyDevices = ref(1408)
const healthyTrend = ref(5)
const alertDevices = ref(603)
const alertTrend = ref(5)

// 地区选择
const selectedRegion = ref('')
const regions = [
  { value: 'zhejiang', label: '浙江' },
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangdong', label: '广东' }
]

// 图表实例
const mapRef = ref(null)
const statusChartRef = ref(null)
const trafficChartRef = ref(null)
let mapChart = null
let statusChart = null
let trafficChart = null

// 初始化图表
onMounted(() => {
  initCharts()
})

// 刷新数据
const refreshData = () => {
  // TODO: 实现数据刷新逻辑
}

// 初始化图表
const initCharts = () => {
  // 初始化地图
  mapChart = echarts.init(mapRef.value)
  const mapOption = {
    // TODO: 配置地图选项
  }
  mapChart.setOption(mapOption)

  // 初始化状态分布图
  statusChart = echarts.init(statusChartRef.value)
  const statusOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1408, name: '健康' },
          { value: 603, name: '告警' },
          { value: 1, name: '离线' }
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
  statusChart.setOption(statusOption)

  // 初始化流量趋势图
  trafficChart = echarts.init(trafficChartRef.value)
  const trafficOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }]
  }
  trafficChart.setOption(trafficOption)
}
</script>

<style scoped>
.device-overview {
  padding: 20px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.overview-cards {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.number {
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0;
}

.trend {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend.up {
  color: #67c23a;
}

.trend.down {
  color: #f56c6c;
}

.map-container {
  margin-bottom: 20px;
}

.map {
  height: 500px;
}

.chart {
  height: 300px;
}
</style>