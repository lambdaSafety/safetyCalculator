<!-- 주석  -->

<template>
  <div class="container">

    <!-- h1, h2, h3 등 가능 -->
    <!-- '<br>: 줄바꿈' -->

    <h1>계산기</h1>
    <h2>A와 B의 합을 구한다.</h2>
    <hr />
    <hr />

    <div class="input-group">
      <label>A: </label>
      <input v-model.number="numA" type="number" placeholder="숫자를 입력하세요" />
    </div>

    <div class="input-group">
      <label>B: </label>
      <input v-model.number="numB" type="number" placeholder="숫자를 입력하세요" />
    </div>

    <!-- @click 이외 다양한 동작 가능-->
    <button @click ="calculateSum">계산하기</button>

    <div v-if="result !== null" class="result-area">
      <h3>result: [ {{ result }} ]</h3>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 입력값과 결과를 저장할 반응형 변수 선언
const numA = ref(0);
const numB = ref(0);
const result = ref(null);

// 합계 계산 함수
const calculateSum = () => {
// 안전 분석의 로직 확장성을 고려하여 별도 함수로 관리합니다.
    result.value = numA.value + numB.value;
};
</script>

<style scoped>
/* 간단한 스타일링: 나중에 메디니처럼 깔끔한 UI로 발전시키기 위한 기초 */
.container {
  
  /* 최대 너비 설정 */
  max-width: 400px;
  
  /* 위아래 여백 20px, 좌우는 중앙 정렬(auto) */
  margin: 20px auto;
  
  /* 박스 내부 여백 */
  padding: 20px;
  
  /* [수정] 1px 두께의 실선(solid)이며 색상을 빨간색(red 또는 #ff0000)으로 변경 */
  border: 1px solid red; 
  
  /* 테두리 모서리를 둥글게 설정 */
  border-radius: 8px;
  
  /* 글꼴 설정 */
  font-family: Arial, sans-serif;

}

.input-group {
  margin-bottom: 10px;
}

input {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 90%;
  width: 90%;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  /* 추가: 가로 길이를 부모 요소의 100%로 설정 */
  /* width: 300px ; */
  width: 100%;

}

button:hover {
  /* 호버링시 색을 살짝 바꿈 */
  background-color: #3aa876;
}

.result-area {
  /* 위쪽 요소(버튼 등)와의 간격을 20px 두어 결과창을 독립적으로 보이게 합니다. */
  margin-top: 20px;
  /* 테두리와 안쪽 콘텐츠 사이의 여유 공간을 10px 주어 텍스트가 답답해 보이지 않게 합니다. */
  padding: 10px;
  /* 배경색을 아주 연한 회색(#f9f9f9)으로 설정하여 일반 본문 영역과 구분 짓습니다. */
  /* background-color: #f9f9f9; */
  background-color: #9cd614;

  /* 왼쪽 테두리에만 5px 두께의 초록색 실선을 추가합니다. */
  /* 이 디자인 기법은 'Callout'이나 'Alert' 박스에서 강조를 위해 자주 사용됩니다. */
  border-left: 5px solid #42b983;
}
</style>

