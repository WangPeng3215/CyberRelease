import { defineStore } from 'pinia'
import { ref } from 'vue'
import { waters } from '@/data/waters'
import { fishes } from '@/data/fish'
import { events, broadcastList, rankList } from '@/data/events'
import { useAuthStore } from './auth'
import { useFishCatalogStore } from './fishCatalog'

export const useAppStore = defineStore('app', () => {
  const authStore = useAuthStore()
  const fishCatalogStore = useFishCatalogStore()
  const selectedWater = ref(null)
  const showFishDialog = ref(false)
  const showReleaseAnimation = ref(false)
  const releasingFish = ref(null)
  const onlineCount = ref(8899)
  const todayReleaseCount = ref(114514)
  const totalReleaseCount = ref(114514)
  const visitedLocations = ref([])
  const newlyUnlockedFish = ref([])

  const watersData = ref(waters)
  const fishesData = ref(fishes)
  const eventsData = ref(events)
  const broadcastData = ref(broadcastList)
  const rankData = ref(rankList)

  function selectWater(water) {
    selectedWater.value = water
    if (water?.name && !visitedLocations.value.includes(water.name)) {
      visitedLocations.value.push(water.name)
    }
  }

  function toggleFishDialog(show) {
    showFishDialog.value = show
  }

  async function releaseFish(fish, count) {
    const totalMerit = fish.merit * count
    
    if (selectedWater.value) {
      if (selectedWater.value.releaseCount !== undefined) {
        selectedWater.value.releaseCount += count
      }
    }
    todayReleaseCount.value += count
    totalReleaseCount.value += count
    
    if (authStore.userData) {
      await authStore.updateUserMerit(totalMerit)
    }
    
    addBroadcast(fish, count, getLocationDisplayName())
    
    releasingFish.value = { fish, count }
    showReleaseAnimation.value = true
    setTimeout(() => {
      showReleaseAnimation.value = false
      releasingFish.value = null
    }, 2000)
    
    // 记录放生到图鉴
    const catalogFish = fishCatalogStore.catalog.find(f => f.name === fish.name)
    if (catalogFish) {
      await fishCatalogStore.recordRelease(catalogFish.id, count, totalMerit)
    }
    
    // 检查解锁条件
    const newlyUnlocked = await fishCatalogStore.checkUnlockConditions({
      totalReleaseCount: totalReleaseCount.value,
      totalMerit: getCurrentUserMerit(),
      visitedLocations: visitedLocations.value
    })
    
    if (newlyUnlocked.length > 0) {
      newlyUnlockedFish.value = newlyUnlocked
    }
    
    if (Math.random() < 0.1) {
      triggerRandomEvent(selectedWater.value)
    }
    
    return totalMerit
  }

  function getLocationDisplayName() {
    if (!selectedWater.value) return '未知地点'
    
    if (selectedWater.value.ecologyScore !== undefined) {
      return selectedWater.value.name
    }
    
    if (selectedWater.value.lat !== undefined && selectedWater.value.lng !== undefined) {
      return `自定义地点 (${selectedWater.value.lat.toFixed(2)}°, ${selectedWater.value.lng.toFixed(2)}°)`
    }
    
    return selectedWater.value.name || '未知地点'
  }

  function addBroadcast(fish, count, waterName) {
    const username = authStore.userData?.nickname || '匿名用户'
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    broadcastData.value.unshift({
      time: timeStr,
      content: `${username} 向${waterName}放生了 ${count} 条 ${fish.name}`,
      tag: '放生'
    })
    
    if (broadcastData.value.length > 50) {
      broadcastData.value.pop()
    }
  }

  function triggerRandomEvent(water) {
    const eventTypes = [
      { type: '生态', content: `${water?.name || '某水域'}生态指数上升了！`, tag: '生态' },
      { type: '稀有', content: `哇！发现了一条稀有鱼类！`, tag: '稀有' },
      { type: '事件', content: `全球放生数量突破新纪录！`, tag: '事件' }
    ]
    
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const now = new Date()
    event.time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    eventsData.value.unshift(event)
    if (eventsData.value.length > 10) {
      eventsData.value.pop()
    }
  }

  function getCurrentUserMerit() {
    return authStore.userData?.merit_points || 114514
  }
  
  function getCurrentUserLevel() {
    if (authStore.userData) {
      const merit = authStore.userData.merit_points
      if (merit >= 1000) return 'Lv.50'
      if (merit >= 500) return 'Lv.20'
      if (merit >= 100) return 'Lv.10'
      if (merit >= 50) return 'Lv.5'
      return 'Lv.1'
    }
    return 'Lv.9'
  }
  
  function getCurrentUserTitle() {
    if (authStore.userData) {
      const merit = authStore.userData.merit_points
      if (merit >= 1000) return '电子如来'
      if (merit >= 500) return '海鲜供应商'
      if (merit >= 100) return '赛博龙王'
      if (merit >= 50) return '网络观音'
      return '电子善人'
    }
    return '赛博龙王'
  }

  return {
    selectedWater,
    showFishDialog,
    showReleaseAnimation,
    releasingFish,
    onlineCount,
    todayReleaseCount,
    totalReleaseCount,
    visitedLocations,
    newlyUnlockedFish,
    watersData,
    fishesData,
    eventsData,
    broadcastData,
    rankData,
    selectWater,
    toggleFishDialog,
    releaseFish,
    getCurrentUserMerit,
    getCurrentUserLevel,
    getCurrentUserTitle
  }
})
