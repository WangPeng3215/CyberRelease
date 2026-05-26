<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as mars2d from 'mars2d'
import * as L from 'leaflet'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const mapContainer = ref(null)
let map = null
let clickMarker = null
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const isSearching = ref(false)
const customLocation = ref(null)
const locationInfo = ref(null)
const isLoadingLocation = ref(false)

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  if (map) {
    map.destroy()
  }
})

function initMap() {
  if (!mapContainer.value) return

  map = new mars2d.Map('mapContainer', {
    center: { lng: 105, lat: 35 },
    zoom: 4,
    minZoom: 3,
    maxZoom: 18,
    crs: L.CRS.EPSG3857,
    maxBounds: [[-90, -180], [90, 180]],
    controls: {
      scale: true,
      locationBar: {
        format: '{x}° {y}°'
      },
      attribution: false
    }
  })

  addBaseMap()
  addWaterMarkers()
  addZoomControl()
  addMapOverlay()
  addClickHandler()
}

function addBaseMap() {
  const satelliteBaseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19
  })
  map.addLayer(satelliteBaseLayer)
}

function createWaterIcon(water) {
  const icon = L.divIcon({
    className: 'water-marker',
    html: `
      <div class="water-marker-wrapper">
        <div class="water-pulse"></div>
        <div class="water-icon">💧</div>
        <div class="water-glow"></div>
        <div class="water-label">${water.name}</div>
        <div class="water-count">${(water.releaseCount / 10000).toFixed(1)}万</div>
      </div>
    `,
    iconSize: [100, 70],
    iconAnchor: [50, 35],
    popupAnchor: [0, -40]
  })
  return icon
}

function addWaterMarkers() {
  appStore.watersData.forEach(water => {
    const icon = createWaterIcon(water)
    
    const marker = L.marker([water.position[1], water.position[0]], {
      icon: icon,
      title: water.name,
      riseOnHover: true,
      zIndexOffset: 1000
    }).addTo(map)

    marker.bindPopup(`
      <div class="cyber-popup">
        <div class="popup-header">
          <span class="popup-icon">💧</span>
          <h3>${water.name}</h3>
        </div>
        <div class="popup-content">
          <div class="stat-item">
            <span class="stat-label">累计放生</span>
            <span class="stat-value cyan">${water.releaseCount.toLocaleString()} 条</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">生态指数</span>
            <span class="stat-value green">${water.ecologyScore} (良好)</span>
          </div>
        </div>
        <div class="popup-footer">
          <span class="fish-hint">🐟 点击选择放生鱼类</span>
        </div>
      </div>
    `, {
      className: 'cyber-popup-container',
      maxWidth: 280
    })

    marker.bindTooltip(water.name, {
      className: 'cyber-tooltip',
      permanent: false,
      direction: 'top',
      offset: [0, -15]
    })

    marker.on('click', () => {
      appStore.selectWater(water)
      customLocation.value = null
      locationInfo.value = null
      if (clickMarker) {
        map.removeLayer(clickMarker)
        clickMarker = null
      }
      appStore.toggleFishDialog(true)
    })
  })
}

function addClickHandler() {
  map.on('click', (e) => {
    const { originalEvent } = e
    if (originalEvent) {
      const target = originalEvent.target
      if (target.closest('.map-ui-overlay')) {
        return
      }
    }
    const { lat, lng } = e.latlng
    setCustomLocation(lat, lng)
  })
}

async function setCustomLocation(lat, lng) {
  customLocation.value = { 
    lat, 
    lng, 
    name: `自定义地点 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    country: '',
    state: '',
    city: '',
    town: '',
    fullAddress: '',
    locationName: ''
  }
  appStore.selectWater(customLocation.value)
  
  if (clickMarker) {
    map.removeLayer(clickMarker)
  }
  
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="custom-marker-wrapper">
        <div class="custom-pulse"></div>
        <div class="custom-icon">🎯</div>
        <div class="custom-label">放生点</div>
      </div>
    `,
    iconSize: [80, 60],
    iconAnchor: [40, 30],
    popupAnchor: [0, -35]
  })
  
  clickMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
  clickMarker.bindPopup(`
    <div class="cyber-popup">
      <div class="popup-header">
        <span class="popup-icon">🎯</span>
        <h3>自定义放生点</h3>
      </div>
      <div class="popup-content">
        <div class="stat-item">
          <span class="stat-label">坐标</span>
          <span class="stat-value cyan">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
        </div>
      </div>
      <div class="popup-footer">
        <span class="fish-hint">🐟 点击选择放生鱼类</span>
      </div>
    </div>
  `, {
    className: 'cyber-popup-container',
    maxWidth: 280
  })
  
  clickMarker.on('click', () => {
    appStore.toggleFishDialog(true)
  })
  
  await getLocationInfo(lat, lng)
  appStore.toggleFishDialog(true)
}

async function getLocationInfo(lat, lng) {
  isLoadingLocation.value = true
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    const data = await response.json()
    
    if (data && data.address) {
      const address = data.address
      const country = address.country || ''
      const state = address.state || address.province || address.region || ''
      const city = address.city || address.county || address.district || ''
      const town = address.town || address.village || address.suburb || ''
      
      let locationName = ''
      if (city && city !== state) {
        locationName = `${city}`
      } else if (state) {
        locationName = `${state}`
      }
      
      if (country && !locationName.includes(country)) {
        locationName = locationName ? `${country} ${locationName}` : country
      }
      
      locationInfo.value = {
        country,
        state,
        city,
        town,
        fullAddress: data.display_name,
        locationName,
        waterBody: address.water || address.natural === 'water' ? address.natural : null,
        isOcean: !address.country_code || ['us', 'gb', 'au', 'nz'].includes(address.country_code) && !state
      }
      
      if (customLocation.value) {
        customLocation.value.country = country
        customLocation.value.state = state
        customLocation.value.city = city
        customLocation.value.town = town
        customLocation.value.fullAddress = data.display_name
        customLocation.value.locationName = locationName || `自定义地点 (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`
        customLocation.value.name = locationName || `自定义地点 (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`
      }
    } else {
      locationInfo.value = {
        country: '',
        state: '',
        city: '',
        town: '',
        fullAddress: '未知地区',
        locationName: `自定义地点 (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
        waterBody: null,
        isOcean: false
      }
    }
  } catch (error) {
    console.error('获取位置信息失败:', error)
    locationInfo.value = {
      country: '',
      state: '',
      city: '',
      town: '',
      fullAddress: '获取失败',
      locationName: `自定义地点 (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
      waterBody: null,
      isOcean: false
    }
  } finally {
    isLoadingLocation.value = false
  }
}

async function searchLocation() {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  showSearchResults.value = true
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    const data = await response.json()
    searchResults.value = data.map(item => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name,
      type: item.type
    }))
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

async function selectSearchResult(result) {
  map.flyTo([result.lat, result.lng], 12, {
    duration: 1.5
  })
  
  await setCustomLocation(result.lat, result.lng)
  showSearchResults.value = false
  searchQuery.value = ''
}

function clearCustomLocation() {
  customLocation.value = null
  locationInfo.value = null
  if (clickMarker) {
    map.removeLayer(clickMarker)
    clickMarker = null
  }
  appStore.selectWater(null)
}

function addZoomControl() {
  const zoomControl = L.control.zoom({
    position: 'bottomright'
  })
  map.addControl(zoomControl)
}

function addMapOverlay() {
  const overlay = L.divIcon({
    className: 'map-overlay',
    html: `
      <div class="cyber-grid"></div>
      <div class="scan-line"></div>
    `,
    iconSize: [10000, 10000],
    iconAnchor: [5000, 5000]
  })
  
  L.marker([0, 0], { icon: overlay }).addTo(map)
}
</script>

<template>
  <div ref="mapContainer" id="mapContainer" class="w-full h-full relative overflow-hidden">
    <div class="map-glow-overlay"></div>
    
    <div class="map-ui-overlay absolute top-4 right-4 z-[1000] w-80">
      <div class="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg shadow-black/30">
        <div class="flex gap-2">
          <input 
            v-model="searchQuery"
            @keyup.enter="searchLocation"
            type="text"
            placeholder="搜索地点..."
            class="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm"
          />
          <button 
            @click="searchLocation"
            :disabled="isSearching"
            class="px-4 py-2 bg-primary hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {{ isSearching ? '搜索中...' : '搜索' }}
          </button>
        </div>
        
        <div v-if="showSearchResults && searchResults.length > 0" class="mt-2 space-y-1">
          <div 
            v-for="(result, index) in searchResults" 
            :key="index"
            @click="selectSearchResult(result)"
            class="p-2 bg-background/50 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
          >
            <div class="text-white text-sm truncate">{{ result.name.split(',')[0] }}</div>
            <div class="text-gray-400 text-xs truncate">{{ result.name }}</div>
          </div>
        </div>
        
        <div v-if="showSearchResults && searchResults.length === 0 && !isSearching" class="mt-2 p-2 bg-background/50 rounded-lg">
          <div class="text-gray-400 text-sm text-center">未找到相关地点</div>
        </div>
      </div>
    </div>
    
    <div v-if="customLocation" class="map-ui-overlay absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg shadow-black/30 max-w-xs">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xl">🎯</span>
        <div class="flex-1">
          <div class="text-white font-medium text-sm">当前位置</div>
          <div class="text-gray-400 text-xs">自定义放生点</div>
        </div>
        <button 
          @click="clearCustomLocation"
          class="text-gray-400 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div v-if="isLoadingLocation" class="flex items-center gap-2 text-sm text-gray-400">
        <div class="animate-spin">⏳</div>
        <span>正在获取地区信息...</span>
      </div>
      
      <div v-else-if="locationInfo" class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">📍</span>
          <div class="flex-1">
            <div class="text-cyan-400 font-medium text-sm">
              {{ locationInfo.locationName || '未知地区' }}
            </div>
            <div v-if="locationInfo.town" class="text-gray-400 text-xs">
              {{ locationInfo.town }}
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2 text-xs">
          <span class="text-gray-500">坐标:</span>
          <span class="text-gray-300">{{ customLocation.lat.toFixed(4) }}, {{ customLocation.lng.toFixed(4) }}</span>
        </div>
        
        <div v-if="locationInfo.fullAddress" class="text-xs text-gray-500 truncate" :title="locationInfo.fullAddress">
          {{ locationInfo.fullAddress.split(',').slice(0, 3).join(',') }}
        </div>
      </div>
      
      <div v-else class="space-y-2">
        <div class="text-cyan-400 text-sm font-medium">
          📍 {{ customLocation.lat.toFixed(4) }}, {{ customLocation.lng.toFixed(4) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#mapContainer {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #071018 0%, #0a1a2e 50%, #0d2137 100%);
}

.map-glow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  z-index: 1000;
}

:deep(.water-marker-wrapper) {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.water-marker-wrapper:hover) {
  transform: scale(1.15);
  z-index: 1000;
}

:deep(.water-pulse) {
  position: absolute;
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
  transform: translate(-5px, -5px);
}

@keyframes pulse {
  0% {
    transform: translate(-5px, -5px) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-5px, -5px) scale(1.8);
    opacity: 0;
  }
}

:deep(.water-icon) {
  position: relative;
  font-size: 28px;
  width: 40px;
  height: 40px;
  background: linear-gradient(145deg, rgba(10, 30, 50, 0.95), rgba(5, 15, 30, 0.98));
  border: 2px solid rgba(0, 229, 255, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 10px rgba(0, 229, 255, 0.5),
    0 0 20px rgba(0, 229, 255, 0.3),
    0 0 30px rgba(0, 229, 255, 0.2),
    inset 0 0 10px rgba(0, 229, 255, 0.1);
  backdrop-filter: blur(5px);
}

:deep(.water-glow) {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(0, 229, 255, 0.2);
  border-radius: 50%;
  filter: blur(8px);
  transform: translateY(5px);
}

:deep(.water-label) {
  margin-top: 8px;
  padding: 3px 10px;
  background: linear-gradient(145deg, rgba(10, 30, 50, 0.9), rgba(5, 20, 40, 0.95));
  border: 1px solid rgba(0, 229, 255, 0.4);
  border-radius: 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

:deep(.water-count) {
  margin-top: 2px;
  font-size: 10px;
  color: rgba(0, 229, 255, 0.8);
  font-weight: 500;
}

:deep(.custom-marker-wrapper) {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform-origin: center;
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

:deep(.custom-pulse) {
  position: absolute;
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, rgba(255, 165, 0, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: customPulse 2s ease-out infinite;
  transform: translate(-5px, -5px);
}

@keyframes customPulse {
  0% {
    transform: translate(-5px, -5px) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-5px, -5px) scale(1.8);
    opacity: 0;
  }
}

:deep(.custom-icon) {
  position: relative;
  font-size: 28px;
  width: 40px;
  height: 40px;
  background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 100, 0, 0.9));
  border: 2px solid rgba(255, 165, 0, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 15px rgba(255, 165, 0, 0.6),
    0 0 30px rgba(255, 165, 0, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 15px rgba(255, 165, 0, 0.6), 0 0 30px rgba(255, 165, 0, 0.3);
  }
  to {
    box-shadow: 0 0 20px rgba(255, 165, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.5);
  }
}

:deep(.custom-label) {
  margin-top: 8px;
  padding: 3px 10px;
  background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 100, 0, 0.9));
  border: 1px solid rgba(255, 165, 0, 0.6);
  border-radius: 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

:deep(.cyber-popup) {
  background: linear-gradient(145deg, rgba(10, 30, 50, 0.98), rgba(5, 20, 40, 0.99));
  border: 1px solid rgba(0, 229, 255, 0.5);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(0, 229, 255, 0.2),
    0 10px 40px rgba(0, 0, 0, 0.5);
}

:deep(.popup-header) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.1), transparent);
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
}

:deep(.popup-icon) {
  font-size: 24px;
}

:deep(.popup-header h3) {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}

:deep(.popup-content) {
  padding: 12px 16px;
}

:deep(.stat-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
}

:deep(.stat-item:last-child) {
  border-bottom: none;
}

:deep(.stat-label) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

:deep(.stat-value) {
  font-weight: bold;
  font-size: 14px;
}

:deep(.stat-value.cyan) {
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}

:deep(.stat-value.green) {
  color: #4ade80;
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

:deep(.popup-footer) {
  padding: 10px 16px;
  background: rgba(0, 229, 255, 0.05);
}

:deep(.fish-hint) {
  font-size: 12px;
  color: rgba(0, 229, 255, 0.8);
}

:deep(.cyber-popup-container .leaflet-popup-tip) {
  background: linear-gradient(145deg, rgba(10, 30, 50, 0.9), rgba(5, 20, 40, 0.9));
  border-color: rgba(0, 229, 255, 0.5);
}

:deep(.cyber-tooltip) {
  background: linear-gradient(145deg, rgba(10, 30, 50, 0.95), rgba(5, 20, 40, 0.98));
  border: 1px solid rgba(0, 229, 255, 0.4);
  border-radius: 8px;
  padding: 6px 12px;
  color: #fff;
  font-size: 12px;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
}

:deep(.leaflet-control-zoom) {
  background: rgba(10, 30, 50, 0.9) !important;
  border: 11px solid rgba(0, 229, 255, 0.4) !important;
  border-radius: 12px !important;
  overflow: hidden;
}

:deep(.leaflet-control-zoom a) {
  background: transparent !important;
  border: none !important;
  color: #00e5ff !important;
  font-size: 18px !important;
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: rgba(0, 229, 255, 0.2) !important;
}

:deep(.leaflet-control-zoom a:first-child) {
  border-bottom: 1px solid rgba(0, 229, 255, 0.3) !important;
}

:deep(.leaflet-control-scale-line) {
  background: rgba(10, 30, 50, 0.9) !important;
  border: 1px solid rgba(0, 229, 255, 0.4) !important;
  border-radius: 4px;
  color: #00e5ff !important;
  font-size: 11px !important;
}

:deep(.leaflet-control-locationbar) {
  background: rgba(10, 30, 50, 0.9) !important;
  border: 1px solid rgba(0, 229, 255, 0.4) !important;
  border-radius: 4px;
  color: #00e5ff !important;
  font-size: 11px !important;
}

:deep(.map-overlay) {
  pointer-events: none;
}

:deep(.cyber-grid) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 229, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.02) 1px, transparent 1px);
  background-size: 80px 80px;
}

:deep(.scan-line) {
  position: absolute;
  top: -100%;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 229, 255, 0.03) 50%,
    transparent 100%
  );
  animation: scan 12s linear infinite;
}

@keyframes scan {
  0% {
    top: -100%;
  }
  100% {
    top: 200%;
  }
}
</style>
