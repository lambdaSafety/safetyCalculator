<template>
  <div id="app-wrapper">
    <router-view />
  </div>
</template>

<script setup>
// 라우터 뷰만 렌더링하므로 별도의 스크립트 로직이 필요 없습니다.
</script>

<style>
/* 전역 스타일 (옵션) */
body {
  margin: 0;
  padding: 0;
  background-color: #f4f7f6; /* 전체적인 배경색 */
}
#app-wrapper {
  /* 앱 전체 컨테이너에 필요한 전역 스타일 */
} 
</style>
