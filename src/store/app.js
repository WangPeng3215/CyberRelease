import { defineStore } from 'pinia'
import { ref } from 'vue'
import { waters } from '@/data/waters'
import { fishes } from '@/data/fish'
import { events, broadcastList, rankList } from '@/data/events'

export const useAppStore = defineStore('app', () => {
  const selectedWater = ref(null)
  const userMerit = ref(114514)
  const userLevel = ref('Lv.9')
  const userTitle = ref('赛博龙王')
  const onlineCount = ref(8899)
  const showFishDialog = ref(false)
  const todayReleaseCount = ref(114514)

  const watersData = ref(waters)
  const fishesData = ref(fishes)
  const eventsData = ref(events)
  const broadcastData = ref(broadcastList)
  const rankData = ref(rankList)

  function selectWater(water) {
    selectedWater.value = water
  }

  function toggleFishDialog(show) {
    showFishDialog.value = show
  }

  function releaseFish(fish, count) {
    const totalMerit = fish.merit * count
    userMerit.value += totalMerit
    todayReleaseCount.value += count
    
    if (selectedWater.value) {
      selectedWater.value.releaseCount += count
    }
    
    return totalMerit
  }

  function addMerit(value) {
    userMerit.value += value
  }

  return {
    selectedWater,
    userMerit,
    userLevel,
    userTitle,
    onlineCount,
    showFishDialog,
    todayReleaseCount,
    watersData,
    fishesData,
    eventsData,
    broadcastData,
    rankData,
    selectWater,
    toggleFishDialog,
    releaseFish,
    addMerit
  }
})
