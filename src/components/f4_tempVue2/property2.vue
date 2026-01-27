<template>
  <div class="sysml-editor-container" @click="closeAllPopups" @mousemove="onMouseMove" @mouseup="onMouseUp">
    


    <aside class="model-browser" @contextmenu.prevent="showContextMenu($event, null, 'browser')">
      <div class="browser-header">
        <h3>FTA Model Browser</h3>
        <p class="guide">우클릭하여 게이트 및 이벤트 추가</p>
      </div>
      
      <div class="tree-container">
        <div v-for="node in sortedNodes" :key="node.id" 
             class="tree-node-wrapper" 
             :style="{ paddingLeft: (node.depth * 20) + 'px' }">
          <div class="tree-item" 
               :class="{ selected: selectedNodeId === node.id }" 
               @click.stop="selectNode(node)" 
               @contextmenu.prevent.stop="showContextMenu($event, node, 'node')">
            <span class="icon" v-if="node.type === 'AND'">🔥</span> <span class="icon" v-else-if="node.type === 'OR'">🛡️</span> <span class="icon" v-else>⚪</span> <span>{{ node.label }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="diagram-area" @contextmenu.prevent="showContextMenu($event, null, 'canvas')">
      <div class="palette-bar">
        <div class="tool-group">
          <button :class="{active: activeTool === 'select'}" @click="activeTool = 'select'">🖐 Select</button>
          <button :class="{active: activeTool === 'connect'}" @click="activeTool = 'connect'">⚡ Connect</button>
        </div>
        <div class="info-text" v-if="selectedNode">
          {{ selectedNode.type }} : {{ selectedNode.label }}
        </div>
      </div>

      <div class="drop-zone" ref="dropZoneRef">
        <svg class="connector-layer">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#34495e" />
            </marker>
          </defs>
          <path v-for="(conn, idx) in connectors" :key="idx"
            :d="getOrthogonalPath(conn.from, conn.to)"
            fill="none"
            stroke="#34495e" 
            stroke-width="1.5" 
            marker-end="url(#arrowhead)" />
        </svg>

        <div v-for="node in nodes" :key="node.id" 
             class="diagram-node"
             :class="['type-' + node.type, { selected: selectedNodeId === node.id }]"
             :style="getNodeStyle(node)"
             @mousedown.stop="onNodeMouseDown($event, node)"
             @contextmenu.prevent.stop="showContextMenu($event, node, 'node')">
          
          <div class="gate-symbol" v-if="node.type !== 'Event'">
            <svg viewBox="0 0 40 40" width="100%" height="100%">
              <path v-if="node.type === 'AND'" d="M 5 35 L 5 15 A 15 15 0 0 1 35 15 L 35 35 Z" fill="#fff" stroke="#333" stroke-width="2"/>
              <path v-if="node.type === 'OR'" d="M 5 35 Q 20 45 35 35 L 35 15 Q 20 25 5 15 Z" fill="#fff" stroke="#333" stroke-width="2"/>
            </svg>
          </div>
          
          <div class="node-content">
             <div class="node-header" v-if="node.type === 'Event'">Event</div>
             <div class="node-label">{{ node.label }}</div>
             <div class="node-prob" v-if="node.type === 'Event'">{{ node.probability.toExponential(1) }}</div>
          </div>

          <div class="port port-top"></div>
          <div class="port port-bottom"></div>
        </div>
      </div>
    </main>

    <div v-if="contextMenu.visible" 
         class="context-menu" 
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      
      <template v-if="contextMenu.type === 'node'">
        <div class="menu-header">Add Input to '{{contextMenu.targetNode.label}}'</div>
        <div class="menu-option" @click.stop="addBlock(contextMenu.targetNode.id, 'Event')">⚪ Add Basic Event</div>
        <div class="menu-option" @click.stop="addBlock(contextMenu.targetNode.id, 'AND')">🔥 Add AND Gate</div>
        <div class="menu-option" @click.stop="addBlock(contextMenu.targetNode.id, 'OR')">🛡️ Add OR Gate</div>
        <div class="menu-divider"></div>
        <div class="menu-option" @click.stop="openPropertiesModal">📋 Properties</div>
        <div class="menu-option delete" @click.stop="deleteBlock">🗑️ Delete</div>
      </template>

      <template v-else>
        <div class="menu-header">New Tree</div>
        <div class="menu-option" @click.stop="addBlock(null, 'OR')">🛡️ Top Event (OR)</div>
        <div class="menu-option" @click.stop="addBlock(null, 'AND')">🔥 Top Event (AND)</div>
      </template>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeAllPopups">
      <div class="modal-window">
        <div class="modal-header"><h3>Properties</h3><button @click="closeAllPopups">✕</button></div>
        <div class="modal-body" v-if="editingNode">
           <div class="form-group"><label>Type</label><input v-model="editingNode.type" disabled class="read-only" /></div>
           <div class="form-group"><label>Name</label><input v-model="editingNode.label" v-focus /></div>
           <div v-if="editingNode.type === 'Event'">
             <div class="form-section-title">Reliability</div>
             <div class="form-group"><label>Probability</label><input type="number" v-model.number="editingNode.probability" /></div>
           </div>
        </div>
        <div class="modal-footer"><button class="btn-primary" @click="closeAllPopups">OK</button></div>
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

const contextMenu = ref({ visible: false, x: 0, y: 0, targetNode: null, type: 'canvas' });
const showModal = ref(false);
const editingNode = ref(null);

const isDragging = ref(false);
const dragTarget = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

// 1. 노드 추가 로직 (타입 지원)
const addBlock = (parentId, type = 'Event') => {
  const isGate = type !== 'Event';
  const newNode = {
    id: `ID_${Date.now()}`,
    label: parentId ? `${type}_${nodes.value.length}` : `Top Event`,
    type: type, // 'AND', 'OR', 'Event'
    probability: 1.0e-5,
    // 초기 위치 계산 (조금씩 어긋나게)
    x: parentId ? 50 : 300, 
    y: parentId ? 50 : 50,
    width: isGate ? 60 : 120, // 게이트는 작게, 이벤트는 넓게
    height: isGate ? 60 : 80,
    parentId: parentId
  };

  // 부모가 있으면 부모 아래쪽에 자동 배치 시도
  if (parentId) {
    const p = nodes.value.find(n => n.id === parentId);
    if (p) {
      newNode.x = p.x + (Math.random() * 40 - 20); // 약간 랜덤
      newNode.y = p.y + 120; // 120px 아래
      // 자동 연결
      connectors.value.push({ from: parentId, to: newNode.id });
    }
  }

  nodes.value.push(newNode);
  closeAllPopups();
};

const deleteBlock = () => {
  const target = contextMenu.value.targetNode;
  if (!target) return;
  nodes.value = nodes.value.filter(n => n.id !== target.id && n.parentId !== target.id);
  connectors.value = connectors.value.filter(c => c.from !== target.id && c.to !== target.id);
  closeAllPopups();
};

// 2. 직각선(Orthogonal) 경로 계산 알고리즘
const getOrthogonalPath = (fromId, toId) => {
  const fromNode = nodes.value.find(n => n.id === fromId);
  const toNode = nodes.value.find(n => n.id === toId);
  if (!fromNode || !toNode) return '';

  // 시작점: 부모의 하단 중앙
  const start = { x: fromNode.x + fromNode.width / 2, y: fromNode.y + fromNode.height };
  // 끝점: 자식의 상단 중앙
  const end = { x: toNode.x + toNode.width / 2, y: toNode.y };

  // 중간 Y 지점 (두 노드 사이의 중간 높이)
  const midY = start.y + (end.y - start.y) / 2;

  // SVG Path 명령어 생성 (M: Move, L: Line)
  // Logic: 시작 -> 수직내림 -> 수평이동 -> 수직내림 -> 끝
  return `M ${start.x} ${start.y} 
          L ${start.x} ${midY} 
          L ${end.x} ${midY} 
          L ${end.x} ${end.y}`;
};

// --- 일반 UI 로직 (이전과 유사) ---
const getNodeStyle = (node) => ({
  transform: `translate(${node.x}px, ${node.y}px)`,
  width: node.width + 'px', height: node.height + 'px',
  zIndex: node.type === 'Event' ? 10 : 20 // 게이트가 좀 더 위로? 상관없음
});

const selectNode = (node) => selectedNodeId.value = node.id;
const selectedNode = computed(() => nodes.value.find(n => n.id === selectedNodeId.value));

const showContextMenu = (e, node, type) => {
  e.preventDefault();
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, targetNode: node, type };
  if (node) selectNode(node);
};

const openPropertiesModal = () => {
  if (contextMenu.value.targetNode) {
    editingNode.value = contextMenu.value.targetNode;
    showModal.value = true;
    contextMenu.value.visible = false;
  }
};
const closeAllPopups = () => { contextMenu.value.visible = false; showModal.value = false; };

const onNodeMouseDown = (e, node) => {
  selectNode(node);
  if (e.button === 2) return;
  if (activeTool.value === 'connect') {
    if (!connectStartId.value) connectStartId.value = node.id;
    else {
      if (connectStartId.value !== node.id) connectors.value.push({ from: connectStartId.value, to: node.id });
      connectStartId.value = null; activeTool.value = 'select';
    }
  } else {
    isDragging.value = true; dragTarget.value = node;
    dragOffset.value = { x: e.clientX - node.x, y: e.clientY - node.y };
  }
};

const onMouseMove = (e) => {
  if (isDragging.value && dragTarget.value) {
    dragTarget.value.x = e.clientX - dragOffset.value.x;
    dragTarget.value.y = e.clientY - dragOffset.value.y;
  }
};
const onMouseUp = () => { isDragging.value = false; dragTarget.value = null; };

const sortedNodes = computed(() => {
  // 트리 구조 정렬 (단순화)
  return nodes.value.map(n => ({...n, depth: 0})); // 브라우저 들여쓰기는 parentId 재귀 로직 필요(이전 코드 참조)
});

const vFocus = { mounted: (el) => el.focus() };
</script>

<style scoped>
.sysml-editor-container { display: flex; height: 90vh; background: #fff; overflow: hidden; user-select: none; font-family: 'Segoe UI', sans-serif; }

/* Browser & Palette styles (Keep same) */


.model-browser { width: 240px; background: #f8f9fa; border-right: 1px solid #ddd; display: flex; flex-direction: column; }
.browser-header { padding: 15px; background: #eaeff2; }
.tree-container { padding: 10px; overflow-y: auto; flex: 1; }
.tree-item { padding: 5px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; }
.tree-item:hover { background: #e9ecef; }
.tree-item.selected { background: #e7f5ff; color: #1976d2; font-weight: bold; }

.diagram-area { flex: 1; display: flex; flex-direction: column; position: relative; background-image: radial-gradient(#ddd 1px, transparent 1px); background-size: 20px 20px; }
.palette-bar { padding: 8px; background: white; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; }
.tool-group button { padding: 6px 12px; margin-right: 5px; cursor: pointer; border: 1px solid #ccc; background: #fff; border-radius: 4px; }
.tool-group button.active { background: #34495e; color: white; border-color: #2c3e50; }

/* --- 노드 스타일 (핵심 변경) --- */
.diagram-node {
  position: absolute;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  cursor: default;
  /* 기본 박스 스타일 제거 (게이트 모양을 위해) */
  background: transparent;
  box-sizing: border-box;
}

/* Event Node Style (사각형 박스) */
.diagram-node.type-Event {
  background: white;
  border: 1px solid #333;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  border-radius: 2px;
}
.diagram-node.selected { outline: 2px dashed #3498db; }

/* Gate Nodes (AND, OR) */
.diagram-node.type-AND, .diagram-node.type-OR {
  /* 게이트는 배경 박스 없이 아이콘만 강조 */
  overflow: visible;
}

.gate-symbol { width: 100%; height: 50px; display: flex; justify-content: center; }
.node-content { width: 100%; text-align: center; font-size: 12px; padding: 2px; margin-top: 2px; }
.node-header { background: #eee; font-size: 10px; padding: 2px; border-bottom: 1px solid #ccc; }
.node-label { font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: rgba(255,255,255,0.8); }
.node-prob { font-size: 10px; color: crimson; font-family: monospace; }

/* 연결점 가이드 (선택적) */
.port { width: 6px; height: 6px; background: #333; border-radius: 50%; position: absolute; left: 50%; transform: translateX(-50%); opacity: 0; transition: opacity 0.2s; }
.port-top { top: -3px; }
.port-bottom { bottom: -3px; }
.diagram-node:hover .port { opacity: 0.5; }

/* Context Menu & Modal (Same as before) */
.context-menu { position: fixed; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 10px rgba(0,0,0,0.2); z-index: 1000; min-width: 160px; padding: 5px 0; }
.menu-header { padding: 5px 10px; font-weight: bold; color: #888; font-size: 11px; background: #f9f9f9; border-bottom: 1px solid #eee; }
.menu-option { padding: 8px 15px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.menu-option:hover { background: #3498db; color: white; }
.menu-divider { height: 1px; background: #eee; margin: 4px 0; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-window { background: white; padding: 20px; border-radius: 4px; width: 300px; }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
.form-group { margin-bottom: 10px; }
.form-group label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; }
.form-group input { width: 100%; padding: 5px; box-sizing: border-box; }
.btn-primary { background: #3498db; color: white; border: none; padding: 8px 16px; cursor: pointer; float: right; }
</style>