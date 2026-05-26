<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/app'
import { useFishCatalogStore } from '@/store/fishCatalog'

const appStore = useAppStore()
const fishCatalogStore = useFishCatalogStore()
const selectedFish = ref(null)
const fishCount = ref(1)
const releasing = ref(false)

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

async function confirmRelease() {
  if (!selectedFish.value || releasing.value) return
  
  releasing.value = true
  await appStore.releaseFish(selectedFish.value, fishCount.value)
  releasing.value = false
  closeDialog()
}

function getRarityBorderClass(rarity) {
  const borderColors = {
    'N': 'border-white',
    'R': 'border-blue-500',
    'SR': 'border-purple-500',
    'SSR': 'border-pink-500',
    'UR': 'border-orange-500',
    'EX': 'border-transparent bg-clip-border bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
  }
  return borderColors[rarity] || borderColors['N']
}

function getRarityBgClass(rarity) {
  const bgColors = {
    'N': 'bg-gray-600',
    'R': 'bg-blue-500',
    'SR': 'bg-purple-500',
    'SSR': 'bg-pink-500',
    'UR': 'bg-orange-500',
    'EX': 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
  }
  return bgColors[rarity] || bgColors['N']
}

// 只显示已解锁的鱼
const unlockedFish = computed(() => {
  return fishCatalogStore.unlockedFish.filter(f => f.unlocked)
})
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
          <div v-for="fish in unlockedFish" :key="fish.id"
               @click="selectFish(fish)"
               :class="[
                 'p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 relative',
                 selectedFish?.id === fish.id 
                   ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(22,119,255,0.4)]' 
                   : getRarityBorderClass(fish.rarity) + ' bg-gray-800/50 hover:opacity-80'
               ]">
            <div class="flex justify-center items-center mb-3 min-h-[80px]">
              <img v-if="fish.imageUrl" :src="fish.imageUrl" :alt="fish.name" class="h-24 w-24 object-cover rounded-lg" />
              <span v-else class="text-5xl">{{ fish.emoji }}</span>
            </div>
            <div class="text-white font-bold text-center">{{ fish.name }}</div>
            <div class="flex justify-center mt-1">
              <span :class="['px-2 py-0.5 rounded text-xs font-bold text-white', getRarityBgClass(fish.rarity)]">{{ fish.rarity }}</span>
            </div>
            <div class="text-gray-400 text-xs text-center mt-2">功德 +{{ fish.totalMerit }}</div>
            
            <div v-if="selectedFish?.id === fish.id" class="absolute top-2 right-2 text-green-400 text-2xl">✓</div>
          </div>
        </div>
        
        <div v-if="unlockedFish.length === 0" class="text-center py-12">
          <span class="text-6xl block mb-4">🔒</span>
          <p class="text-gray-400">还没有解锁任何鱼类</p>
          <p class="text-gray-500 text-sm mt-2">完成解锁条件来获取更多鱼类</p>
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
                :disabled="!selectedFish || releasing"
                :class="[
                  'w-full py-4 font-bold text-lg rounded-xl transition-all',
                  selectedFish && !releasing
                    ? 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/40' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                ]">
          {{ releasing ? '放生中...' : '确认放生' }}
        </button>
      </div>
    </div>
  </div>
</template>
