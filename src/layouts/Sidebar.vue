<template>
  <div class="sidebar">
    <div class="logo">
      <h1>NetGuardi</h1>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      :collapse="isCollapse"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#1890ff"
      router
    >
      <el-menu-item index="/dashboard">
        <el-icon><Monitor /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>
      <el-menu-item index="/datascreen">
        <el-icon><DataScreen /></el-icon>
        <template #title>数据大屏</template>
      </el-menu-item>
      <el-menu-item index="/devices">
        <el-icon><Connection /></el-icon>
        <template #title>设备管理</template>
      </el-menu-item>
      <el-menu-item index="/alerts">
        <el-icon><Warning /></el-icon>
        <template #title>告警中心</template>
      </el-menu-item>
      <el-menu-item index="/reports">
        <el-icon><Document /></el-icon>
        <template #title>分析报告</template>
      </el-menu-item>
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <template #title>系统设置</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Monitor, Connection, Warning, Document, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  margin: 0;
  font-size: 20px;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}
</style>