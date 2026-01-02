<template>
  <div class="calculator-container">
    <h2>확률 계산기 (P(A U B) = P(A) + P(B) - P(A ∩ B))</h2>
    <p class="description">
      두 사건 A와 B의 합사건 확률 P(A U B)를 계산합니다.<br>
      P(A): 사건 A가 발생할 확률<br>
      P(B): 사건 B가 발생할 확률<br>
      P(A ∩ B): 사건 A와 B가 동시에 발생할 확률 (교사건)
    </p>

    <div class="input-group">
      <label for="probA">P(A):</label>
      <input type="number" id="probA" v-model.number="probA" min="0" max="1" step="0.01" />
    </div>

    <div class="input-group">
      <label for="probB">P(B):</label>
      <input type="number" id="probB" v-model.number="probB" min="0" max="1" step="0.01" />
    </div>

    <div class="input-group">
      <label for="probAB">P(A ∩ B):</label>
      <input type="number" id="probAB" v-model.number="probAB" min="0" max="1" step="0.01" />
    </div>

    <button @click="calculateProbability" class="calculate-btn">계산하기</button>

    <div v-if="result !== null" class="result-area">
      <h3>결과:</h3>
      <p class="result-text">P(A U B) = {{ result.toFixed(4) }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const probA = ref(0);
const probB = ref(0);
const probAB = ref(0);
const result = ref(null);
const errorMessage = ref('');

const calculateProbability = () => {
  errorMessage.value = '';
  result.value = null;

  // 입력값 유효성 검사
  if (probA.value < 0 || probA.value > 1 ||
      probB.value < 0 || probB.value > 1 ||
      probAB.value < 0 || probAB.value > 1) {
    errorMessage.value = '확률 값은 0과 1 사이여야 합니다.';
    return;
  }

  // P(A ∩ B)는 P(A) 또는 P(B) 보다 클 수 없음 (독립 사건이 아닌 경우도 고려)
  // 가장 보수적인 접근으로 min(P(A), P(B)) 보다 클 수 없음을 명시
  if (probAB.value > probA.value || probAB.value > probB.value) {
    errorMessage.value = 'P(A ∩ B)는 P(A) 또는 P(B)보다 클 수 없습니다.';
    return;
  }
  
  // 계산
  const calculatedResult = probA.value + probB.value - probAB.value;

  // 계산된 결과도 0과 1 사이여야 함
  if (calculatedResult < 0 || calculatedResult > 1) {
    errorMessage.value = '계산된 확률 값이 유효 범위를 벗어납니다 (0 ~ 1). 입력값을 확인하세요.';
    return;
  }

  result.value = calculatedResult;
};
</script>

<style scoped>
.calculator-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  text-align: center;
  font-family: Arial, sans-serif;
}
h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}
.description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 30px;
  background-color: #f9f9f9;
  border-left: 4px solid #42b883;
  padding: 15px;
  text-align: left;
}
.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.input-group label {
  flex: 1;
  text-align: right;
  margin-right: 15px;
  font-weight: bold;
  color: #34495e;
}
.input-group input {
  flex: 2;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}
.calculate-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
}
.calculate-btn:hover {
  background-color: #3aa876;
}
.result-area {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.result-area h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}
.result-text {
  font-size: 1.4rem;
  font-weight: bold;
  color: #42b883;
}
.error-message {
  color: #e74c3c;
  margin-top: 10px;
}
</style>
