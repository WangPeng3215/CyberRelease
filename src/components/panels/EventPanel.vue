<script setup>
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
</script>

<template>
  <div class="w-full h-full bg-card border border-border rounded-xl overflow-hidden flex flex-col">
    <div class="p-4 border-b border-border flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-xl">📢</span>
        <span class="text-white font-semibold">放生广播</span>
      </div>
      <button class="text-gray-400 hover:text-white text-sm">更多 ></button>
    </div>
    
    <div class="p-4 flex-1 overflow-y-auto space-y-3">
      <div v-for="item in appStore.broadcastData" :key="item.id"
           class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl shrink-0">
          {{ item.avatar }}
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="text-white font-medium text-sm">{{ item.name }}</div>
          <div class="text-gray-300 text-sm">
            {{ item.action }} <span class="text-highlight">{{ item.fish }}</span> x{{ item.count }}
          </div>
        </div>
        
        <div class="text-gray-500 text-xs">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>
