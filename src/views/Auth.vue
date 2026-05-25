<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/20 p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">赛博放生</h1>
          <p class="text-blue-300">全球电子生态放生平台</p>
        </div>

        <div class="flex gap-2 mb-6">
          <button
            @click="mode = 'login'"
            :class="[
              'flex-1 py-3 px-4 rounded-lg font-medium transition-all',
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            ]"
          >
            登录
          </button>
          <button
            @click="mode = 'signup'"
            :class="[
              'flex-1 py-3 px-4 rounded-lg font-medium transition-all',
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            ]"
          >
            注册
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">用户名</label>
            <input
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入用户名"
            />
          </div>

          <div v-if="mode === 'signup'">
            <label class="block text-sm font-medium text-slate-300 mb-2">昵称</label>
            <input
              v-model="nickname"
              type="text"
              required
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入昵称（选填）"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">密码</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入密码"
            />
          </div>

          <div v-if="mode === 'signup'">
            <label class="block text-sm font-medium text-slate-300 mb-2">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请再次输入密码"
            />
          </div>

          <div v-if="errorMessage" class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            {{ successMessage }}
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            {{ authStore.loading ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            @click="$router.push('/')"
            class="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            跳过，随便逛逛 →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (mode.value === 'signup') {
    // 验证两次密码是否一致
    if (password.value !== confirmPassword.value) {
      errorMessage.value = '两次输入的密码不一致！'
      return
    }

    // 验证密码长度
    if (password.value.length < 6) {
      errorMessage.value = '密码至少需要6个字符！'
      return
    }

    // 注册
    const result = await authStore.register(username.value, password.value, nickname.value)
    
    if (result.success) {
      successMessage.value = '注册成功！正在登录...'
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      errorMessage.value = result.error
    }
  } else {
    // 登录
    const result = await authStore.login(username.value, password.value)
    
    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.error
    }
  }
}
</script>
