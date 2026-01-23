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

    <!-- 아래에서 calculateProbability은 스크립트 변수, calculate은 스타일 변수와 연결 -->
    <button @click="calculateProbability" class="calculate-btn">계산하기</button>

    <div v-if="result !== null" class="result-area">
      <h3>결과:</h3>
      <p class="result-text">P(A U B) = {{ result.toFixed(4) }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>


<script setup>
// vue 패키지에서 반응형 데이터 생성을 위한 ref 함수를 가져옵니다.
import { ref } from 'vue';

/**
 * [상태 정의]
 * Vue의 ref는 값이 변할 때 화면을 자동으로 업데이트(Re-rendering)합니다.
 * 안전 분석 엔진의 'Input Parameter'와 'Output'을 정의하는 단계입니다.
 */
const probA = ref(0);      // 사건 A의 발생 확률 P(A)
const probB = ref(0);      // 사건 B의 발생 확률 P(B)
const probAB = ref(0);     // 사건 A와 B가 동시에 발생할 확률 P(A ∩ B)
const result = ref(null);  // 최종 계산된 합집합 확률 P(A ∪ B)
const errorMessage = ref(''); // 사용자 피드백을 위한 에러 메시지

/**
 * [확률 계산 함수]
 * FTA(Fault Tree Analysis)의 OR Gate 계산 원리인 
 * 포함-배제 원리(Inclusion-Exclusion Principle)를 적용합니다.
 */
const calculateProbability = () => {
  // 새로운 계산 시작 시 이전 상태 초기화 (결과 및 에러 초기화)
  errorMessage.value = '';
  result.value = null;

  /**
   * 1. 입력 유효성 검사 (Guard Clauses)
   * 확률의 기본 공리: 모든 확률은 [0, 1] 구간 내에 존재해야 합니다.
   */
  if (probA.value < 0 || probA.value > 1 ||
      probB.value < 0 || probB.value > 1 ||
      probAB.value < 0 || probAB.value > 1) {
    errorMessage.value = '확률 값은 0과 1 사이여야 합니다.';
    return; // 유효하지 않으면 함수 종료
  }

  /**
   * 2. 논리적 정합성 검사
   * 집합론적 관점에서 교집합 P(A ∩ B)은 개별 사건의 확률보다 클 수 없습니다.
   * 안전 분석에서 모델의 논리적 모순을 방지하는 중요한 체크포인트입니다.
   */
  if (probAB.value > probA.value || probAB.value > probB.value) {
    errorMessage.value = 'P(A ∩ B)는 P(A) 또는 P(B)보다 클 수 없습니다.';
    return;
  }
  
  /**
   * 3. 핵심 계산 로직
   * P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
   * 사건 A 또는 사건 B가 발생하여 시스템 결함으로 이어질 확률을 산출합니다.
   */
  const calculatedResult = probA.value + probB.value - probAB.value;

  /**
   * 4. 최종 결과 검증
   * 부동 소수점 오차나 논리적 오류로 인해 결과가 범위를 벗어나는지 마지막으로 확인합니다.
   */
  if (calculatedResult < 0 || calculatedResult > 1) {
    errorMessage.value = '계산된 확률 값이 유효 범위를 벗어납니다 (0 ~ 1). 입력값을 확인하세요.';
    return;
  }

  // 모든 검증을 통과하면 최종 결과값을 반응형 변수에 할당하여 화면에 표시합니다.
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
