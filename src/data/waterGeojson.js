export const waterFeatures = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '长江', type: 'river', color: '#00e5ff', glow: true },
      geometry: {
        type: 'LineString',
        coordinates: [
          [94.5, 32.5],
          [97.0, 30.5],
          [99.5, 29.5],
          [102.0, 28.5],
          [104.0, 28.0],
          [106.0, 28.0],
          [108.0, 28.5],
          [110.0, 29.0],
          [112.0, 30.0],
          [114.0, 30.5],
          [116.0, 31.0],
          [118.0, 31.5],
          [120.0, 31.0],
          [121.5, 30.5],
          [122.5, 30.0]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: '黄河', type: 'river', color: '#00d4ff', glow: true },
      geometry: {
        type: 'LineString',
        coordinates: [
          [96.0, 35.5],
          [98.0, 36.0],
          [100.0, 37.0],
          [102.0, 37.5],
          [104.0, 37.5],
          [106.0, 37.0],
          [108.0, 36.5],
          [110.0, 36.0],
          [112.0, 35.5],
          [114.0, 35.0],
          [116.0, 34.0],
          [117.0, 33.5],
          [118.0, 34.0],
          [119.0, 37.5]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: '亚马逊河', type: 'river', color: '#00e5ff', glow: true },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.5, 1.5],
          [-70.0, -3.0],
          [-65.0, -5.0],
          [-60.0, -3.0],
          [-52.0, 1.0]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: '尼罗河', type: 'river', color: '#00e5ff', glow: true },
      geometry: {
        type: 'LineString',
        coordinates: [
          [31.0, 31.0],
          [31.5, 27.0],
          [32.0, 24.0],
          [33.0, 19.0],
          [34.0, 10.0],
          [33.0, 2.0],
          [33.5, -2.0]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: '密西西比河', type: 'river', color: '#00d4ff', glow: true },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-95.0, 48.0],
          [-95.0, 44.0],
          [-94.0, 40.0],
          [-91.0, 35.0],
          [-90.0, 32.0],
          [-89.0, 29.0],
          [-88.0, 29.2]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: '湄公河', type: 'river', color: '#00e5ff', glow: true },
      geometry: {
        type: 'LineString',
        coordinates: [
          [101.0, 34.0],
          [100.0, 32.0],
          [99.5, 28.0],
          [100.5, 22.0],
          [103.0, 18.5],
          [105.5, 15.0],
          [106.5, 10.0]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: '恒河', type: 'river', color: '#00d4ff', glow: false },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.0, 35.0],
          [79.0, 30.0],
          [80.0, 25.0],
          [81.0, 22.0],
          [84.0, 20.0],
          [88.0, 22.0],
          [90.5, 22.0]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: '太平洋', type: 'ocean', color: '#0066cc', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-180, 65],
          [-180, 0],
          [-180, -60],
          [-120, -60],
          [-80, -20],
          [0, 0],
          [80, 20],
          [140, 50],
          [180, 60],
          [180, 65],
          [-180, 65]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '大西洋', type: 'ocean', color: '#0088bb', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80, 50],
          [-60, 40],
          [-40, 30],
          [-20, 10],
          [-10, 0],
          [-20, -20],
          [-40, -40],
          [-70, -50],
          [-80, -40],
          [-80, 0],
          [-70, 30],
          [-80, 50]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '印度洋', type: 'ocean', color: '#0099aa', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [20, 30],
          [40, 25],
          [60, 20],
          [80, 10],
          [100, 0],
          [110, -20],
          [90, -40],
          [50, -40],
          [40, -30],
          [30, -20],
          [20, 0],
          [20, 30]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '北冰洋', type: 'ocean', color: '#4a90a4', glow: false },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-180, 65],
          [-150, 70],
          [-100, 75],
          [-50, 75],
          [0, 72],
          [50, 75],
          [100, 75],
          [150, 72],
          [180, 65],
          [180, 65],
          [-180, 65]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '地中海', type: 'sea', color: '#00a8cc', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5, 43],
          [0, 36],
          [10, 35],
          [20, 37],
          [25, 35],
          [30, 31],
          [25, 30],
          [15, 30],
          [10, 32],
          [0, 37],
          [-5, 40],
          [-5, 43]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '黑海', type: 'sea', color: '#0088aa', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [27, 47],
          [30, 44],
          [35, 42],
          [40, 42],
          [42, 45],
          [38, 47],
          [33, 47],
          [27, 47]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '里海', type: 'sea', color: '#007799', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [46, 47],
          [50, 45],
          [54, 43],
          [54, 37],
          [50, 36],
          [46, 37],
          [46, 47]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '波罗的海', type: 'sea', color: '#006688', glow: false },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9, 55],
          [12, 56],
          [20, 56],
          [25, 55],
          [28, 55],
          [30, 58],
          [25, 60],
          [20, 60],
          [15, 58],
          [10, 56],
          [9, 55]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '贝加尔湖', type: 'lake', color: '#00e5ff', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [104.5, 55.5],
          [108.5, 55.5],
          [109.5, 53.5],
          [108.5, 52.0],
          [104.5, 52.0],
          [104.5, 55.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '五大湖', type: 'lake', color: '#00d4ff', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-92.5, 49.5],
          [-84.0, 49.0],
          [-82.0, 42.0],
          [-80.0, 41.5],
          [-85.0, 45.0],
          [-92.5, 49.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '维多利亚湖', type: 'lake', color: '#00e5ff', glow: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [32.0, -0.5],
          [34.0, -0.5],
          [34.0, -3.5],
          [32.5, -4.0],
          [32.0, -2.0],
          [32.0, -0.5]
        ]]
      }
    }
  ]
}
