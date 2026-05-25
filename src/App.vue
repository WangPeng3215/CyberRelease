<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkSession()
})
</script>

<template>
  <RouterView />
</template>

<style>
@import 'leaflet/dist/leaflet.css';
@import 'mars2d/mars2d.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 150, 255, 0.6);
}

.mars2d-control-bar {
  background: rgba(10, 20, 40, 0.9) !important;
  border: 1px solid rgba(0, 150, 255, 0.4) !important;
  border-radius: 8px !important;
}

.mars2d-control-zoom {
  background: rgba(10, 20, 40, 0.9) !important;
  border: 1px solid rgba(0, 150, 255, 0.4) !important;
  border-radius: 8px !important;
}

.mars2d-control-scale {
  background: rgba(10, 20, 40, 0.8) !important;
  border: 1px solid rgba(0, 150, 255, 0.4) !important;
  border-radius: 4px !important;
  color: #fff !important;
  font-size: 12px !important;
}
</style>
