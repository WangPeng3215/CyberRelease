<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const selectedFish = ref(null)
const fishCount = ref(1)

function closeDialog() {
  appStore.toggleFishDialog(false)
  selectedFish.value = null
  fishCount.value = 1
}

function selectFish(fish) {
  selectedFish.value = fish
}

function changeCount(delta) {
  fishCount.value = Math.max(1, fishCount.value + delta)
}

function confirmRelease() {
  if (!selectedFish.value) return
  
  const totalMerit = appStore.releaseFish(selectedFish.value, fishCount.value)
  
  closeDialog()
}

function getRarityColor(rarity) {
  switch(rarity) {
    case '普通': return 'border-gray-500 text-gray-300'
    case '稀有': return 'border-yellow-500 text-yellow-400'
    case '史诗': return 'border-purple-500 text-purple-400'
    default: return 'border-gray-500 text-gray-300'
  }
}
</script>

<template>
  <div v-if="appStore.showFishDialog" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
    <div class="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="p-4 border-b border-border flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🐟</span>
          <h2 class="text-xl font-bold text-white">选择要放生的鱼类</h2>
        </div>
        <button @click="closeDialog" class="text-gray-400 hover:text-white text-2xl">×</button>
      </div>
      
      <div class="p-4 flex-1 overflow-y-auto">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="fish in appStore.fishesData" :key="fish.id"
               @click="selectFish(fish)"
               :class="[
                 'p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 relative',
                 selectedFish?.id === fish.id 
                   ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(22,119,255,0.4)]' 
                   : 'border-border bg-gray-800/50 hover:border-highlight'
               ]">
            <div class="text-5xl text-center mb-3">{{ fish.emoji }}</div>
            <div class="text-white font-bold text-center">{{ fish.name }}</div>
            <div :class="['text-center text-sm mt-1', getRarityColor(fish.rarity)]">{{ fish.rarity }}</div>
            <div class="text-gray-400 text-xs text-center mt-2">功德 +{{ fish.merit }}</div>
            
            <div v-if="selectedFish?.id === fish.id" class="absolute top-2 right-2 text-green-400 text-2xl">✓</div>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t border-border">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-300">数量选择:</span>
          <div class="flex items-center gap-3">
            <button @click="changeCount(-1)" 
                    class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xl font-bold transition-colors">
              −
            </button>
            <span class="text-2xl font-bold text-white w-12 text-center">{{ fishCount }}</span>
            <button @click="changeCount(1)"
                    class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xl font-bold transition-colors">
              +
            </button>
          </div>
        </div>
        
        <button @click="confirmRelease"
                :disabled="!selectedFish"
                :class="[
                  'w-full py-4 font-bold text-lg rounded-xl transition-all',
                  selectedFish 
                    ? 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/40' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                ]">
          确认放生
        </button>
      </div>
    </div>
  </div>
</template>
