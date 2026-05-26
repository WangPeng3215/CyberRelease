import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { getRarityInfo } from '@/data/fishCatalog'

// 本地缓存键名
const CACHE_KEY = 'fish_catalog_cache'
const CACHE_EXPIRE_KEY = 'fish_catalog_cache_expire'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时

// 本地鱼数据（使用本地图片）
const LOCAL_FISH_DATA = [
  { id: 1, name: '锦鲤', rarity: 'SR', description: '被称为"水中活宝石"，象征着吉祥如意', emoji: '🎏', imageUrl: '/images/fishcatalog/jinli.png', totalMerit: 15, unlockType: 'default', unlocked: true, releaseCount: 0, totalMeritEarned: 0 },
  { id: 2, name: '程序员草鱼', rarity: 'SR', description: '专门在程序员熬夜时出现的鱼类', emoji: '⌨️', imageUrl: '/images/fishcatalog/CodingFish.png', totalMerit: 20, unlockType: 'release_count', unlockValue: '10', unlocked: false, releaseCount: 0, totalMeritEarned: 0 },
  { id: 3, name: '产品经理鱼', rarity: 'SSR', description: '掌控需求变更的神秘鱼类', emoji: '📋', imageUrl: '/images/fishcatalog/PMfish.png', totalMerit: 66, unlockType: 'merit', unlockValue: '100', unlocked: false, releaseCount: 0, totalMeritEarned: 0 },
  { id: 4, name: '摸鱼专家', rarity: 'SR', description: '传说中只在程序员加班时才会出现的神秘鱼类', emoji: '💻', imageUrl: '/images/fishcatalog/mofish.png', totalMerit: 25, unlockType: 'random', unlockValue: '0.05', unlocked: false, releaseCount: 0, totalMeritEarned: 0 },
  { id: 5, name: '鱼航员', rarity: 'UR', description: '来自遥远星际的神秘鱼类', emoji: '👨‍🚀', imageUrl: '/images/fishcatalog/spacefish.png', totalMerit: 88, unlockType: 'release_location', unlockValue: '海洋', unlocked: false, releaseCount: 0, totalMeritEarned: 0 },
  { id: 6, name: '哥斯拉鱼', rarity: 'EX', description: '传说中的究极鱼类！', emoji: '🦎', imageUrl: '/images/fishcatalog/gslfish.png', totalMerit: 999, unlockType: 'merit', unlockValue: '1000', unlocked: false, releaseCount: 0, totalMeritEarned: 0 }
]

export const useFishCatalogStore = defineStore('fishCatalog', () => {
  const authStore = useAuthStore()
  
  // 状态
  const catalog = ref([])
  const isCatalogOpen = ref(false)
  const isLoading = ref(false)
  const userUnlocks = ref([])
  const loadingError = ref(null)

  // 计算属性
  const totalFishCount = computed(() => catalog.value.length)
  const unlockedCount = computed(() => userUnlocks.value.length)
  const lockedCount = computed(() => totalFishCount.value - unlockedCount.value)

  const unlockedFish = computed(() => {
    return catalog.value.map(fish => {
      const unlockRecord = userUnlocks.value.find(u => u.fish_id === fish.id)
      // 如果有用户解锁记录，使用记录状态；否则使用鱼的默认解锁状态
      const isUnlocked = unlockRecord ? true : fish.unlocked
      return {
        ...fish,
        unlocked: isUnlocked,
        releaseCount: unlockRecord?.release_count || 0,
        totalMeritEarned: unlockRecord?.total_merit_earned || 0
      }
    })
  })

  const lockedFish = computed(() => unlockedFish.value.filter(f => !f.unlocked))

  // 本地缓存函数
  function getLocalCache() {
    try {
      const cache = localStorage.getItem(CACHE_KEY)
      const expire = localStorage.getItem(CACHE_EXPIRE_KEY)
      
      if (!cache || !expire) return null
      
      if (Date.now() > parseInt(expire)) {
        console.log('缓存已过期')
        clearLocalCache()
        return null
      }
      
      return JSON.parse(cache)
    } catch (e) {
      console.error('读取缓存失败:', e)
      return null
    }
  }
  
  function setLocalCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_EXPIRE_KEY, (Date.now() + CACHE_DURATION).toString())
    } catch (e) {
      console.error('设置缓存失败:', e)
    }
  }
  
  function clearLocalCache() {
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_EXPIRE_KEY)
    } catch (e) {
      console.error('清除缓存失败:', e)
    }
  }

  // 获取鱼类数据
  async function fetchFishCatalog() {
    isLoading.value = true
    loadingError.value = null
    
    // 强制清除旧缓存
    clearLocalCache()
    
    try {
      // 直接从数据库获取（不使用缓存）
      await fetchFromDatabase(false)
    } catch (error) {
      console.error('获取鱼类图鉴失败:', error)
      loadingError.value = error.message
      // 出错时使用本地数据
      useLocalData()
    } finally {
      isLoading.value = false
    }
  }
  
  // 从数据库获取数据
  async function fetchFromDatabase(background = false) {
    try {
      console.log('正在从数据库获取鱼类数据...')
      const { data, error } = await supabase
        .from('fish_catalog')
        .select('*')
        .eq('status', true)
        .order('sort_order', { ascending: true })
      
      console.log('数据库查询结果 - data:', data)
      console.log('数据库查询结果 - error:', error)
      
      if (error) {
        throw error
      }
      
      if (data && data.length > 0) {
        console.log('成功从数据库获取到', data.length, '条鱼类数据')
        console.log('原始数据库数据:', JSON.stringify(data, null, 2))
        
        const processedData = data.map(fish => {
          const localImage = getLocalImageByName(fish.name)
          // 获取稀有度，如果数据库中没有则根据鱼名设置默认值
          let rarity = fish.rarity || fish.rarity_level || 'N'
          // 确保稀有度是有效的
          const validRarities = ['N', 'R', 'SR', 'SSR', 'UR', 'EX']
          if (!validRarities.includes(rarity)) {
            // 根据鱼名设置默认稀有度
            const defaultRarityMap = {
              '锦鲤': 'SR',
              '程序员草鱼': 'SR',
              '产品经理鱼': 'SSR',
              '摸鱼专家': 'SR',
              '鱼航员': 'UR',
              '哥斯拉鱼': 'EX'
            }
            rarity = defaultRarityMap[fish.name] || 'N'
          }
          // 锦鲤默认解锁，或者数据库中 unlock_type = 'default' 的
          const isDefault = fish.unlock_type === 'default' || fish.name === '锦鲤'
          console.log(`处理鱼类: ${fish.name}, rarity: "${rarity}", unlock_type: "${fish.unlock_type}", 默认解锁: ${isDefault}`)
          return {
            id: fish.id,
            name: fish.name,
            rarity: rarity,
            description: fish.description,
            emoji: fish.emoji,
            imageUrl: localImage,
            totalMerit: fish.merit_points,
            unlockType: fish.unlock_type,
            unlockValue: fish.unlock_value,
            unlocked: isDefault,
            releaseCount: 0,
            totalMeritEarned: 0
          }
        })
        
        catalog.value = processedData
        setLocalCache(processedData)
        console.log('处理后的鱼类数据:', JSON.stringify(processedData, null, 2))
        
        // 检查是否有默认解锁的鱼
        const defaultUnlocked = processedData.filter(f => f.unlocked)
        console.log('默认解锁的鱼:', defaultUnlocked.map(f => f.name))
      } else {
        console.warn('数据库中没有鱼类数据，使用本地数据')
        useLocalData()
      }
    } catch (error) {
      console.error('从数据库获取失败:', error)
      if (!background) {
        console.warn('数据库获取失败，使用本地数据')
        useLocalData()
      }
    }
  }
  
  // 使用本地数据
  function useLocalData() {
    catalog.value = [...LOCAL_FISH_DATA]
    setLocalCache(LOCAL_FISH_DATA)
  }
  
  // 根据鱼名称获取本地图片
  function getLocalImageByName(name) {
    const nameMap = {
      '锦鲤': '/images/fishcatalog/jinli.png',
      '程序员草鱼': '/images/fishcatalog/CodingFish.png',
      '产品经理鱼': '/images/fishcatalog/PMfish.png',
      '摸鱼专家': '/images/fishcatalog/mofish.png',
      '鱼航员': '/images/fishcatalog/spacefish.png',
      '哥斯拉鱼': '/images/fishcatalog/gslfish.png'
    }
    return nameMap[name] || ''
  }

  // 获取用户解锁记录
  async function fetchUserUnlocks() {
    if (!authStore.user?.id) return
    
    try {
      // 检查用户ID是否为UUID格式，如果是则跳过查询（因为数据库字段是bigint）
      const userId = authStore.user.id
      if (typeof userId === 'string' && userId.includes('-')) {
        console.warn('用户ID是UUID格式，但数据库user_id字段是bigint类型，跳过解锁记录查询')
        return
      }
      
      const { data, error } = await supabase
        .from('user_fish_unlocks')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      
      userUnlocks.value = data || []
    } catch (error) {
      console.error('获取用户解锁记录失败:', error)
    }
  }

  // 获取单条鱼
  const getFishById = (id) => catalog.value.find(fish => fish.id === id)
  
  // 获取某稀有度的鱼
  const getFishByRarity = (rarity) => catalog.value.filter(fish => fish.rarity === rarity)

  // 解锁鱼
  async function unlockFish(fishId, unlockMethod = 'normal') {
    if (!authStore.user?.id) return null
    
    const userId = authStore.user.id
    // 检查用户ID是否为UUID格式，如果是则不进行数据库操作
    if (typeof userId === 'string' && userId.includes('-')) {
      console.warn('用户ID是UUID格式，跳过数据库解锁操作')
      // 返回模拟数据
      const mockData = {
        id: Date.now(),
        user_id: userId,
        fish_id: fishId,
        unlock_method: unlockMethod,
        release_count: 0,
        total_merit_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      userUnlocks.value.push(mockData)
      return mockData
    }
    
    try {
      const { data, error } = await supabase
        .from('user_fish_unlocks')
        .insert({
          user_id: userId,
          fish_id: fishId,
          unlock_method: unlockMethod
        })
        .select()
        .single()
      
      if (error) throw error
      
      userUnlocks.value.push(data)
      return data
    } catch (error) {
      console.error('解锁鱼类失败:', error)
      return null
    }
  }

  // 检查解锁条件
  async function checkUnlockConditions(stats) {
    if (!authStore.user?.id) return []
    
    const newlyUnlocked = []
    
    for (const fish of catalog.value) {
      const isAlreadyUnlocked = userUnlocks.value.some(u => u.fish_id === fish.id)
      if (isAlreadyUnlocked) continue
      
      let shouldUnlock = false
      
      switch (fish.unlockType) {
        case 'default':
          shouldUnlock = true
          break
        case 'release_count':
          if (stats.totalReleaseCount >= parseInt(fish.unlockValue)) {
            shouldUnlock = true
          }
          break
        case 'merit':
          if (stats.totalMerit >= parseInt(fish.unlockValue)) {
            shouldUnlock = true
          }
          break
        case 'release_location':
          if (stats.visitedLocations?.includes(fish.unlockValue)) {
            shouldUnlock = true
          }
          break
        case 'random':
          if (Math.random() < parseFloat(fish.unlockValue)) {
            shouldUnlock = true
          }
          break
      }
      
      if (shouldUnlock) {
        const unlockRecord = await unlockFish(fish.id, fish.unlockType)
        if (unlockRecord) {
          newlyUnlocked.push({ ...fish, unlocked: true })
        }
      }
    }
    
    return newlyUnlocked
  }

  // 记录放生
  async function recordRelease(fishId, count = 1, meritEarned = 0) {
    if (!authStore.user?.id) return
    
    const userId = authStore.user.id
    const isUUID = typeof userId === 'string' && userId.includes('-')
    
    // 先检查是否已解锁，没有的话尝试解锁
    let unlockRecord = userUnlocks.value.find(u => u.fish_id === fishId)
    if (!unlockRecord) {
      unlockRecord = await unlockFish(fishId, 'first_release')
      if (!unlockRecord) return
    }
    
    // 更新解锁记录
    try {
      // 如果是UUID格式的用户ID，只更新本地数据
      if (isUUID) {
        console.warn('用户ID是UUID格式，只更新本地放生记录')
        const idx = userUnlocks.value.findIndex(u => u.id === unlockRecord.id)
        if (idx !== -1) {
          userUnlocks.value[idx].release_count += count
          userUnlocks.value[idx].total_merit_earned += meritEarned
        }
        return
      }
      
      const { error } = await supabase
        .from('user_fish_unlocks')
        .update({
          release_count: unlockRecord.release_count + count,
          total_merit_earned: unlockRecord.total_merit_earned + meritEarned
        })
        .eq('id', unlockRecord.id)
      
      if (error) throw error
      
      // 更新本地数据
      const idx = userUnlocks.value.findIndex(u => u.id === unlockRecord.id)
      if (idx !== -1) {
        userUnlocks.value[idx].release_count += count
        userUnlocks.value[idx].total_merit_earned += meritEarned
      }
    } catch (error) {
      console.error('记录放生失败:', error)
    }
  }

  // 加载所有数据
  async function loadCatalog() {
    await Promise.all([
      fetchFishCatalog(),
      fetchUserUnlocks()
    ])
  }

  // 弹窗控制
  const toggleCatalog = () => { isCatalogOpen.value = !isCatalogOpen.value }
  const openCatalog = () => { isCatalogOpen.value = true }
  const closeCatalog = () => { isCatalogOpen.value = false }

  return {
    catalog,
    isCatalogOpen,
    isLoading,
    loadingError,
    userUnlocks,
    totalFishCount,
    unlockedCount,
    lockedCount,
    unlockedFish,
    lockedFish,
    getFishById,
    getFishByRarity,
    getRarityInfo,
    fetchFishCatalog,
    fetchUserUnlocks,
    loadCatalog,
    unlockFish,
    checkUnlockConditions,
    recordRelease,
    toggleCatalog,
    openCatalog,
    closeCatalog
  }
})
