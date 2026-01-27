<template>
  <div class="sysml-editor-container" @click="closeAllPopups" @mousemove="onMouseMove" @mouseup="onMouseUp">
    
    <!-- 주석 -->
    

    <aside class="model-browser" @contextmenu.prevent="showContextMenu($event, null, 'browser')">
      <div class="browser-header">
        <h3>Safety Model Browser</h3>
        <p class="guide">빈 곳 우클릭: Root 추가 / 노드 우클릭: 속성 관리</p>
      </div>
      
      <div class="tree-container">
        <div v-for="node in sortedNodes" :key="node.id" 
             class="tree-node-wrapper" 
             :style="{ paddingLeft: (node.depth * 20) + 'px' }">
          <div class="tree-item" 
               :class="{ selected: selectedNodeId === node.id }" 
               @click.stop="selectNode(node)" 
               @contextmenu.prevent.stop="showContextMenu($event, node, 'node')">
            <span class="icon">{{ node.parentId ? '🔹' : '📦' }}</span>
            <span>{{ node.label }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="diagram-area" @contextmenu.prevent="showContextMenu($event, null, 'canvas')">
      <div class="palette-bar">
        <div class="tool-group">
          <button :class="{active: activeTool === 'select'}" @click="activeTool = 'select'">🖐 Select</button>
          <button :class="{active: activeTool === 'connect'}" @click="activeTool = 'connect'">➡️ Arrow</button>
        </div>
        <div class="info-text" v-if="selectedNode">
          Selected: {{ selectedNode.label }} (P: {{ selectedNode.probability }})
        </div>
      </div>

      <div class="drop-zone" ref="dropZoneRef">
        <svg class="connector-layer">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#2980b9" />
            </marker>
          </defs>
          <line v-for="(conn, idx) in connectors" :key="idx"
            :x1="getAbsoluteCenter(conn.from).x" :y1="getAbsoluteCenter(conn.from).y"
            :x2="getAbsoluteCenter(conn.to).x" :y2="getAbsoluteCenter(conn.to).y"
            stroke="#2980b9" stroke-width="2" marker-end="url(#arrowhead)" />
        </svg>

        <div v-for="node in nodes" :key="node.id" 
             class="diagram-node"
             :class="{ selected: selectedNodeId === node.id, 'is-child': node.parentId }"
             :style="getNodeStyle(node)"
             @mousedown.stop="onNodeMouseDown($event, node)"
             @contextmenu.prevent.stop="showContextMenu($event, node, 'node')">
          <div class="node-header">
            <span class="header-type">«Event»</span>
            <span class="header-prob" v-if="node.probability">{{ node.probability.toExponential(2) }}</span>
          </div>
          <div class="node-body">
            <div class="node-label">{{ node.label }}</div>
            <div class="node-meta">{{ node.pdf }}</div>
          </div>
          <div class="resize-handle" @mousedown.stop="onResizeMouseDown($event, node)"></div>
        </div>
      </div>
    </main>

    <div v-if="contextMenu.visible" 
         class="context-menu" 
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      
      <template v-if="contextMenu.type === 'node'">
        <div class="menu-header">Block Action</div>
        <div class="menu-option" @click.stop="openPropertiesModal">📋 Properties (속성)</div>
        <div class="menu-option" @click.stop="addBlock(contextMenu.targetNode.id)">➕ Add Child Block</div>
        <div class="menu-divider"></div>
        <div class="menu-option delete" @click.stop="deleteBlock">🗑️ Delete</div>
      </template>

      <template v-else>
        <div class="menu-header">Diagram Action</div>
        <div class="menu-option" @click.stop="addBlock(null)">📦 Add Root Block</div>
      </template>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeAllPopups">
      <div class="modal-window">
        <div class="modal-header">
          <h3>Element Properties</h3>
          <button @click="closeAllPopups">✕</button>
        </div>
        <div class="modal-body" v-if="editingNode">
          <div class="form-group">
            <label>ID (Unique)</label>
            <input v-model="editingNode.id" disabled class="read-only" />
          </div>
          <div class="form-group">
            <label>Name (Label)</label>
            <input v-model="editingNode.label" v-focus />
          </div>
           <div class="form-group">
            <label>Description</label>
            <textarea v-model="editingNode.description" rows="2"></textarea>
          </div>
          <hr />
          <div class="form-section-title">Reliability Parameters</div>
          <div class="form-group">
            <label>PDF (Type)</label>
            <select v-model="editingNode.pdf">
              <option value="Exponential">Exponential</option>
              <option value="Weibull">Weibull</option>
              <option value="Fixed">Fixed Probability</option>
            </select>
          </div>
          <div class="form-group">
            <label>Probability (1/h or fixed)</label>
            <input type="number" step="0.0000001" v-model.number="editingNode.probability" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeAllPopups">Close & Save</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const nodes = ref([]);
const connectors = ref([]);
const activeTool = ref('select');
const selectedNodeId = ref(null);
const connectStartId = ref(null);

// UI 상태 관리
const contextMenu = ref({ visible: false, x: 0, y: 0, targetNode: null, type: 'canvas' });
const showModal = ref(false);
const editingNode = ref(null); // 모달에서 편집 중인 노드 데이터

const isDragging = ref(false);
const isResizing = ref(false);
const dragTarget = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

// --- 노드 데이터 관리 ---
const addBlock = (parentId = null) => {
  const newNode = {
    id: `ID_${Date.now().toString(36)}`, // 조금 더 유니크한 ID
    label: parentId ? `Child Event` : `Top Event`,
    description: '',
    // 안전 분석용 데이터 추가
    probability: 1.0e-5,
    pdf: 'Exponential',
    x: parentId ? 20 : 100 + (nodes.value.length * 20),
    y: parentId ? 40 : 100 + (nodes.value.length * 20),
    width: 160,
    height: 100,
    parentId: parentId
  };
  nodes.value.push(newNode);
  closeAllPopups();
};

const deleteBlock = () => {
  const target = contextMenu.value.targetNode;
  if (!target) return;
  
  // 자식 노드 및 연결선 삭제
  nodes.value = nodes.value.filter(n => n.id !== target.id && n.parentId !== target.id);
  connectors.value = connectors.value.filter(c => c.from !== target.id && c.to !== target.id);
  selectedNodeId.value = null;
  closeAllPopups();
  /* 주석 */

};

// --- 상호작용 및 UI 로직 ---

const selectNode = (node) => {
  selectedNodeId.value = node.id;
};

const selectedNode = computed(() => nodes.value.find(n => n.id === selectedNodeId.value));

const showContextMenu = (e, node, type) => {
  e.preventDefault(); // 브라우저 기본 메뉴 차단
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    targetNode: node,
    type: type // 'node' or 'canvas' or 'browser'
  };
  
  if (node) {
    selectNode(node);
  }
};

const openPropertiesModal = () => {
  if (contextMenu.value.targetNode) {
    editingNode.value = contextMenu.value.targetNode; // 참조 전달 (즉시 반영됨)
    showModal.value = true;
    contextMenu.value.visible = false; // 메뉴는 닫음
  }
};

const closeAllPopups = () => {
  contextMenu.value.visible = false;
  showModal.value = false;
  editingNode.value = null;
};

// --- 드래그 앤 드롭 로직 (기존 유지 및 최적화) ---
const getNodeStyle = (node) => {
  let x = node.x; let y = node.y;
  if (node.parentId) {
    const p = nodes.value.find(n => n.id === node.parentId);
    if (p) { x += p.x; y += p.y; }
  }
  return {
    transform: `translate(${x}px, ${y}px)`, // transform 사용이 성능상 더 좋음
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
  selectNode(node);
  
  // 우클릭이면 드래그 시작 안함
  if (e.button === 2) return; 

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
      // 중복 연결 방지
      const exists = connectors.value.some(c => c.from === connectStartId.value && c.to === id);
      if (!exists) {
        connectors.value.push({ from: connectStartId.value, to: id });
      }
      activeTool.value = 'select'; 
    }
    connectStartId.value = null;
  }
};

const onResizeMouseDown = (e, node) => {
  if (e.button === 2) return;
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
    dragTarget.value.width = Math.max(100, dragOffset.value.w + dx);
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
.sysml-editor-container { display: flex; height: 90vh; background: #eaeff2; overflow: hidden; user-select: none; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

/* Browser Style */
.model-browser { width: 260px; background: #fff; border-right: 1px solid #ccc; display: flex; flex-direction: column; }
.browser-header { padding: 15px; background: #f8f9fa; border-bottom: 1px solid #eee; }
.browser-header h3 { margin: 0 0 5px 0; font-size: 16px; color: #2c3e50; }
.guide { font-size: 11px; color: #7f8c8d; margin: 0; }
.tree-container { flex: 1; overflow-y: auto; padding: 10px; }
.tree-item { padding: 6px 8px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; font-size: 13px; color: #333; }
.tree-item:hover { background: #f1f3f5; }
.tree-item.selected { background: #e7f5ff; color: #1976d2; font-weight: 600; }
.icon { margin-right: 6px; font-size: 14px; }

/* Diagram Area */
.diagram-area { flex: 1; display: flex; flex-direction: column; position: relative; }
.palette-bar { background: #fff; border-bottom: 1px solid #ddd; padding: 8px 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.05); z-index: 100; }
.tool-group { display: flex; gap: 8px; }
.palette-bar button { padding: 6px 12px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc; background: #fff; font-size: 13px; transition: all 0.2s; }
.palette-bar button:hover { background: #f0f0f0; }
.palette-bar button.active { background: #3498db; color: white; border-color: #2980b9; }
.info-text { font-size: 12px; color: #666; font-family: monospace; }

.drop-zone { flex: 1; position: relative; background-image: radial-gradient(#ccc 1px, transparent 1px); background-size: 20px 20px; overflow: hidden; }
.connector-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }

/* Diagram Node (Medini Style) */
.diagram-node { 
  position: absolute; 
  background: white; 
  border: 1px solid #34495e; 
  border-radius: 2px;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; 
  cursor: default; 
  z-index: 10;
  overflow: hidden;
}
.diagram-node.selected { border: 2px solid #3498db; box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); }
.diagram-node.is-child { border-style: dashed; }

.node-header { 
  background: linear-gradient(to bottom, #fefefe, #f0f0f0); 
  border-bottom: 1px solid #ddd; 
  padding: 4px 8px; 
  font-size: 11px; color: #555; 
  display: flex; justify-content: space-between; align-items: center;
  pointer-events: none;
}
.header-prob { font-family: monospace; color: #c0392b; font-weight: bold; }

.node-body { flex: 1; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.node-label { font-weight: bold; font-size: 13px; color: #2c3e50; text-align: center; margin-bottom: 4px; }
.node-meta { font-size: 10px; color: #7f8c8d; font-family: monospace; }

.resize-handle { 
  position: absolute; width: 10px; height: 10px; 
  right: 1px; bottom: 1px; cursor: nwse-resize; 
  background: linear-gradient(135deg, transparent 50%, #7f8c8d 50%);
  opacity: 0.5; pointer-events: auto;
}

/* Context Menu */
.context-menu { 
  position: fixed; background: white; 
  border: 1px solid #c8c8c8; box-shadow: 3px 3px 10px rgba(0,0,0,0.15); 
  z-index: 2000; padding: 4px 0; min-width: 160px; border-radius: 2px;
}
.menu-header { padding: 4px 12px; font-size: 11px; color: #aaa; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #eee; margin-bottom: 4px; }
.menu-option { padding: 6px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.menu-option:hover { background: #3498db; color: white; }
.menu-option.delete:hover { background: #e74c3c; }
.menu-divider { height: 1px; background: #eee; margin: 4px 0; }

/* Properties Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.3); z-index: 3000;
  display: flex; align-items: center; justify-content: center;
}
.modal-window {
  background: white; width: 350px; border-radius: 4px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  display: flex; flex-direction: column;
}
.modal-header {
  padding: 12px 15px; border-bottom: 1px solid #eee;
  display: flex; justify-content: space-between; align-items: center;
  background: #f8f9fa; border-radius: 4px 4px 0 0;
}
.modal-header h3 { margin: 0; font-size: 14px; color: #333; }
.modal-header button { background: none; border: none; font-size: 16px; cursor: pointer; color: #888; }

.modal-body { padding: 15px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 11px; font-weight: bold; color: #666; margin-bottom: 4px; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; box-sizing: border-box; padding: 6px;
  border: 1px solid #ddd; border-radius: 3px; font-size: 13px;
}
.form-group textarea { resize: vertical; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3498db; outline: none; }
.read-only { background: #eee; color: #888; }
.form-section-title { font-size: 11px; color: #3498db; font-weight: bold; margin: 15px 0 8px 0; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 4px; }

.modal-footer { padding: 10px 15px; background: #f8f9fa; border-top: 1px solid #eee; text-align: right; border-radius: 0 0 4px 4px; }
.btn-primary { background: #3498db; color: white; border: none; padding: 6px 14px; border-radius: 3px; cursor: pointer; font-size: 13px; font-weight: bold; }
.btn-primary:hover { background: #2980b9; }
</style>