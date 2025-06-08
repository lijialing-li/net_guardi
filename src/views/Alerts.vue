<template>
  <div class="alerts">
    <!-- 告警统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon critical">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">严重告警</div>
              <div class="stat-value">{{ criticalCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">警告</div>
              <div class="stat-value">{{ warningCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon info">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">提示</div>
              <div class="stat-value">{{ infoCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">已处理</div>
              <div class="stat-value">{{ resolvedCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 响应时间统计 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="response-time-card">
          <template #header>
            <div class="card-header">
              <span style="margin-right: 20px; white-space: nowrap"
                >告警响应时间统计</span
              >
              <el-select v-model="timeRange" size="small">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          <div
            ref="responseTimeChart"
            class="chart"
            style="height: 300px"
          ></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 告警列表 -->
      <el-col :span="8">
        <el-card class="alert-list-card">
          <template #header>
            <div class="card-header">
              <span>告警列表</span>
              <div class="header-operations">
                <el-select
                  v-model="alertFilter"
                  size="small"
                  placeholder="筛选级别"
                >
                  <el-option label="全部" value="all" />
                  <el-option label="严重" value="critical" />
                  <el-option label="警告" value="warning" />
                  <el-option label="提示" value="info" />
                </el-select>
                <el-button type="primary" size="small" @click="refreshAlerts">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <el-table
            :data="filteredAlertList"
            style="width: 100%"
            @row-click="handleAlertClick"
          >
            <el-table-column width="40">
              <template #default="{ row }">
                <el-icon v-if="row.urgent" color="#F56C6C"><Warning /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="告警标题" />
            <el-table-column prop="level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="getAlertLevelType(row.level)">{{
                  row.level
                }}</el-tag>
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
              <el-tag
                v-if="currentAlert"
                :type="getAlertLevelType(currentAlert.level)"
                >{{ currentAlert.title }}</el-tag
              >
            </div>
          </template>
          <div v-if="currentAlert" class="alert-detail">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="设备">{{
                currentAlert.device || '未知设备'
              }}</el-descriptions-item>
              <el-descriptions-item label="位置">{{
                currentAlert.location || '未知位置'
              }}</el-descriptions-item>
              <el-descriptions-item label="站点">{{
                currentAlert.site || '未知站点'
              }}</el-descriptions-item>
              <el-descriptions-item label="详情">{{
                currentAlert.detail || '无详细信息'
              }}</el-descriptions-item>
            </el-descriptions>

            <div class="action-buttons mt-20">
              <el-button type="primary" @click="handleAlert('process')"
                >开始处理</el-button
              >
              <el-button type="success" @click="handleAlert('resolve')"
                >标记解决</el-button
              >
              <el-button type="info" @click="handleAlert('ignore')"
                >忽略</el-button
              >
            </div>
          </div>

          <el-timeline v-if="currentAlert">
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

          <el-empty v-else description="请选择一个告警" />
        </el-card>
      </el-col>

      <!-- AI建议 -->
      <el-col :span="8">
        <el-card class="ai-suggestion-card">
          <template #header>
            <div class="card-header">
              <span>AI建议</span>
              <el-button
                type="primary"
                size="small"
                @click="getAISuggestion"
                :disabled="!currentAlert"
              >
                获取建议
              </el-button>
            </div>
          </template>
          <div class="ai-content" v-loading="aiLoading">
            <div v-if="aiSuggestion" class="suggestion-text">
              <h4>问题分析</h4>
              <p>{{ aiSuggestion.analysis }}</p>

              <h4>可能原因</h4>
              <ul>
                <li v-for="(cause, index) in aiSuggestion.causes" :key="index">
                  {{ cause }}
                </li>
              </ul>

              <h4>解决方案</h4>
              <ol>
                <li
                  v-for="(solution, index) in aiSuggestion.solutions"
                  :key="index"
                >
                  {{ solution }}
                </li>
              </ol>

              <h4>预防措施</h4>
              <p>{{ aiSuggestion.prevention }}</p>
            </div>
            <el-empty v-else description="暂无AI建议" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Warning,
  Bell,
  InfoFilled,
  CircleCheck
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// WebSocket连接
const ws = ref(null)

// 告警统计数据
const criticalCount = ref(5)
const warningCount = ref(12)
const infoCount = ref(8)
const resolvedCount = ref(25)
const timeRange = ref('today')

// 图表实例
const responseTimeChart = ref(null)
let responseTimeChartInstance = null

// 告警列表数据
const alertList = ref([
  {
    id: 1,
    title: '服务器CPU使用率过高',
    level: '严重',
    time: '2024-01-20 15:30:00',
    urgent: true,
    device: 'Server-01',
    location: '北京市海淀区',
    site: '北京站点',
    detail: 'CPU使用率持续超过95%，已经持续30分钟',
    responseTime: 5
  },
  {
    id: 2,
    title: '网络连接异常',
    level: '警告',
    time: '2024-01-20 15:25:00',
    urgent: false,
    device: 'Router-01',
    location: '上海市浦东新区',
    site: '上海站点',
    detail: '与主干网络的连接出现间歇性中断',
    responseTime: 8
  },
  {
    id: 3,
    title: '带宽使用率过高',
    level: '警告',
    time: '2024-01-20 15:20:00',
    urgent: false,
    device: 'Switch-01',
    location: '广州市天河区',
    site: '广州站点',
    detail: '带宽使用率超过85%，可能影响网络性能',
    responseTime: 10
  },
  {
    id: 4,
    title: '设备温度异常',
    level: '严重',
    time: '2024-01-20 15:15:00',
    urgent: true,
    device: 'Server-02',
    location: '成都市高新区',
    site: '成都站点',
    detail: '服务器温度达到75°C，超过安全阈值',
    responseTime: 3
  },
  {
    id: 5,
    title: '磁盘空间不足',
    level: '提示',
    time: '2024-01-20 15:10:00',
    urgent: false,
    device: 'Server-03',
    location: '武汉市洪山区',
    site: '武汉站点',
    detail: '磁盘使用率达到85%，建议清理',
    responseTime: 15
  }
])

// 告警筛选
const alertFilter = ref('all')
const filteredAlertList = computed(() => {
  if (alertFilter.value === 'all') return alertList.value

  const levelMap = {
    critical: '严重',
    warning: '警告',
    info: '提示'
  }

  return alertList.value.filter(
    (alert) => alert.level === levelMap[alertFilter.value]
  )
})

// 当前选中的告警
const currentAlert = ref(null)

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
const aiSuggestion = ref(null)
const aiLoading = ref(false)

// 更新响应时间统计图表
const updateResponseTimeChart = () => {
  if (!responseTimeChartInstance) return

  responseTimeChartInstance.showLoading()

  // 模拟异步获取数据
  setTimeout(() => {
    let seriesData = []
    let legendData = ['平均响应时间(分钟)', '目标响应时间']

    // 根据时间范围生成不同的模拟数据
    switch (timeRange.value) {
      case 'today':
        seriesData = [4, 9, 15]
        break
      case 'week':
        seriesData = [5, 11, 18]
        break
      case 'month':
        seriesData = [6, 13, 16]
        break
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#E4E7ED',
        borderWidth: 1,
        textStyle: {
          color: '#303133'
        },
        formatter: function (params) {
          let tooltip = `${params[0].name}<br/>`
          params.forEach((param) => {
            let color = param.color.colorStops
              ? param.color.colorStops[0].color
              : param.color
            tooltip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`
            tooltip += `${param.seriesName}: ${param.value} 分钟<br/>`
          })
          return tooltip
        }
      },
      legend: {
        data: legendData
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
          data: ['严重告警', '警告', '提示']
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '分钟',
          axisLabel: {
            formatter: '{value} 分钟',
            color: '#909399'
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E4E7ED'
            }
          }
        }
      ],
      series: [
        {
          name: '平均响应时间(分钟)',
          type: 'bar',
          data: seriesData,
          barWidth: '25%',
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: function (params) {
              const colors = {
                success: {
                  start: '#67C23A',
                  end: '#B3E19D'
                },
                fail: {
                  start: '#F56C6C',
                  end: '#FAB6B6'
                }
              }
              const value = params.value
              let selectedColor

              if (params.dataIndex === 0) {
                // 严重告警
                selectedColor = value <= 5 ? colors.success : colors.fail
              } else if (params.dataIndex === 1) {
                // 警告
                selectedColor = value <= 10 ? colors.success : colors.fail
              } else {
                // 提示
                selectedColor = value <= 20 ? colors.success : colors.fail
              }

              return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: selectedColor.start },
                { offset: 1, color: selectedColor.end }
              ])
            },
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 10,
            shadowOffsetY: 5
          }
        },
        {
          name: '目标响应时间',
          type: 'line',
          data: [5, 10, 20],
          symbolSize: 10,
          symbol: 'circle',
          itemStyle: {
            color: '#409EFF'
          },
          lineStyle: {
            width: 2,
            type: 'dashed'
          }
        }
      ]
    }

    responseTimeChartInstance.hideLoading()
    responseTimeChartInstance.setOption(option)
  }, 500)
}

// 初始化响应时间统计图表
const initResponseTimeChart = () => {
  if (responseTimeChart.value) {
    responseTimeChartInstance = echarts.init(responseTimeChart.value)
    updateResponseTimeChart()
  }
}

// 方法定义
const getAlertLevelType = (level) => {
  const typeMap = {
    严重: 'danger',
    警告: 'warning',
    提示: 'info'
  }
  return typeMap[level] || 'info'
}

const refreshAlerts = () => {
  // TODO: 实现刷新告警列表逻辑
  ElMessage.success('告警列表已刷新')
}

const handleAlertClick = (row) => {
  currentAlert.value = row

  // 更新处理流程
  activities.value = [
    {
      content: '系统自动检测到异常',
      timestamp: row.time,
      type: 'warning',
      color: '#E6A23C'
    },
    {
      content: '告警通知已发送',
      timestamp: new Date(new Date(row.time).getTime() + 5000).toLocaleString(),
      type: 'info',
      color: '#909399'
    }
  ]

  // 清空AI建议
  aiSuggestion.value = null
}

const handleAlert = (action) => {
  if (!currentAlert.value) return

  const now = new Date().toLocaleString()
  let content = ''
  let type = ''
  let color = ''

  switch (action) {
    case 'process':
      content = '开始处理告警'
      type = 'primary'
      color = '#409EFF'
      break
    case 'resolve':
      content = '告警已解决'
      type = 'success'
      color = '#67C23A'
      resolvedCount.value++
      break
    case 'ignore':
      content = '告警已忽略'
      type = 'info'
      color = '#909399'
      break
  }

  activities.value.push({
    content,
    timestamp: now,
    type,
    color
  })

  ElMessage.success(
    `告警已${
      action === 'process' ? '开始处理' : action === 'resolve' ? '解决' : '忽略'
    }`
  )
}

const getAISuggestion = async () => {
  if (!currentAlert.value) return

  aiLoading.value = true
  try {
    // TODO: 调用Flask API获取AI建议
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 根据告警类型提供智能分析和建议
    const alertType = currentAlert.value.title.toLowerCase()
    const suggestions = {
      cpu: {
        analysis:
          '服务器CPU使用率持续过高，可能导致服务响应缓慢或宕机。系统性能和稳定性受到严重影响。',
        causes: [
          '应用程序资源消耗过高或存在内存泄漏',
          '后台进程异常或僵死进程堆积',
          '系统负载不均衡或调度不合理',
          '可能存在挖矿等恶意程序',
          'CPU调度策略配置不当'
        ],
        solutions: [
          '使用top/htop工具定位高CPU占用进程',
          '分析应用程序性能瓶颈，优化代码',
          '检查并清理异常进程，优化进程调度',
          '配置CPU使用率限制和告警阈值',
          '考虑增加服务器资源或实施负载均衡',
          '部署入侵检测系统，定期安全扫描'
        ],
        prevention:
          '建议采用容器化部署，设置资源限制；实施性能监控和自动扩容策略；定期进行代码优化和安全审计。'
      },
      network: {
        analysis:
          '网络连接出现异常，可能影响业务连续性和用户体验。需要快速定位和解决网络故障。',
        causes: [
          '网络设备硬件故障或配置错误',
          '网络链路拥塞或质量下降',
          'DNS解析异常或路由配置问题',
          '可能遭受DDoS攻击',
          '防火墙规则冲突'
        ],
        solutions: [
          '执行网络连通性测试(ping/traceroute)',
          '检查网络设备日志和性能指标',
          '验证DNS配置和路由表设置',
          '分析流量特征，识别异常访问',
          '优化防火墙规则和QoS策略',
          '启动备用链路或切换网络线路'
        ],
        prevention:
          '建议实施网络监控和链路冗余；部署流量分析和DDoS防护；定期进行网络压力测试和应急演练。'
      },
      bandwidth: {
        analysis:
          '带宽使用率过高，网络性能下降，可能影响关键业务运行。需要优化流量管理策略。',
        causes: [
          '业务访问量突增或大规模数据传输',
          '视频会议等高带宽应用占用资源',
          '可能存在网络蠕虫或恶意外联',
          '备份任务或系统更新占用带宽',
          '流量管控策略失效'
        ],
        solutions: [
          '使用流量监控工具分析带宽占用',
          '实施基于应用的流量控制策略',
          '优化数据传输和备份计划',
          '限制非关键业务的带宽使用',
          '升级网络带宽或优化链路质量',
          '部署流量清洗设备'
        ],
        prevention:
          '建议实施智能流量管理；设置带宽预警和动态调整机制；优化业务访问策略；定期评估带宽需求。'
      },
      temperature: {
        analysis:
          '设备温度异常升高，可能导致硬件损坏和系统不稳定。需要及时处理散热问题。',
        causes: [
          '散热系统故障或效率下降',
          '机房环境温度过高',
          '设备持续高负载运行',
          '通风口堵塞或灰尘堆积',
          '温控系统配置不当'
        ],
        solutions: [
          '检查并维修散热风扇和散热片',
          '清理设备灰尘，确保通风顺畅',
          '调整机房空调温度和气流方向',
          '降低设备负载，必要时关机处理',
          '增加制冷设备或优化布局',
          '更新温控策略和告警阈值'
        ],
        prevention:
          '建议实施智能温控系统；定期检查和维护散热设备；优化设备布局和气流组织；建立温度监控和应急预案。'
      },
      security: {
        analysis: '检测到潜在的安全威胁，需要立即采取措施防止安全事件扩大。',
        causes: [
          '可能遭受网络攻击或漏洞利用',
          '异常账号活动或权限滥用',
          '敏感数据泄露或未授权访问',
          '系统存在安全漏洞',
          '终端防护软件异常'
        ],
        solutions: [
          '隔离受影响的系统或设备',
          '分析安全日志，定位攻击来源',
          '加固系统安全，修补漏洞',
          '重置受影响的账号密码',
          '更新防火墙规则和访问策略',
          '启动应急响应预案'
        ],
        prevention:
          '建议部署全面的安全防护体系；定期进行安全评估和渗透测试；加强安全意识培训；制定完善的安全策略。'
      },
      default: {
        analysis: '系统检测到异常情况，需要进行深入分析和诊断。',
        causes: [
          '系统配置不当或参数异常',
          '软件版本不兼容或存在缺陷',
          '资源使用不合理或超出限制',
          '外部依赖服务异常',
          '可能受到未知威胁影响'
        ],
        solutions: [
          '收集系统日志和性能数据',
          '分析异常发生的时间点和影响',
          '回溯配置变更和系统更新记录',
          '测试系统功能和外部依赖',
          '咨询技术支持或专家团队',
          '制定临时解决方案'
        ],
        prevention:
          '建议加强系统监控和日志分析；建立变更管理和版本控制；定期进行系统健康检查；完善应急处理流程。'
      }
    }

    // 根据告警标题匹配最合适的建议
    let matchedType = 'default'
    if (alertType.includes('cpu')) matchedType = 'cpu'
    else if (alertType.includes('网络')) matchedType = 'network'
    else if (alertType.includes('带宽')) matchedType = 'bandwidth'
    else if (alertType.includes('温度')) matchedType = 'temperature'
    else if (alertType.includes('安全') || alertType.includes('攻击'))
      matchedType = 'security'

    aiSuggestion.value = suggestions[matchedType]
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

// 监听时间范围变化
watch(timeRange, () => {
  // 根据时间范围更新响应时间图表
  updateResponseTimeChart()
})

// 生命周期钩子
onMounted(() => {
  initWebSocket()
  initResponseTimeChart()
})

onBeforeUnmount(() => {
  if (ws.value) {
    ws.value.close()
  }

  // 销毁图表实例
  if (responseTimeChartInstance) {
    responseTimeChartInstance.dispose()
    responseTimeChartInstance = null
  }
})
</script>

<style scoped>
.alerts {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.alert-list-card,
.process-card,
.ai-suggestion-card {
  height: calc(100vh - 400px);
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
  justify-content: flex-start;
  padding: 10px;
}
</style>
