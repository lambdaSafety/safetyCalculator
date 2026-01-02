<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Safety Analysis Hub</h1>
      <p>기능안전 전문성 강화를 위한 도구</p>
      <input 
        type="password" 
        v-model="password" 
        @keyup.enter="login" 
        placeholder="비밀번호를 입력하세요"
      />
      <button @click="login">들어가기</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const password = ref('');
const error = ref('');
const router = useRouter();

const login = () => {
  if (password.value === 'safety') {
    localStorage.setItem('isLoggedIn', 'true'); // 로그인 상태 저장
    router.push('/main'); // 메인 페이지로 이동
  } else {
    error.value = '잘못된 비밀번호입니다.';
    password.value = ''; // 비밀번호 초기화
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: Arial, sans-serif;
}
.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 350px;
}
h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}
p {
  color: #666;
  margin-bottom: 25px;
}
input[type="password"] {
  width: calc(100% - 20px);
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #3aa876;
}
.error-message {
  color: #e74c3c;
  margin-top: 15px;
  font-size: 0.9rem;
}
</style>
