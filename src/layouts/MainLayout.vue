<template>
  <el-container class="main-layout">
    <el-aside width="200px">
      <Sidebar />
    </el-aside>
    <el-container>
      <el-header height="60px">
        <Breadcrumb />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
    <AIAssistant />
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Breadcrumb from './Breadcrumb.vue'
import AIAssistant from '../components/AIAssistant.vue'
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
}

.el-aside {
  background-color: #001529;
  color: #fff;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>