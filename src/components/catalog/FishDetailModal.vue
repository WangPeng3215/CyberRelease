<template>
  <div v-if="fish" class="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
    <div class="bg-card border border-border rounded-2xl max-w-md w-full overflow-hidden relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white z-10">
        ✕
      </button>

      <div :class="['relative h-48 overflow-hidden', getRarityBgClass(fish.rarity)]">
        <div v-if="fish.unlocked" class="w-full h-full flex items-center justify-center">
          <img :src="fish.imageUrl" :alt="fish.name" class="w-32 h-32 object-cover rounded-full border-4"
               :class="getRarityBorderClass(fish.rarity)"
               @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }"/>
          <div v-show="false" class="w-32 h-32 flex items-center justify-center text-7xl bg-background/30 rounded-full">
            {{ fish.emoji }}
          </div>
        </div>
        <div v-else class="w-full h-full flex items-center justify-center bg-background/50">
          <span class="text-7xl">❓</span>
        </div>
      </div>

      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold text-white">{{ fish.unlocked ? fish.name : '???' }}</h3>
            <p class="text-gray-400 text-sm mt-1">
              稀有度: 
              <span :class="getRarityTextClass(fish.rarity)" class="ml-2 font-bold">
                {{ fish.rarity }}
              </span>
            </p>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-bold', getRarityBgClass(fish.rarity)]">
            {{ fish.rarity }}
          </span>
        </div>

        <div v-if="fish.unlocked" class="space-y-4">
          <div class="bg-background/50 rounded-xl p-4">
            <p class="text-gray-300 text-sm leading-relaxed">{{ fish.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-background/30 rounded-lg p-3 text-center">
              <p class="text-gray-500 text-xs mb-1">功德值/条</p>
              <p class="text-xl font-bold text-cyan-400">+{{ fish.totalMerit }}</p>
            </div>
            <div class="bg-background/30 rounded-lg p-3 text-center">
              <p class="text-gray-500 text-xs mb-1">已放生</p>
              <p class="text-xl font-bold text-green-400">{{ fish.releaseCount }}条</p>
            </div>
          </div>

          <div class="border-t border-border pt-4">
            <p class="text-gray-400 text-xs mb-2">解锁条件</p>
            <p class="text-sm text-white">{{ getUnlockConditionText(fish) }}</p>
          </div>
        </div>

        <div v-else class="py-8 text-center">
          <p class="text-gray-500">还未解锁这条鱼</p>
          <p class="text-gray-600 text-sm mt-2">{{ getUnlockConditionText(fish) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RARITY, UNLOCK_TYPES } from '@/data/fishCatalog'

const props = defineProps({
  fish: Object
})

defineEmits(['close'])

function getRarityBorderClass(rarity) {
  const borderColors = {
    'N': 'border-white',
    'R': 'border-blue-500',
    'SR': 'border-purple-500',
    'SSR': 'border-pink-500',
    'UR': 'border-orange-500',
    'EX': 'border-transparent'
  }
  return borderColors[rarity] || borderColors['N']
}

function getRarityBgClass(rarity) {
  const bgColors = {
    'N': 'bg-white/10',
    'R': 'bg-blue-500/20',
    'SR': 'bg-purple-500/20',
    'SSR': 'bg-pink-500/20',
    'UR': 'bg-orange-500/20',
    'EX': 'bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20'
  }
  return bgColors[rarity] || bgColors['N']
}

function getRarityTextClass(rarity) {
  const textColors = {
    'N': 'text-white',
    'R': 'text-blue-400',
    'SR': 'text-purple-400',
    'SSR': 'text-pink-400',
    'UR': 'text-orange-400',
    'EX': 'animate-pulse'
  }
  return textColors[rarity] || textColors['N']
}

function getUnlockConditionText(fish) {
  switch (fish.unlockType) {
    case UNLOCK_TYPES.DEFAULT:
      return '默认解锁'
    case UNLOCK_TYPES.RELEASE_COUNT:
      return `累计放生 ${fish.unlockValue} 条鱼后解锁`
    case UNLOCK_TYPES.MERIT:
      return `累计获得 ${fish.unlockValue} 功德值后解锁`
    case UNLOCK_TYPES.RELEASE_LOCATION:
      return `在 ${fish.unlockValue} 放生过解锁`
    case UNLOCK_TYPES.RANDOM:
      return `放生时有 ${(fish.unlockValue * 100).toFixed(2)}% 概率随机解锁`
    case UNLOCK_TYPES.EVENT:
      return `${fish.unlockValue} 活动限定`
    default:
      return '未知条件'
  }
}
</script>

<style scoped>
.animate-pulse {
  animation: rainbow 2s linear infinite;
  background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
