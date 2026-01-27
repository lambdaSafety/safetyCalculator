<template>
  <div class="sysml-editor-container" @click="closeContextMenu" @mousemove="onMouseMove" @mouseup="onMouseUp">
    
    <aside class="model-browser" @contextmenu.prevent="showContextMenu($event, null)">
      <div class="browser-header">
        <h3>Model Browser</h3>
        <p class="guide">빈 곳/노드 우클릭: Block 추가</p>
      </div>
      
      <div class="tree-container">
        <div v-for="node in sortedNodes" :key="node.id" 
             class="tree-node-wrapper" 
             :style="{ paddingLeft: (node.depth * 20) + 'px' }">
          <div class="tree-item" 
               :class="{ selected: selectedNodeId === node.id }" 
               @click.stop="selectedNodeId = node.id" 
               @contextmenu.prevent.stop="showContextMenu($event, node.id)">
            <span class="icon">{{ node.parentId ? '🔹' : '📦' }}</span>
            <input v-if="editingId === node.id" v-model="node.label" @blur="editingId = null" @keyup.enter="editingId = null" v-focus class="name-input" />
            <span v-else @dblclick="editingId = node.id">{{ node.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="contextMenu.visible" 
           class="context-menu" 
           :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
        <div class="menu-option" @click.stop="addBlock(contextMenu.targetId)">
          {{ contextMenu.targetId ? 'Add Sub-Block (Child)' : 'Add Root Block' }}
        </div>
        <div v-if="contextMenu.targetId" class="menu-option delete" @click.stop="deleteBlock">
          Delete Block
        </div>
      </div>
    </aside>

    <main class="diagram-area">
      <div class="palette-bar">
        <button :class="{active: activeTool === 'select'}" @click="activeTool = 'select'">🖐 Select (이동/크기)</button>
        <button :class="{active: activeTool === 'connect'}" @click="activeTool = 'connect'">➡️ Arrow (연결)</button>
      </div>

      <div class="drop-zone" ref="dropZoneRef">
        <svg class="connector-layer">
          <line v-for="(conn, idx) in connectors" :key="idx"
            :x1="getAbsoluteCenter(conn.from).x" :y1="getAbsoluteCenter(conn.from).y"
            :x2="getAbsoluteCenter(conn.to).x" :y2="getAbsoluteCenter(conn.to).y"
            stroke="#2980b9" stroke-width="2" marker-end="url(#arrowhead)" />
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#2980b9" />
            </marker>
          </defs>
        </svg>

        <div v-for="node in nodes" :key="node.id" 
             class="diagram-node"
             :class="{ selected: selectedNodeId === node.id, 'is-child': node.parentId }"
             :style="getNodeStyle(node)"
             @mousedown.stop="onNodeMouseDown($event, node)">
          <div class="node-header">«block»</div>
          <div class="node-label">{{ node.label }}</div>
          <div class="resize-handle" @mousedown.stop="onResizeMouseDown($event, node)"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const nodes = ref([]);
const connectors = ref([]);
const activeTool = ref('select');
const selectedNodeId = ref(null);
const editingId = ref(null);
const contextMenu = ref({ visible: false, x: 0, y: 0, targetId: null });

const isDragging = ref(false);
const isResizing = ref(false);
const dragTarget = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

// --- 노드 추가 및 삭제 로직 (핵심) ---
const addBlock = (parentId = null) => {
  const newNode = {
    id: `node_${Date.now()}`,
    label: parentId ? `Child_${nodes.value.length}` : `Root_${nodes.value.length}`,
    x: parentId ? 20 : 50 + (nodes.value.length * 15),
    y: parentId ? 40 : 50 + (nodes.value.length * 15),
    width: 150,
    height: 100,
    parentId: parentId
  };
  nodes.value.push(newNode);
  console.log("Block Added:", newNode);
  closeContextMenu();
};

const deleteBlock = () => {
  const tid = contextMenu.value.targetId;
  nodes.value = nodes.value.filter(n => n.id !== tid && n.parentId !== tid);
  connectors.value = connectors.value.filter(c => c.from !== tid && c.to !== tid);
  closeContextMenu();
};

// --- 컨텍스트 메뉴 제어 ---
const showContextMenu = (e, id) => {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    targetId: id
  };
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

// --- 렌더링 및 드래그 로직 (이전 수정사항 포함) ---
const getNodeStyle = (node) => {
  let x = node.x; let y = node.y;
  if (node.parentId) {
    const p = nodes.value.find(n => n.id === node.parentId);
    if (p) { x += p.x; y += p.y; }
  }
  return {
    left: x + 'px', top: y + 'px',
    width: node.width + 'px', height: node.height + 'px',
    zIndex: node.parentId ? 20 : 10
  };
};

const getAbsoluteCenter = (id) => {
  const n = nodes.value.find(node => node.id === id);
  if (!n) return { x: 0, y: 0 };
  let x = n.x; let y = n.y;
  if (n.parentId) {
    const p = nodes.value.find(node => node.id === n.parentId);
    if (p) { x += p.x; y += p.y; }
  }
  return { x: x + n.width / 2, y: y + n.height / 2 };
};

const onNodeMouseDown = (e, node) => {
  selectedNodeId.value = node.id;
  if (activeTool.value === 'connect') {
    handleConnection(node.id);
  } else {
    isDragging.value = true;
    dragTarget.value = node;
    dragOffset.value = { x: e.clientX - node.x, y: e.clientY - node.y };
  }
};

const handleConnection = (id) => {
  if (!connectStartId.value) {
    connectStartId.value = id;
  } else {
    if (connectStartId.value !== id) {
      connectors.value.push({ from: connectStartId.value, to: id });
      activeTool.value = 'select'; // 연결 후 자동 전환
    }
    connectStartId.value = null;
  }
};
const connectStartId = ref(null);

const onResizeMouseDown = (e, node) => {
  isResizing.value = true;
  dragTarget.value = node;
  dragOffset.value = { x: e.clientX, y: e.clientY, w: node.width, h: node.height };
};

const onMouseMove = (e) => {
  if (!dragTarget.value) return;
  if (isDragging.value) {
    dragTarget.value.x = e.clientX - dragOffset.value.x;
    dragTarget.value.y = e.clientY - dragOffset.value.y;
  } else if (isResizing.value) {
    const dx = e.clientX - dragOffset.value.x;
    const dy = e.clientY - dragOffset.value.y;
    dragTarget.value.width = Math.max(80, dragOffset.value.w + dx);
    dragTarget.value.height = Math.max(60, dragOffset.value.h + dy);
  }
};

const onMouseUp = () => {
  isDragging.value = false;
  isResizing.value = false;
  dragTarget.value = null;
};

const sortedNodes = computed(() => {
  const result = [];
  const build = (pid, depth) => {
    nodes.value.filter(n => n.parentId === pid).forEach(n => {
      result.push({ ...n, depth });
      build(n.id, depth + 1);
    });
  };
  build(null, 0);
  return result;
});

const vFocus = { mounted: (el) => el.focus() };
</script>

<style scoped>
/* 이전 스타일 동일 */
.sysml-editor-container { display: flex; height: 90vh; background: #f4f7f6; overflow: hidden; user-select: none; }
.model-browser { width: 250px; background: #fff; border-right: 2px solid #ddd; padding: 15px; flex-shrink: 0; position: relative; }
.browser-header h3 { margin: 0; }
.guide { font-size: 11px; color: #888; margin-bottom: 10px; }
.tree-container { height: 100%; overflow-y: auto; }
.tree-item { padding: 6px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; }
.tree-item:hover { background: #f0f0f0; }
.tree-item.selected { background: #e3f2fd; color: #1976d2; font-weight: bold; }
.name-input { width: 100%; border: 1px solid #1976d2; }

.diagram-area { flex: 1; display: flex; flex-direction: column; position: relative; }
.palette-bar { background: #2c3e50; padding: 10px; display: flex; gap: 10px; z-index: 100; }
.palette-bar button { padding: 6px 12px; cursor: pointer; border-radius: 4px; border: none; font-weight: bold; }
.palette-bar button.active { background: #3498db; color: white; }

.drop-zone { flex: 1; position: relative; background: #fff; overflow: hidden; }
.connector-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }

.diagram-node { 
  position: absolute; border: 2px solid #34495e; background: white; 
  display: flex; flex-direction: column; cursor: move; box-sizing: border-box; z-index: 10;
}
.diagram-node.is-child { border-style: dashed; border-color: #95a5a6; }
.node-header { font-size: 10px; background: #34495e; color: white; text-align: center; padding: 2px; pointer-events: none; }
.node-label { flex: 1; display: flex; align-items: center; justify-content: center; font-weight: bold; pointer-events: none; }

.resize-handle { 
  position: absolute; width: 12px; height: 12px; background: #34495e; 
  right: 0; bottom: 0; cursor: nwse-resize; z-index: 20;
}

.context-menu { 
  position: fixed; background: white; border: 1px solid #ccc; 
  box-shadow: 2px 2px 8px rgba(0,0,0,0.15); z-index: 2000; padding: 5px 0; min-width: 150px; 
}
.menu-option { padding: 10px 15px; font-size: 13px; cursor: pointer; }
.menu-option:hover { background: #3498db; color: white; }
</style>
