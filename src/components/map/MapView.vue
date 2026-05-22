<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as mars2d from 'mars2d'
import * as L from 'leaflet'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const mapContainer = ref(null)
let map = null

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
    center: { lng: 0, lat: 20 },
    zoom: 2,
    minZoom: 1,
    maxZoom: 18,
    crs: L.CRS.EPSG3857,
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
}

function addBaseMap() {
  const darkBaseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB',
    maxZoom: 19
  })
  map.addLayer(darkBaseLayer)

  const tiandituLabelLayer = new mars2d.layer.TdtLayer({
    type: 'cia',
    name: '标注',
    opacity: 0.6
  })
  map.addLayer(tiandituLabelLayer)
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
      appStore.toggleFishDialog(true)
    })
  })
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
  background: radial-gradient(ellipse at center, transparent 0%, rgba(7, 16, 24, 0.7) 100%);
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
  border: 1px solid rgba(0, 229, 255, 0.4) !important;
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
