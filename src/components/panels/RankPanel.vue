<script setup>
import { useAppStore } from '@/store/app'
import { ref } from 'vue'

const appStore = useAppStore()
const activeTab = ref('today')
</script>

<template>
  <div class="w-full h-full bg-card border border-border rounded-xl overflow-hidden flex flex-col">
    <div class="p-4 border-b border-border flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-xl">🏆</span>
        <span class="text-white font-semibold">功德排行榜</span>
      </div>
      <div class="flex bg-gray-800 rounded-lg p-0.5">
        <button @click="activeTab = 'today'"
                :class="[
                  'px-3 py-1 rounded-md text-sm transition-colors',
                  activeTab === 'today' ? 'bg-primary text-white' : 'text-gray-400'
                ]">
          今日榜
        </button>
        <button @click="activeTab = 'week'"
                :class="[
                  'px-3 py-1 rounded-md text-sm transition-colors',
                  activeTab === 'week' ? 'bg-primary text-white' : 'text-gray-400'
                ]">
          周榜
        </button>
        <button @click="activeTab = 'total'"
                :class="[
                  'px-3 py-1 rounded-md text-sm transition-colors',
                  activeTab === 'total' ? 'bg-primary text-white' : 'text-gray-400'
                ]">
          总榜
        </button>
      </div>
    </div>
    
    <div class="p-4 flex-1 overflow-y-auto space-y-2">
      <div v-for="(item, index) in appStore.rankData" :key="item.id"
           class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
          index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white' :
          'bg-gray-700 text-gray-300'
        ]">
          {{ index + 1 }}
        </div>
        
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
          {{ item.avatar }}
        </div>
        
        <div class="flex-1">
          <div class="text-white font-medium">{{ item.name }}</div>
          <div class="text-gray-400 text-xs">{{ item.title }}</div>
        </div>
        
        <div class="text-right">
          <div class="text-highlight font-bold">{{ item.merit.toLocaleString() }}</div>
          <div class="text-gray-500 text-xs">功德值</div>
        </div>
      </div>
    </div>
  </div>
</template>
