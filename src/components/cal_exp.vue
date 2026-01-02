<template>
  <div class="calculator-card">
    <h3>Exponential Distribution Calculator</h3>
    <p>지수 분포 기반 고장 확률 밀도(pdf) 및 누적 분포(CDF) 계산</p>
    <hr />

    <div class="input-group">
      <label>고장률 (λ, Lambda): </label>
      <input v-model="lambda" type="number" step="0.000001" placeholder="예: 0.0001" />
    </div>

    <div class="input-group">
      <label>시간 (t): </label>
      <input v-model="time" type="number" placeholder="예: 1000" />
    </div>

    <button @click="calculate">계산하기</button>

    <div v-if="result" class="result-area">
      <h4>계산 결과 (High Precision)</h4>
      <p><strong>f(t) [pdf]:</strong> {{ result.pdf }}</p>
      <p><strong>F(t) [CDF]:</strong> {{ result.cdf }}</p>
      <p class="formula-note">※ f(t) = λe^(-λt), F(t) = 1 - e^(-λt)</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { create, all } from 'mathjs';

// math.js 설정: BigNumber를 사용하여 정밀도 향상
const config = {
  number: 'BigNumber',
  precision: 64
};
const math = create(all, config);

const lambda = ref(0);
const time = ref(0);
const result = ref(null);

const calculate = () => {
  try {
    const l = math.bignumber(lambda.value);
    const t = math.bignumber(time.value);

    // 지수 분포 수식 정의
    // pdf: f(t) = λ * e^(-λ * t)
    const pdf = math.multiply(l, math.exp(math.multiply(math.unaryMinus(l), t)));

    // CDF: F(t) = 1 - e^(-λ * t)
    const cdf = math.subtract(math.bignumber(1), math.exp(math.multiply(math.unaryMinus(l), t)));

    result.value = {
      pdf: pdf.toString(),
      cdf: cdf.toString()
    };
  } catch (error) {
    alert("입력값을 확인해주세요.");
    console.error(error);
  }
};
</script>

<style scoped>
.calculator-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  background-color: #f9f9f9;
}
.input-group {
  margin-bottom: 15px;
}
input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
.result-area {
  margin-top: 20px;
  padding: 10px;
  background: white;
  border-left: 5px solid #42b983;
}
.formula-note {
  font-size: 0.8rem;
  color: #666;
}
</style>
