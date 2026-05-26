<script setup>
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()

const isCustomLocation = computed(() => {
  return appStore.selectedWater && !appStore.selectedWater.ecologyScore
})

const locationName = computed(() => {
  return appStore.selectedWater?.name || '未知地点'
})

function handleRelease() {
  if (appStore.selectedWater) {
    appStore.toggleFishDialog(true)
  }
}
</script>

<template>
  <div class="w-full h-full bg-card border border-border rounded-xl overflow-hidden flex flex-col">
    <div class="p-4 border-b border-border flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-xl">{{ isCustomLocation ? '🎯' : '💧' }}</span>
        <span class="text-white font-semibold">水域信息</span>
      </div>
      <button class="text-gray-400 hover:text-white transition-colors">
        ↻
      </button>
    </div>
    
    <div class="p-4 flex-1 overflow-y-auto">
      <div v-if="appStore.selectedWater" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-bold text-white">{{ locationName }}</h3>
          <span v-if="!isCustomLocation" class="text-green-400 text-sm">生态状况: 良好</span>
          <span v-else class="text-orange-400 text-sm">自定义地点</span>
        </div>
        
        <div v-if="!isCustomLocation" class="flex items-center gap-4">
          <div class="relative w-32 h-32">
            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,150,255,0.2)" stroke-width="12"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="url(#progressGradient)" stroke-width="12"
                      :stroke-dasharray="`${appStore.selectedWater.ecologyScore * 2.51} 251`"
                      stroke-linecap="round"/>
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#00e5ff"/>
                  <stop offset="100%" style="stop-color:#1677ff"/>
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-white">{{ appStore.selectedWater.ecologyScore }}</span>
              <span class="text-xs text-gray-400">累计放生</span>
            </div>
          </div>
          
          <div class="flex-1 space-y-2">
            <div v-for="(item, index) in appStore.selectedWater.fishComposition" :key="index"
                 class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="text-sm">🐟</span>
                <span class="text-gray-300 text-sm">{{ item.name }}</span>
              </div>
              <span class="text-white text-sm">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
        
        <div v-if="!isCustomLocation" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">生态指数</span>
            <span class="text-white">{{ appStore.selectedWater.ecologyScore }} (良好)</span>
          </div>
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-green-500 to-cyan-400 rounded-full"
                 :style="{ width: `${appStore.selectedWater.ecologyScore}%` }"></div>
          </div>
        </div>
        
        <div v-if="isCustomLocation" class="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg p-4 space-y-3">
          <div class="flex items-center gap-2 text-orange-400">
            <span class="text-lg">✨</span>
            <span class="font-medium">自定义放生点</span>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">国家/地区</span>
              <span class="text-white">{{ appStore.selectedWater.country || '未知' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">省份/州</span>
              <span class="text-white">{{ appStore.selectedWater.state || '未知' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">城市/区县</span>
              <span class="text-white">{{ appStore.selectedWater.city || '未知' }}</span>
            </div>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">纬度</span>
            <span class="text-cyan-400">{{ appStore.selectedWater.lat?.toFixed(6) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">经度</span>
            <span class="text-cyan-400">{{ appStore.selectedWater.lng?.toFixed(6) }}</span>
          </div>
          
          <div v-if="appStore.selectedWater.fullAddress" class="pt-2 border-t border-orange-500/20">
            <p class="text-gray-300 text-xs line-clamp-2">
              📍 {{ appStore.selectedWater.fullAddress }}
            </p>
          </div>
        </div>
        
        <div class="flex justify-between text-sm">
          <span class="text-gray-400 flex items-center gap-1">
            <span>◎</span> 今日放生数
          </span>
          <span class="text-highlight font-semibold">{{ appStore.todayReleaseCount.toLocaleString() }} 条</span>
        </div>
        
        <button @click="handleRelease"
                class="w-full py-3 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/30">
          我要放生
        </button>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center h-64 text-gray-400">
        <span class="text-4xl mb-2">💧</span>
        <p class="text-center">在地图上点击任意位置<br/>或选择一个水域</p>
        <p class="text-xs mt-2 text-gray-500">支持搜索全球任意地点</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
