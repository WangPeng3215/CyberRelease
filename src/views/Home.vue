<script setup>
import { useRouter } from 'vue-router'
import MapView from '@/components/map/MapView.vue'
import RightInfoPanel from '@/components/panels/RightInfoPanel.vue'
import RankPanel from '@/components/panels/RankPanel.vue'
import EventPanel from '@/components/panels/EventPanel.vue'
import FishDialog from '@/components/dialogs/FishDialog.vue'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

function getMeritTitle(level) {
  if (level >= 50) return '电子如来'
  if (level >= 20) return '海鲜供应商'
  if (level >= 10) return '赛博龙王'
  if (level >= 5) return '网络观音'
  return '电子善人'
}

async function handleSignOut() {
  await authStore.logout()
}
</script>

<template>
  <div class="w-full h-screen bg-background overflow-hidden flex flex-col">
    <header class="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🌊</span>
          </div>
          <div>
            <div class="text-white font-bold text-xl">赛博放生</div>
            <div class="text-gray-400 text-xs">CYBER RELEASE</div>
          </div>
        </div>
        
        <div class="hidden md:flex items-center gap-1 ml-8">
          <button class="px-4 py-2 bg-primary text-white rounded-lg font-medium">首页</button>
          <button class="px-4 py-2 text-gray-400 hover:text-white transition-colors">生态监测</button>
          <button class="px-4 py-2 text-gray-400 hover:text-white transition-colors">功德排行榜</button>
          <button class="px-4 py-2 text-gray-400 hover:text-white transition-colors">鱼类图鉴</button>
          <button class="px-4 py-2 text-gray-400 hover:text-white transition-colors">生态事件</button>
          <button class="px-4 py-2 text-gray-400 hover:text-white transition-colors">关于我们</button>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div v-if="authStore.user" class="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-2">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
            🧑‍💻
          </div>
          <div class="hidden sm:block">
            <div class="text-white font-medium">{{ authStore.userData?.nickname || '用户' }}</div>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-gray-400">功德值: </span>
              <span class="text-highlight font-bold">{{ authStore.userData?.merit_points?.toLocaleString() || 0 }}</span>
              <span class="text-primary font-semibold">Lv.{{ authStore.userData?.merit_level || 1 }}</span>
              <span class="text-yellow-400">{{ getMeritTitle(authStore.userData?.merit_level || 1) }}</span>
            </div>
          </div>
          <button
            @click="handleSignOut"
            class="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
          >
            退出
          </button>
        </div>
        <button
          v-else
          @click="router.push('/auth')"
          class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          登录/注册
        </button>
      </div>
    </header>
    
    <main class="flex-1 flex overflow-hidden p-4 gap-4">
      <div class="flex-1 rounded-xl overflow-hidden border border-border">
        <MapView />
      </div>
      
      <div class="w-80 flex flex-col gap-4 shrink-0">
        <div class="h-1/2">
          <RightInfoPanel />
        </div>
        <div class="flex-1">
          <EventPanel />
        </div>
      </div>
    </main>
    
    <footer class="h-48 px-4 pb-4 shrink-0">
      <div class="flex gap-4 h-full">
        <div class="flex-1">
          <div class="w-full h-full bg-card border border-border rounded-xl p-4 flex flex-col">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">📰</span>
                <span class="text-white font-semibold">生态事件</span>
              </div>
              <button class="text-gray-400 hover:text-white text-sm">更多 ></button>
            </div>
            
            <div class="flex-1 overflow-y-auto space-y-2">
              <div v-for="(event, index) in appStore.eventsData" :key="index"
                   class="flex items-center gap-3 p-2 rounded hover:bg-gray-800/50 transition-colors">
                <span class="text-gray-400 text-sm w-12 shrink-0">{{ event.time }}</span>
                <span class="text-gray-300 text-sm flex-1">{{ event.content }}</span>
                <span :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  event.tag === '事件' ? 'bg-purple-500/30 text-purple-400' :
                  event.tag === '生态' ? 'bg-green-500/30 text-green-400' :
                  event.tag === '稀有' ? 'bg-orange-500/30 text-orange-400' :
                  'bg-gray-600/30 text-gray-400'
                ]">
                  {{ event.tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex-1">
          <RankPanel />
        </div>
        
        <div class="flex-1">
          <div class="w-full h-full bg-card border border-border rounded-xl p-4 flex flex-col">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">📊</span>
                <span class="text-white font-semibold">生态报告</span>
              </div>
              <button class="text-gray-400 hover:text-white text-sm">更多 ></button>
            </div>
            
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="text-gray-400 mb-2">《2026电子生态月度报告》</div>
                <div class="text-gray-500 text-sm mb-4">本月全球放生总量突破</div>
                <div class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-highlight mb-4">
                  2,514,514
                </div>
                <div class="text-sm text-gray-400">条</div>
                
                <div class="mt-4 flex justify-center gap-8 text-sm">
                  <div>
                    <span class="text-gray-400">生态改善水域</span>
                    <div class="text-cyan-400 font-bold text-lg">12 个</div>
                  </div>
                  <div>
                    <span class="text-gray-400">生态恶化水域</span>
                    <div class="text-orange-400 font-bold text-lg">3 个</div>
                  </div>
                </div>
              </div>
              
              <div class="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-20">
                🐟
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    
    <FishDialog />
  </div>
</template>
