<template>
  <el-breadcrumb class="breadcrumb">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      {{ item.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref([])

const getBreadcrumbs = () => {
  const { matched } = route
  breadcrumbs.value = matched
    .filter(item => item.meta && item.meta.title)
    .map(item => ({
      name: item.meta.title,
      path: item.path
    }))
}

watch(() => route.path, getBreadcrumbs, { immediate: true })
</script>

<style scoped>
.breadcrumb {
  line-height: 60px;
  margin-left: 20px;
}
</style>