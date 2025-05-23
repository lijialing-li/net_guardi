<template>
  <div class="reports">
    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="对比方式">
          <el-select v-model="filterForm.compareType">
            <el-option label="同比" value="yoy" />
            <el-option label="环比" value="mom" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="refreshData">查询</el-button>
          <el-button @click="exportPDF">导出PDF</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>流量趋势分析</span>
            </div>
          </template>
          <div ref="trafficTrendChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>关键词热词云</span>
            </div>
          </template>
          <div ref="wordCloudChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// 筛选表单数据
const filterForm = ref({
  dateRange: [],
  compareType: 'yoy'
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 图表实例
const trafficTrendChart = ref(null)
const wordCloudChart = ref(null)
let charts = []

// 初始化流量趋势图
const initTrafficTrendChart = () => {
  const chart = echarts.init(trafficTrendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['总流量', '异常流量', '攻击流量', '告警事件']
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
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '流量 (GB)',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6'
          }
        }
      },
      {
        type: 'value',
        name: '事件数',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#91CC75'
          }
        }
      }
    ],
    series: [
      {
        name: '总流量',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330],
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        }
      },
      {
        name: '异常流量',
        type: 'line',
        smooth: true,
        data: [150, 232, 201, 154, 190, 330],
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      },
      {
        name: '攻击流量',
        type: 'line',
        smooth: true,
        data: [50, 132, 101, 134, 90, 230],
        itemStyle: {
          color: '#EE6666'
        }
      },
      {
        name: '告警事件',
        type: 'bar',
        yAxisIndex: 1,
        data: [45, 82, 91, 74, 110, 130]
      }
    ]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 初始化热词云图
const initWordCloudChart = () => {
  const chart = echarts.init(wordCloudChart.value)
  const option = {
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '70%',
      height: '80%',
      right: null,
      bottom: null,
      sizeRange: [12, 60],
      rotationRange: [-90, 90],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: [
        { name: 'SQL注入', value: 10000 },
        { name: '暴力破解', value: 8000 },
        { name: 'XSS攻击', value: 6000 },
        { name: 'DDoS', value: 4000 },
        { name: '未授权访问', value: 3000 },
        { name: '敏感信息泄露', value: 2000 }
      ]
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 刷新数据
const refreshData = () => {
  // TODO: 根据筛选条件获取新数据
  ElMessage.success('数据已更新')
}

// 导出PDF
const exportPDF = async () => {
  try {
    const element = document.querySelector('.reports')
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('分析报告.pdf')
    
    ElMessage.success('PDF导出成功')
  } catch (error) {
    console.error('PDF导出失败:', error)
    ElMessage.error('PDF导出失败')
  }
}

// 监听窗口大小变化
const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

onMounted(() => {
  initTrafficTrendChart()
  initWordCloudChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})
</script>

<style scoped>
.reports {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
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