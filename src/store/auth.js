import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userData = ref(null)
  const loading = ref(false)

  // 注册函数
  async function register(username, password, nickname) {
    loading.value = true
    try {
      // 调用数据库函数注册
      const { data, error } = await supabase.rpc('register_user', {
        p_username: username,
        p_nickname: nickname || username,
        p_password: password
      })

      if (error) {
        // 处理用户名重复错误
        if (error.message.includes('用户名已存在')) {
          throw new Error('该用户名已被注册，请换一个！')
        }
        throw error
      }

      // 注册成功后自动登录
      await login(username, password)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 登录函数
  async function login(username, password) {
    loading.value = true
    try {
      // 调用数据库函数验证登录
      const { data, error } = await supabase.rpc('verify_login', {
        p_username: username,
        p_password: password
      })

      if (error) {
        if (error.message.includes('用户不存在')) {
          throw new Error('用户不存在！')
        }
        if (error.message.includes('密码错误')) {
          throw new Error('密码错误！')
        }
        throw error
      }

      // 检查是否返回了数据
      if (!data || data.length === 0) {
        throw new Error('用户名或密码错误！')
      }

      // 保存用户信息
      const userInfo = data[0]
      user.value = { id: userInfo.id }
      userData.value = {
        id: userInfo.id,
        username: userInfo.username,
        nickname: userInfo.nickname,
        merit_points: userInfo.merit_points,
        merit_level: userInfo.merit_level,
        total_releases: 0,
        total_fish_released: 0,
        achievements: []
      }

      // 保存登录状态到 localStorage
      localStorage.setItem('cyber_user_id', userInfo.id)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 登出函数
  function logout() {
    user.value = null
    userData.value = null
    localStorage.removeItem('cyber_user_id')
  }

  // 检查登录状态
  async function checkSession() {
    loading.value = true
    try {
      const savedUserId = localStorage.getItem('cyber_user_id')
      
      if (savedUserId) {
        // 从数据库获取用户信息
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', savedUserId)
          .single()

        if (data && !error) {
          user.value = { id: data.id }
          userData.value = data
        } else {
          // 如果数据库中找不到，清除本地存储
          localStorage.removeItem('cyber_user_id')
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      localStorage.removeItem('cyber_user_id')
    } finally {
      loading.value = false
    }
  }

  // 更新用户功德
  async function updateUserMerit(points) {
    if (!userData.value) return

    try {
      const newMerit = userData.value.merit_points + points
      const newLevel = calculateMeritLevel(newMerit)

      const { error } = await supabase
        .from('users')
        .update({
          merit_points: newMerit,
          merit_level: newLevel,
          total_releases: userData.value.total_releases + 1,
          last_active_at: new Date().toISOString()
        })
        .eq('id', user.value.id)

      if (error) throw error

      userData.value.merit_points = newMerit
      userData.value.merit_level = newLevel
      userData.value.total_releases += 1
    } catch (error) {
      console.error('更新用户功德失败:', error)
    }
  }

  function calculateMeritLevel(points) {
    if (points >= 1000) return 50
    if (points >= 500) return 20
    if (points >= 100) return 10
    if (points >= 50) return 5
    return 1
  }

  return {
    user,
    userData,
    loading,
    register,
    login,
    logout,
    checkSession,
    updateUserMerit
  }
})
