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
      <el-sub-menu index="/devices">
        <template #title>
          <el-icon><Connection /></el-icon>
          <span>设备管理</span>
        </template>
        <el-menu-item index="/overview">
          <el-icon><Location /></el-icon>
          <template #title>全国站点</template>
        </el-menu-item>
        <el-menu-item index="/list">
          <el-icon><List /></el-icon>
          <template #title>设备列表</template>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Grid /></el-icon>
          <template #title>设备分类</template>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/alerts">
        <el-icon><Warning /></el-icon>
        <template #title>告警中心</template>
      </el-menu-item>
      <el-menu-item index="/reports">
        <el-icon><Document /></el-icon>
        <template #title>分析报告</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Monitor,
  Connection,
  Warning,
  Document,
  Setting
} from '@element-plus/icons-vue'

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
