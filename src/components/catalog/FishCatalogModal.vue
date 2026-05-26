<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
    <div class="bg-card border border-border rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
      <div class="flex items-center justify-between p-6 border-b border-border">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold text-white">🐠 鱼类图鉴</h2>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-green-400">{{ unlockedCount }}</span>
            <span class="text-gray-500">/</span>
            <span class="text-gray-400">{{ totalFishCount }}</span>
            <span class="text-gray-500">已解锁</span>
          </div>
        </div>
        <button @click="onClose" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div class="flex gap-4 p-4 border-b border-border">
        <button v-for="rarity in rarities" :key="rarity" @click="selectedRarity = rarity"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedRarity === rarity 
                    ? getRarityBgClass(rarity) + ' text-white shadow-lg'
                    : 'bg-background/50 text-gray-400 hover:bg-background hover:text-white']">
          {{ rarity === 'all' ? '全部' : rarity }}
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1">
        <div v-if="fishCatalogStore.isLoading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="text-4xl mb-2">⏳</div>
            <p class="text-gray-400">加载中...</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="fish in filteredFish" :key="fish.id" @click="showFishDetail(fish)"
               :class="[ 'relative cursor-pointer transition-transform hover:scale-105', fish.unlocked ? '' : 'grayscale opacity-70' ]">
            <div :class="[ 'aspect-square rounded-2xl overflow-hidden border-2 p-1 relative shadow-lg', getRarityBorderClass(fish.rarity) ]">
              <div class="w-full h-full rounded-xl overflow-hidden relative">
                <img :src="fish.imageUrl" :alt="fish.name" class="w-full h-full object-cover"
                     @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }"/>
                <div v-show="false" class="w-full h-full flex items-center justify-center text-5xl bg-background/50">
                  {{ fish.emoji }}
                </div>
                
                <!-- 未解锁时显示液态玻璃遮罩 -->
                <div v-if="!fish.unlocked" class="absolute inset-0 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center border border-white/20 rounded-xl">
                  <span class="text-4xl mb-2">🔒</span>
                  <span class="text-gray-300 text-xs">未解锁</span>
                </div>
              </div>

              <div v-if="fish.unlocked" class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold text-white"
                   :class="getRarityBgClass(fish.rarity)">
                {{ fish.rarity }}
              </div>

              <div v-if="fish.releaseCount > 0 && fish.unlocked" class="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded-full text-xs text-white">
                x{{ fish.releaseCount }}
              </div>
            </div>
            <p class="text-center text-sm mt-2 truncate" :class="fish.unlocked ? 'text-white' : 'text-gray-400'">{{ fish.name }}</p>
          </div>
        </div>
      </div>

      <FishDetailModal :fish="selectedFish" @close="selectedFish = null" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFishCatalogStore } from '@/store/fishCatalog'
import { RARITY } from '@/data/fishCatalog'
import FishDetailModal from './FishDetailModal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const fishCatalogStore = useFishCatalogStore()

const selectedRarity = ref('all')
const selectedFish = ref(null)

const rarities = ['all', 'N', 'R', 'SR', 'SSR', 'UR', 'EX']

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const totalFishCount = computed(() => fishCatalogStore.totalFishCount)
const unlockedCount = computed(() => fishCatalogStore.unlockedCount)

const filteredFish = computed(() => {
  const fishList = fishCatalogStore.unlockedFish
  if (selectedRarity.value === 'all') {
    return fishList
  }
  return fishList.filter(f => f.rarity === selectedRarity.value)
})

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
    'all': 'bg-cyan-600',
    'N': 'bg-gray-600',
    'R': 'bg-blue-500',
    'SR': 'bg-purple-500',
    'SSR': 'bg-pink-500',
    'UR': 'bg-orange-500',
    'EX': 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
  }
  return bgColors[rarity] || bgColors['N']
}

function showFishDetail(fish) {
  selectedFish.value = fish
}

function onClose() {
  isOpen.value = false
}
</script>

<style scoped>
</style>
