<template>
  <div class="device-overview">
    <div class="overview-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/devices' }"
          >设备管理</el-breadcrumb-item
        >
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
              <div
                class="trend"
                :class="{ up: deviceTrend > 0, down: deviceTrend < 0 }"
              >
                较上月{{ Math.abs(deviceTrend) }}%
                <el-icon
                  ><component :is="deviceTrend > 0 ? 'ArrowUp' : 'ArrowDown'"
                /></el-icon>
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
              <div
                class="trend"
                :class="{ up: alertTrend > 0, down: alertTrend < 0 }"
              >
                较上月{{ Math.abs(alertTrend) }}%
                <el-icon
                  ><component :is="alertTrend > 0 ? 'ArrowUp' : 'ArrowDown'"
                /></el-icon>
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
            <span style="width: 120px">全国站点分布</span>
            <el-select
              v-model="selectedRegion"
              placeholder="选择地区"
              clearable
            >
              <el-option
                v-for="region in regions"
                :key="region.value"
                :label="region.label"
                :value="region.value"
              />
            </el-select>
          </div>
          <!-- 显示设备数量 -->
          <div class="device-count-info" v-if="selectedRegion">
            当前地区设备数量：<strong>{{ selectedRegionDeviceCount }}</strong>
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
import { ref, onMounted, watch } from "vue";
// import AMap from "@amap/amap-jsapi-types";
import {
  Monitor,
  CircleCheck,
  Warning,
  ArrowUp,
  ArrowDown,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";

let amap = null;

let polygon = null; // 用于保存绘制的边界多边形
// 数据统计
const totalDevices = ref(2012);
const deviceTrend = ref(-10);
const healthyDevices = ref(1408);
const healthyTrend = ref(5);
const alertDevices = ref(603);
const alertTrend = ref(5);

// 地区选择
const selectedRegion = ref("北京");
const regions = [
  { value: "北京", label: "北京" },
  { value: "浙江", label: "浙江" },
  { value: "上海", label: "上海" },
  { value: "广东", label: "广东" },
];

const regionCoordinates = {
  北京: { name: "北京市", center: [116.407394, 39.904211] },
  浙江: { name: "浙江省", center: [120.153586, 30.244834] },
  上海: { name: "上海市", center: [121.473704, 31.230416] },
  广东: { name: "广东省", center: [113.264369, 23.129082] },
};
// 地区设备数量映射
const selectedRegionDeviceCount = ref(0);
const regionDeviceCount = {
  北京: 150,
  浙江: 200,
  上海: 180,
  广东: 220,
};
// 图表实例
const mapRef = ref(null);
const statusChartRef = ref(null);
const trafficChartRef = ref(null);
let statusChart = null;
let trafficChart = null;
window._AMapSecurityConfig = {
  securityJsCode: "77febc6f30af5ee998477ba26b2f0b33",
};

onMounted(() => {
  initCharts();
  initMap();

  // 初始化默认地区的设备数量和边界
  selectedRegionDeviceCount.value = regionDeviceCount[selectedRegion.value];
  setTimeout(() => {
    drawProvinceBoundary(regionCoordinates[selectedRegion.value]?.name);
  }, 500); // 延迟确保地图已加载

  watch(selectedRegion, (newVal) => {
    const region = regionCoordinates[newVal];
    if (amap && region) {
      amap.setCenter(region.center);
      amap.setZoom(7);
      drawProvinceBoundary(region.name);
    }
    selectedRegionDeviceCount.value = regionDeviceCount[newVal] || 0;
  });
});
// 刷新数据
const refreshData = () => {
  // TODO: 实现数据刷新逻辑
};

const initMap = () => {
  const container = mapRef.value;
  if (!container) return;

  AMapLoader.load({
    key: "550f56c34a1bc150f82cbc1481e361e5",
    version: "2.0",
  })
    .then((AMap) => {
      // 创建地图实例
      amap = new AMap.Map(container, {
        zoom: 4,
        center: getInitialCenter(),
      });
      // 加载行政区划插件
      AMap.plugin("AMap.DistrictSearch", () => {
        const districtSearch = new AMap.DistrictSearch({
          extensions: "all", // 获取边界信息
          level: "province", // 设置为省级
        });
        window.districtSearch = districtSearch; // 挂到全局便于调用
      });

      console.log("地图加载成功");
    })
    .catch((e) => {
      console.error("地图加载失败:", e);
    });
};
const getInitialCenter = () => {
  const region = regionCoordinates[selectedRegion.value];
  return region ? region.center : [116.397428, 39.90923]; // 默认北京
};
// 绘制省级边界
const drawProvinceBoundary = (provinceName) => {
  if (!amap || !window.districtSearch) return;

  // 清除之前的边界
  if (polygon) {
    amap.remove(polygon);
    polygon = null;
  }

  // 查询省级边界
  window.districtSearch.search(provinceName, (status, result) => {
    if (status === "complete" && result.info === "OK") {
      const bounds = result.districtList[0]?.boundaries;
      if (bounds && bounds.length > 0) {
        // 创建多边形覆盖物
        polygon = new AMap.Polygon({
          path: bounds, //多边形路径
          fillColor: "#ccebc5", //多边形填充颜色
          strokeOpacity: 1, //线条透明度
          fillOpacity: 0.5, //填充透明度
          strokeColor: "#2b8cbe", //线条颜色
          strokeWeight: 3, //线条宽度
          strokeStyle: "dashed", //线样式
          strokeDasharray: [5, 5], //轮廓的虚线和间隙的样式
        });

        //鼠标移入更改样式
        polygon.on("mouseover", () => {
          polygon.setOptions({
            fillOpacity: 0.7, //多边形填充透明度
            fillColor: "#7bccc4",
          });
        });
        //鼠标移出恢复样式
        polygon.on("mouseout", () => {
          polygon.setOptions({
            fillOpacity: 0.5,
            fillColor: "#ccebc5",
          });
        });

        // 添加多边形到地图
        amap.add(polygon);

        // 设置地图视野到该省中心
        amap.setZoomAndCenter(7, [
          result.districtList[0].center.lng,
          result.districtList[0].center.lat,
        ]);
      }
    }
  });
};

// 初始化图表
const initCharts = () => {
  // 初始化状态分布图
  statusChart = echarts.init(statusChartRef.value);
  const statusOption = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "设备状态",
        type: "pie",
        radius: "50%",
        data: [
          { value: 1408, name: "健康" },
          { value: 603, name: "告警" },
          { value: 1, name: "离线" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  statusChart.setOption(statusOption);

  // 初始化流量趋势图
  trafficChart = echarts.init(trafficChartRef.value);
  const trafficOption = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: "line",
        smooth: true,
      },
    ],
  };
  trafficChart.setOption(trafficOption);
};
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
.device-count-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}
.device-count-info strong {
  color: #409eff;
  font-size: 16px;
}
</style>
