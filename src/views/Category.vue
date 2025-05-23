<template>
  <div class="device-category">
    <div class="category-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/devices' }">设备管理</el-breadcrumb-item>
        <el-breadcrumb-item>设备分类</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 设备分类统计卡片 -->
    <div class="category-cards">
      <el-row :gutter="20">
        <el-col :span="8" v-for="category in categories" :key="category.type">
          <el-card shadow="hover" :class="category.type + '-card'">
            <template #header>
              <div class="card-header">
                <span>{{ category.label }}</span>
                <el-icon><component :is="category.icon" /></el-icon>
              </div>
            </template>
            <div class="card-content">
              <div class="number">{{ category.count }}台</div>
              <div class="trend" :class="{ 'up': category.trend > 0, 'down': category.trend < 0 }">
                较上月{{ Math.abs(category.trend) }}%
                <el-icon><component :is="category.trend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 设备分类管理 -->
    <div class="category-management">
      <el-row :gutter="20">
        <!-- 分类树 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>设备分类</span>
                <div class="header-operations">
                  <el-button type="primary" size="small" @click="addCategory">添加分类</el-button>
                  <el-button type="primary" size="small" @click="refreshCategories">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-tree
              ref="categoryTreeRef"
              :data="categoryTree"
              :props="defaultProps"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <span>{{ node.label }}</span>
                  <span class="operations">
                    <el-button link type="primary" size="small" @click="editCategory(data)">
                      编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click="removeCategory(node, data)">
                      删除
                    </el-button>
                  </span>
                </div>
              </template>
            </el-tree>
          </el-card>
        </el-col>

        <!-- 分类设备列表 -->
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>{{ currentCategory.label || '所有设备' }}</span>
                <el-tag type="info" class="device-count">共 {{ deviceList.length }} 台设备</el-tag>
              </div>
            </template>
            <el-table :data="deviceList" style="width: 100%">
              <el-table-column prop="name" label="设备名称" />
              <el-table-column prop="ip" label="IP地址" />
              <el-table-column prop="type" label="设备类型" />
              <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastActive" label="最后活跃时间" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分类编辑弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryForm.id ? '编辑分类' : '添加分类'"
      width="30%"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryTree"
            :props="defaultProps"
            check-strictly
            default-expand-all
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input v-model="categoryForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor, Connection, Printer, ArrowUp, ArrowDown, Refresh } from '@element-plus/icons-vue'

// 设备分类统计
const categories = ref([
  {
    type: 'network',
    label: '网络设备',
    icon: 'Connection',
    count: 532,
    trend: -6
  },
  {
    type: 'server',
    label: '服务器',
    icon: 'Monitor',
    count: 491,
    trend: 3
  },
  {
    type: 'terminal',
    label: '终端设备',
    icon: 'Printer',
    count: 41,
    trend: 2
  }
])

// 分类树相关
const categoryTreeRef = ref(null)
const categoryTree = ref([
  {
    id: 1,
    label: '所有设备',
    children: [
      {
        id: 2,
        label: '网络设备',
        children: [
          { id: 3, label: '路由器' },
          { id: 4, label: '交换机' }
        ]
      },
      {
        id: 5,
        label: '服务器',
        children: [
          { id: 6, label: '应用服务器' },
          { id: 7, label: '数据库服务器' }
        ]
      },
      {
        id: 8,
        label: '终端设备',
        children: [
          { id: 9, label: '工作站' },
          { id: 10, label: '打印机' }
        ]
      }
    ]
  }
])
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 设备列表
const currentCategory = ref({})
const deviceList = ref([
  {
    name: 'Router-01',
    ip: '192.168.1.1',
    type: '路由器',
    status: 'running',
    lastActive: '2024-01-20 10:30:00'
  },
  {
    name: 'Switch-01',
    ip: '192.168.1.2',
    type: '交换机',
    status: 'stopped',
    lastActive: '2024-01-20 09:15:00'
  }
])

// 分类编辑相关
const categoryDialogVisible = ref(false)
const categoryForm = ref({
  id: '',
  name: '',
  parentId: '',
  description: ''
})

// 方法定义
const refreshCategories = () => {
  // TODO: 实现刷新分类树逻辑
  ElMessage.success('分类树已刷新')
}

const addCategory = () => {
  categoryForm.value = {
    id: '',
    name: '',
    parentId: '',
    description: ''
  }
  categoryDialogVisible.value = true
}

const editCategory = (data) => {
  categoryForm.value = {
    id: data.id,
    name: data.label,
    parentId: data.parentId,
    description: data.description || ''
  }
  categoryDialogVisible.value = true
}

const removeCategory = (node, data) => {
  // TODO: 实现删除分类逻辑
  ElMessage.success('分类删除成功')
}

const saveCategoryForm = () => {
  // TODO: 实现保存分类逻辑
  ElMessage.success('分类保存成功')
  categoryDialogVisible.value = false
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

onMounted(() => {
  // TODO: 初始化加载数据
})
</script>

<style scoped>
.device-category {
  padding: 20px;
}

.category-header {
  margin-bottom: 20px;
}

.category-cards {
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

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.device-count {
  margin-left: 10px;
}

.category-management {
  margin-top: 20px;
}

.header-operations {
  display: flex;
  gap: 8px;
}
</style>