<template>
  <div class="safety-container">
    <h1>🛡️ Safety Analysis Dashboard</h1>
    <p class="subtitle">브라우저를 껐다 켜도 데이터가 유지됩니다.</p>

    <div class="input-card">
      <h3>Add New Analysis</h3>
      <div class="form-grid">
        <input v-model="newItem.hazard" placeholder="Hazard / Failure Mode" />
        <div class="score-inputs">
          <input type="number" v-model.number="newItem.s" placeholder="S" min="1" max="10" />
          <input type="number" v-model.number="newItem.o" placeholder="O" min="1" max="10" />
          <input type="number" v-model.number="newItem.d" placeholder="D" min="1" max="10" />
        </div>
        <button @click="addItem" class="add-btn">분석 추가</button>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Hazard Description</th>
            <th>S</th>
            <th>O</th>
            <th>D</th>
            <th>RPN</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in analysisList" :key="index">
            <td>{{ item.hazard }}</td>
            <td>{{ item.s }}</td>
            <td>{{ item.o }}</td>
            <td>{{ item.d }}</td>
            <td class="rpn-cell" :class="getRiskClass(item.s * item.o * item.d)">
              {{ item.s * item.o * item.d }}
            </td>
            <td>
              <button @click="removeItem(index)" class="del-btn">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="analysisList.length === 0" class="empty-msg">기록된 분석 결과가 없습니다.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 새로운 입력을 위한 임시 객체
      newItem: {
        hazard: '',
        s: 1,
        o: 1,
        d: 1
      },
      // 전체 분석 리스트
      analysisList: []
    }
  },
  // 1. 브라우저에서 데이터 불러오기
  mounted() {
    const data = localStorage.getItem('my-safety-data');
    if (data) {
      this.analysisList = JSON.parse(data);
    }
  },
  // 2. 데이터가 변할 때마다 브라우저에 자동 저장
  watch: {
    analysisList: {
      handler(newList) {
        localStorage.setItem('my-safety-data', JSON.stringify(newList));
      },
      deep: true // 객체 내부의 속성 변화까지 감지
    }
  },
  methods: {
    addItem() {
      if (!this.newItem.hazard) return alert("Hazard를 입력해주세요!");
      
      // 데이터 복사 후 추가 (참조 끊기)
      this.analysisList.push({ ...this.newItem });
      
      // 입력창 초기화
      this.newItem = { hazard: '', s: 1, o: 1, d: 1 };
    },
    removeItem(index) {
      this.analysisList.splice(index, 1);
    },
    getRiskClass(rpn) {
      if (rpn >= 100) return 'risk-high';
      if (rpn >= 40) return 'risk-med';
      return 'risk-low';
    }
  }
}
</script>

<style scoped>
.safety-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.subtitle { color: #666; margin-bottom: 30px; }

/* 입력 카드 스타일 */
.input-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 5px solid #2c3e50;
  margin-bottom: 30px;
}

.form-grid {
  display: flex;
  gap: 10px;
  align-items: center;
}

.score-inputs { display: flex; gap: 5px; }
.score-inputs input { width: 50px; text-align: center; }

input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
input[placeholder*="Hazard"] { flex-grow: 1; }

.add-btn { background: #2c3e50; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }

/* 테이블 스타일 */
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { border-bottom: 1px solid #ddd; padding: 12px; text-align: left; }
th { background: #eee; }

.rpn-cell { font-weight: bold; }
.risk-high { color: #e74c3c; } /* 위험도가 높을 때 빨간색 */
.risk-med { color: #f39c12; }
.risk-low { color: #27ae60; }

.del-btn { background: #ff7675; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; }
.empty-msg { text-align: center; color: #999; margin-top: 20px; }
</style>