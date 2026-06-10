<template>
  <div 
    :class="[
      isFullscreen 
        ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none' 
        : 'relative w-full h-[650px] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg'
    ]"
    class="overflow-hidden select-none cursor-grab active:cursor-grabbing mindmap-canvas transition-all duration-300"
    @mousedown="startPan"
    @mousemove="doPan"
    @mouseup="endPan"
    @mouseleave="endPan"
    @wheel="handleZoom"
  >
    <!-- Zoom & Layout Controls -->
    <div class="absolute left-6 top-6 z-20 flex flex-col gap-2 bg-slate-900/90 border border-slate-700/60 p-2 rounded-2xl shadow-xl backdrop-blur">
      <button @click="centerTree" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer" title="Recenter / Fit">
        <Maximize class="w-4 h-4" />
      </button>
      <button @click="zoomIn" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border-t border-slate-800/80" title="Zoom In">
        <Plus class="w-4 h-4" />
      </button>
      <button @click="zoomOut" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border-t border-slate-800/80" title="Zoom Out">
        <Minus class="w-4 h-4" />
      </button>
      <button @click="toggleFullscreen" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border-t border-slate-800/80" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
        <Minimize2 v-if="isFullscreen" class="w-4 h-4" />
        <Maximize2 v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Drag & Zoom Canvas Container -->
    <div 
      class="absolute origin-left transition-transform duration-200 ease-out"
      :style="{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }"
    >
      <!-- SVG Connecting Paths -->
      <svg class="absolute inset-0 overflow-visible pointer-events-none" style="width: 2500px; height: 2500px;">
        <g>
          <path
            v-for="c in mindmapLayout.connections"
            :key="c.id"
            :d="getBezierPath(c, c.fromType)"
            fill="none"
            :stroke="isConnectionHighlighted(c) ? '#818cf8' : '#334155'"
            :stroke-width="isConnectionHighlighted(c) ? (hoveredNodeId ? '3' : '2') : '1'"
            stroke-linecap="round"
            class="transition-all duration-300"
            :class="[
              hoveredNodeId ? (isConnectionHighlighted(c) ? 'opacity-100 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'opacity-15') : 'opacity-60'
            ]"
          />
        </g>
      </svg>

      <!-- Node HTML Cards (Flat DOM structure positioned dynamically to avoid deep nesting issues) -->
      <div class="absolute inset-0 pointer-events-none" style="width: 2500px; height: 2500px;">
        <div
          v-for="node in mindmapLayout.nodes"
          :key="node.id"
          class="absolute pointer-events-auto transition-all duration-300 ease-out"
          :style="{ left: `${node.x}px`, top: `${node.y - node.cardHeight / 2}px` }"
          :class="[
            hoveredNodeId ? (isNodeRelated(node.id) ? 'opacity-100 scale-102 z-10' : 'opacity-30 scale-98') : 'opacity-100'
          ]"
          @mouseenter="hoveredNodeId = node.id"
          @mouseleave="hoveredNodeId = null"
        >
          <!-- 1. ROOT NODE -->
          <div 
            v-if="node.type === 'Root'"
            class="w-[180px] h-[60px] bg-indigo-900 border border-indigo-700/80 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between shadow-indigo-950/40 relative"
          >
            <div class="min-w-0">
              <span class="text-[9px] uppercase font-bold tracking-wider opacity-60">System Root</span>
              <h3 class="font-black text-sm tracking-tight truncate">{{ node.name }}</h3>
            </div>
            <Tag class="w-4 h-4 opacity-80 shrink-0 ml-2 text-indigo-300" />

            <!-- Collapse / Expand Trigger -->
            <button
              v-if="node.hasChildren"
              @click.stop="toggleCollapse(node.id)"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 hover:scale-110 flex items-center justify-center shadow-lg cursor-pointer font-bold text-xs transition-all duration-200"
              :title="node.isCollapsed ? 'Expand Children' : 'Collapse Children'"
            >
              {{ node.isCollapsed ? '+' : '-' }}
            </button>
          </div>

          <!-- 2. SCHOLARSHIP NODE -->
          <div 
            v-else-if="node.type === 'Scholarship'"
            class="w-[180px] h-[65px] bg-emerald-950/90 border border-emerald-800 text-emerald-300 px-4 py-2 rounded-xl shadow flex flex-col justify-center border-l-4 relative hover:border-emerald-500 transition-colors"
          >
            <span class="text-[8px] uppercase font-bold tracking-wider opacity-65">Scholarship Plan</span>
            <h4 class="font-bold text-[11px] leading-tight truncate" :title="node.name">{{ node.name }}</h4>
            <div class="flex items-center gap-1.5 mt-0.5 text-[9px] opacity-75">
              <span class="capitalize">{{ node.study_type || 'Plan' }}</span>
              <span v-if="node.price" class="font-mono text-emerald-400">{{ node.price.toLocaleString() }} EGP</span>
            </div>
          </div>

          <!-- 3. STANDARD RULE NODE (Grade, Paper, Payment Method) -->
          <div 
            v-else
            :class="ruleNodeClass(node.type)"
            class="w-[220px] h-[90px] bg-slate-900/95 border border-slate-750 text-slate-100 px-4 py-2 rounded-2xl shadow-lg flex items-center justify-between border-l-4 group/node hover:border-slate-500 transition-all relative"
          >
            <div class="min-w-0 pr-2 space-y-0.5">
              <div class="flex items-center gap-1.5">
                <span :class="typeBadgeClass(node.type)" class="px-1.5 py-0.25 rounded text-[8px] font-extrabold uppercase tracking-wide">
                  {{ node.type }}
                </span>
                <span :class="modifierBadgeClass(node.modifier)" class="px-1.5 py-0.25 rounded text-[8px] font-extrabold capitalize">
                  {{ node.modifier }}
                </span>
              </div>
              <h4 class="font-bold text-[12px] text-white truncate" :title="node.name">{{ node.name }}</h4>
              <div class="text-[10px] text-slate-400 font-bold font-mono">
                {{ formatAmount(node.amount, node.amount_type) }}
              </div>
            </div>
            
            <div class="flex flex-col items-end gap-1.5 shrink-0">
              <span
                :class="node.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-550'"
                class="px-1.5 py-0.25 rounded text-[8px] font-bold"
              >
                {{ node.is_active ? 'Active' : 'Inactive' }}
              </span>
              <button
                @click.stop="$emit('edit-node', node.rawItem)"
                class="p-1 rounded bg-slate-850 border border-slate-700 text-slate-400 hover:text-indigo-400 hover:bg-slate-750 transition-all cursor-pointer"
                title="Edit Setting"
              >
                <Pencil class="w-3 h-3" />
              </button>
            </div>

            <!-- Collapse / Expand Trigger -->
            <button
              v-if="node.hasChildren"
              @click.stop="toggleCollapse(node.id)"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 hover:scale-110 flex items-center justify-center shadow-lg cursor-pointer font-bold text-xs transition-all duration-200"
              :title="node.isCollapsed ? 'Expand Children' : 'Collapse Children'"
            >
              {{ node.isCollapsed ? '+' : '-' }}
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Tag, Pencil, Maximize, Plus, Minus, Maximize2, Minimize2 } from 'lucide-vue-next'

const props = defineProps({
  treeData: {
    type: Object,
    required: true
  },
  formatAmount: {
    type: Function,
    required: true
  },
  formatScholarshipName: {
    type: Function,
    required: true
  },
  typeBadgeClass: {
    type: Function,
    required: true
  },
  modifierBadgeClass: {
    type: Function,
    required: true
  },
  ruleNodeClass: {
    type: Function,
    required: true
  }
})

defineEmits(['edit-node'])

// Canvas zoom/pan state
const scale = ref(0.8)
const offsetX = ref(60)
const offsetY = ref(50)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const collapsedNodes = ref(new Set())
const hoveredNodeId = ref(null)
const isFullscreen = ref(false)

const toggleCollapse = (nodeId) => {
  if (collapsedNodes.value.has(nodeId)) {
    collapsedNodes.value.delete(nodeId)
  } else {
    collapsedNodes.value.add(nodeId)
  }
  collapsedNodes.value = new Set(collapsedNodes.value)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => {
    centerTree()
  }, 100)
}

// Escape key listener to exit full screen
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
    centerTree()
  }
}

watch(isFullscreen, (val) => {
  if (val) {
    window.addEventListener('keydown', handleKeyDown)
  } else {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

// Node sizing constants (avoids node overlapping on big datasets)
const getNodeBaseHeight = (node) => {
  if (node.type === 'Root') return 80
  if (node.type === 'Scholarship') return 85
  return 120 // standard rule height + safety gap
}

const getNodeCardHeight = (type) => {
  if (type === 'Root') return 60
  if (type === 'Scholarship') return 65
  return 90
}

const getNodeWidth = (type) => {
  if (type === 'Root') return 180
  if (type === 'Scholarship') return 180
  return 220
}

const mindmapLayout = computed(() => {
  const root = props.treeData
  if (!root) return { nodes: [], connections: [], parentMap: {} }

  const parentMapLocal = {}

  // 1. Compute heights dynamically based on node sizes
  const computeSubtreeHeight = (node) => {
    const base = getNodeBaseHeight(node)
    
    // Treat collapsed nodes as leaves (no visible subtree height)
    if (collapsedNodes.value.has(node.id) || !node.children || node.children.length === 0) {
      node.height = base
      return node.height
    }

    let height = 0
    node.children.forEach(c => {
      height += computeSubtreeHeight(c)
    })
    node.height = Math.max(base, height)
    return node.height
  }

  computeSubtreeHeight(root)

  const nodes = []
  const connections = []

  // 2. Assign coordinates recursively
  const assignCoordinates = (node, x, yStart) => {
    const nodeHeight = node.height
    const yCenter = yStart + nodeHeight / 2
    
    const hasChildren = node.children && node.children.length > 0
    const isCollapsed = collapsedNodes.value.has(node.id)

    nodes.push({
      id: node.id,
      name: node.name,
      type: node.type,
      modifier: node.modifier,
      amount: node.amount,
      amount_type: node.amount_type,
      is_active: node.is_active,
      study_type: node.study_type,
      price: node.price,
      rawItem: node.rawItem,
      x: x,
      y: yCenter,
      cardHeight: getNodeCardHeight(node.type),
      hasChildren,
      isCollapsed
    })

    // Skip children coordinate calculation if collapsed
    if (isCollapsed) return

    let currentY = yStart
    node.children.forEach(c => {
      const childYCenter = currentY + c.height / 2
      
      // Link child to parent in our parent map
      parentMapLocal[c.id] = node.id
      
      connections.push({
        id: `${node.id}->${c.id}`,
        fromId: node.id,
        toId: c.id,
        fromX: x,
        fromY: yCenter,
        fromType: node.type,
        toX: x + 280,
        toY: childYCenter
      })
      assignCoordinates(c, x + 280, currentY)
      currentY += c.height
    })
  }

  assignCoordinates(root, 50, 50)
  return { nodes, connections, parentMap: parentMapLocal }
})

// Highlighting logic to find if a node/connection lies along the active path
const isNodeRelated = (nodeId) => {
  const hovered = hoveredNodeId.value
  if (!hovered) return true
  if (hovered === nodeId) return true

  const pMap = mindmapLayout.value.parentMap

  // 1. Is nodeId an ancestor of the hovered node?
  let current = hovered
  while (current) {
    if (current === nodeId) return true
    current = pMap[current]
  }

  // 2. Is nodeId a descendant of the hovered node?
  current = nodeId
  while (current) {
    if (current === hovered) return true
    current = pMap[current]
  }

  return false
}

const isConnectionHighlighted = (c) => {
  const hovered = hoveredNodeId.value
  if (!hovered) return true

  const pMap = mindmapLayout.value.parentMap

  // Highlight if connection target is an ancestor of the hovered node
  let current = hovered
  while (current) {
    if (current === c.toId) return true
    current = pMap[current]
  }

  // Highlight if connection source is the hovered node or a descendant of it
  current = c.fromId
  while (current) {
    if (current === hovered) return true
    current = pMap[current]
  }

  return false
}

// Panning and zoom handling
const startPan = (e) => {
  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return
  isDragging.value = true
  dragStart.value = { x: e.clientX - offsetX.value, y: e.clientY - offsetY.value }
}

const doPan = (e) => {
  if (!isDragging.value) return
  offsetX.value = e.clientX - dragStart.value.x
  offsetY.value = e.clientY - dragStart.value.y
}

const endPan = () => {
  isDragging.value = false
}

const handleZoom = (e) => {
  e.preventDefault()
  const zoomFactor = 0.05
  if (e.deltaY < 0) {
    scale.value = Math.min(2, scale.value + zoomFactor)
  } else {
    scale.value = Math.max(0.4, scale.value - zoomFactor)
  }
}

const zoomIn = () => {
  scale.value = Math.min(2, scale.value + 0.1)
}

const zoomOut = () => {
  scale.value = Math.max(0.4, scale.value - 0.1)
}

const centerTree = () => {
  const layout = mindmapLayout.value
  const root = props.treeData
  if (!root) return
  const height = root.height || 600
  scale.value = isFullscreen.value ? 0.95 : 0.8
  offsetX.value = 60
  const containerHeight = isFullscreen.value ? window.innerHeight : 650
  offsetY.value = containerHeight / 2 - (50 + height / 2) * scale.value
}

const hasInitializedCollapse = ref(false)

const initializeDefaultCollapse = () => {
  const root = props.treeData
  if (!root || !root.children || root.children.length === 0) return
  if (hasInitializedCollapse.value) return
  
  const newCollapsed = new Set()
  root.children.forEach(c => {
    newCollapsed.add(c.id)
  })
  collapsedNodes.value = newCollapsed
  hasInitializedCollapse.value = true
}

// Recenter when treeData changes (e.g. data is loaded or collapse toggles layout)
watch(() => props.treeData, () => {
  initializeDefaultCollapse()
  nextTick(() => {
    centerTree()
  })
}, { deep: false })

onMounted(() => {
  initializeDefaultCollapse()
  nextTick(() => {
    centerTree()
  })
})

const getBezierPath = (c, fromType) => {
  const fromOffset = getNodeWidth(fromType)
  const startX = c.fromX + fromOffset
  const startY = c.fromY
  const endX = c.toX
  const endY = c.toY
  
  const controlX1 = startX + 50
  const controlX2 = endX - 50

  return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`
}

const ruleNodeClass = (type) => {
  switch (type) {
    case 'Grade':
      return 'border-l-purple-500 hover:border-purple-400'
    case 'Paper':
      return 'border-l-amber-500 hover:border-amber-400'
    case 'Payment Method':
      return 'border-l-blue-500 hover:border-blue-400'
    default:
      return 'border-l-indigo-500 hover:border-indigo-400'
  }
}
</script>

<style scoped>
.mindmap-canvas {
  background-color: #0b0f19;
  background-image: 
    radial-gradient(#1e293b 1.2px, transparent 1.2px), 
    radial-gradient(#1e293b 1.2px, transparent 1.2px);
  background-size: 24px 24px;
  background-position: 0 0, 12px 12px;
}

/* Smooth transformations and card hover highlight scales */
.scale-102 {
  transform: scale(1.025);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5);
}
.scale-98 {
  transform: scale(0.975);
}
</style>
