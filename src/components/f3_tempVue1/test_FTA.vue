<template>
  <div class="sysml-editor-container" @click="closeContextMenu" @mousemove="onMouseMove" @mouseup="onMouseUp">
    
    <aside class="model-browser" @contextmenu.prevent="showContextMenu($event, null)">
      <div class="browser-header">
        <h3>FTA Model Browser</h3>
        <p class="guide">노드 우클릭: 하위 게이트/이벤트 추가</p>
      </div>
      
      <div class="tree-container">
        <div v-for="node in sortedNodes" :key="node.id" 
             class="tree-node-wrapper" 
             :style="{ paddingLeft: (node.depth * 15) + 'px' }">
          <div class="tree-item" 
               :class="{ selected: selectedNodeId === node.id }" 
               @click="selectedNodeId = node.id" 
               @contextmenu.prevent.stop="showContextMenu($event, node.id)">
            <span class="icon">{{ getTypeIcon(node.type) }}</span>
            <span class="label">{{ node.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="contextMenu.visible" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
        <div class="menu-option" @click="addFtaNode(contextMenu.targetId, 'OR')">Add OR Gate</div>
        <div class="menu-option" @click="addFtaNode(contextMenu.targetId, 'AND')">Add AND Gate</div>
        <div class="menu-option" @click="addFtaNode(contextMenu.targetId, 'EVENT')">Add Basic Event</div>
        <div v-if="contextMenu.targetId" class="menu-option delete" @click="deleteNode">Delete</div>
      </div>
    </aside>

    <main class="diagram-area">
      <div class="drop-zone">
        <svg class="connector-layer">
          <path v-for="conn in autoConnectors" :key="conn.id"
            :d="getStepPath(conn.from, conn.to)"
            stroke="#34495e" stroke-width="1.5" fill="none" />
        </svg>

        <div v-for="node in nodes" :key="node.id" 
             class="fta-node"
             :class="{ selected: selectedNodeId === node.id }"
             :style="getNodeStyle(node)"
             @mousedown.stop="onNodeMouseDown($event, node)">
          
          <div class="symbol-container">
            <svg v-if="node.type === 'OR'" viewBox="0 0 100 60">
               <path d="M10,50 Q50,0 90,50 Q50,40 10,50 Z" fill="#e1f5fe" stroke="#01579b" stroke-width="2"/>
            </svg>
            <svg v-else-if="node.type === 'AND'" viewBox="0 0 100 60">
               <path d="M10,50 L10,30 Q10,0 50,0 Q90,0 90,30 L90,50 Z" fill="#fff3e0" stroke="#e65100" stroke-width="2"/>
            </svg>
            <div v-else class="event-circle"></div>
          </div>
          <div class="node-label">{{ node.label }}</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 초기 데이터 (TLE 하나는 기본 생성)
const nodes = ref([
  { id: 'tle_0', type: 'TLE', label: 'Top Level Event', x: 350, y: 50, parentId: null }
]);

const selectedNodeId = ref(null);
const contextMenu = ref({ visible: false, x: 0, y: 0, targetId: null });
const dragTarget = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

// --- [모델 관리 로직] ---
const addFtaNode = (parentId, type) => {
  const parent = nodes.value.find(n => n.id === parentId);
  const newNode = {
    id: `node_${Date.now()}`,
    type: type,
    label: `${type}_${nodes.value.length}`,
    parentId: parentId,
    // 부모 위치 근처에 자동 배치
    x: parent ? parent.x + (Math.random() * 100 - 50) : 100,
    y: parent ? parent.y + 100 : 100,
    width: 80, height: 60
  };
  nodes.value.push(newNode);
  closeContextMenu();
};

const deleteNode = () => {
  const id = contextMenu.value.targetId;
  nodes.value = nodes.value.filter(n => n.id !== id && n.parentId !== id);
  closeContextMenu();
};

// --- [자동 계산 및 스타일] ---
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

// 부모-자식 관계를 기반으로 연결선 자동 생성
const autoConnectors = computed(() => {
  return nodes.value
    .filter(n => n.parentId !== null)
    .map(n => ({ id: `c_${n.id}`, from: n.parentId, to: n.id }));
});

const getTypeIcon = (type) => {
  if (type === 'OR') return '🚀';
  if (type === 'AND') return '⛩️';
  if (type === 'TLE') return '🚩';
  return '⚪';
};

const getNodeStyle = (node) => ({
  left: node.x + 'px', top: node.y + 'px',
  width: '100px', height: '80px'
});

// 직각 연결선 (FTA 표준 스타일)
const getStepPath = (fromId, toId) => {
  const startNode = nodes.value.find(n => n.id === fromId);
  const endNode = nodes.value.find(n => n.id === toId);
  if (!startNode || !endNode) return '';

  const x1 = startNode.x + 50; const y1 = startNode.y + 60;
  const x2 = endNode.x + 50;   const y2 = endNode.y;
  const midY = (y1 + y2) / 2;

  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
};

// --- [이벤트 핸들러] ---
const showContextMenu = (e, id) => {
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, targetId: id };
};
const closeContextMenu = () => contextMenu.value.visible = false;

const onNodeMouseDown = (e, node) => {
  selectedNodeId.value = node.id;
  dragTarget.value = node;
  dragOffset.value = { x: e.clientX - node.x, y: e.clientY - node.y };
};

const onMouseMove = (e) => {
  if (dragTarget.value) {
    dragTarget.value.x = e.clientX - dragOffset.value.x;
    dragTarget.value.y = e.clientY - dragOffset.value.y;
  }
};

const onMouseUp = () => dragTarget.value = null;

</script>

<style scoped>
.sysml-editor-container { display: flex; height: 100vh; background: #f0f2f5; font-family: sans-serif; }

/* 모델 브라우저 스타일 */
.model-browser { width: 260px; background: white; border-right: 1px solid #dcdfe6; display: flex; flex-direction: column; }
.browser-header { padding: 15px; border-bottom: 1px solid #eee; }
.tree-container { flex: 1; overflow-y: auto; padding: 10px; }
.tree-item { 
  display: flex; align-items: center; padding: 6px 8px; cursor: pointer; border-radius: 4px; font-size: 13px; 
}
.tree-item:hover { background: #f5f7fa; }
.tree-item.selected { background: #e8f4ff; color: #409eff; font-weight: bold; }

/* 다이어그램 영역 스타일 */
.diagram-area { flex: 1; position: relative; overflow: hidden; background: #ffffff; }
.drop-zone { width: 3000px; height: 3000px; position: relative; }
.connector-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }

.fta-node { 
  position: absolute; display: flex; flex-direction: column; align-items: center; cursor: grab; z-index: 10;
}
.symbol-container { width: 70px; height: 45px; display: flex; justify-content: center; }
.event-circle { width: 35px; height: 35px; border: 2px solid #333; border-radius: 50%; background: white; }
.node-label { margin-top: 5px; font-size: 11px; text-align: center; background: rgba(255,255,255,0.8); padding: 2px 4px; }

/* 컨텍스트 메뉴 */
.context-menu { 
  position: fixed; background: white; border: 1px solid #ddd; box-shadow: 0 2px 12px rgba(0,0,0,0.1); z-index: 1000;
}
.menu-option { padding: 10px 20px; font-size: 13px; cursor: pointer; }
.menu-option:hover { background: #409eff; color: white; }
.menu-option.delete { color: #f56c6c; border-top: 1px solid #eee; }
</style>

