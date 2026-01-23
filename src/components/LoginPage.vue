

<template>
  <!-- ◀!-- [주석] 최상위 컨테이너: 화면 전체의 레이아웃과 배경색을 결정합니다. --▶ -->
  <div class="login-container">
    <!-- ◀!-- [주석] 로그인 박스: 중앙에 위치하며 실제 입력 폼들이 담기는 카드입니다. --▶ -->
    <div class="login-card">
      
      <!-- ◀!-- [주석] 서비스의 메인 타이틀입니다. --▶ -->
      <h1>Safety Analysis Practice for Engineers</h1>
      
      <!-- ◀!-- [주석] 사용자의 목적(자기계발 및 전문성)을 상기시키는 문구입니다. --▶ -->
      <p>Probability, Statistics, Funcational Safety, Cybersecurity</p>
      
      <button @click="login('guest')" class="guest-btn-main">
        Quick Start(Guest Mode)
      </button>

      <div class="divider">
        <span>Authorized access only</span>
      </div>

      <div class="admin-section">
        <input 
          type="password" 
          v-model="password" 
          @keyup.enter="login('admin')" 
          placeholder="admin password"
        />
        
        <button @click="login('admin')" class="admin-btn-sub">
          System Admin(Admin Mode)
        </button>
      </div>

      
      <!-- ◀!-- 
         [주석] 에러 메시지:
         v-if="error" 조건에 따라, 에러 내용이 있을 때만 이 태그가 화면에 나타납니다.
      --▶ -->
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



  
  const login = (type) => {
  if (type === 'admin') {
    if (password.value === 'safety') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin'); // 관리자 역할 명시
      router.push('/main');
    } else {
      error.value = '잘못된 비밀번호입니다.';
    }
  } else {
    // '살펴보기' 버튼 클릭 시
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'guest'); // 방문자 역할 명시
    router.push('/main');
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
  font-family: 'Segoe UI', sans-serif;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 380px;
}

h1 { color: #2c3e50; margin-bottom: 8px; font-size: 1.8rem; }
p { color: #7f8c8d; margin-bottom: 30px; font-size: 0.95rem; }

/* 강조된 버튼 (Guest 전용) */
.guest-btn-main {
  width: 100%;
  height: 60px; /* 높이 강조 */
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}
.guest-btn-main:hover {
  background-color: #3aa876;
  transform: translateY(-2px);
}

/* 구분선 스타일 */
.divider {
  margin: 30px 0;
  border-top: 1px solid #eee;
  position: relative;
}
.divider span {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0 15px;
  color: #95a5a6;
  font-size: 0.8rem;
}

/* 관리자 섹션 및 덜 강조된 버튼 */
.admin-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input[type="password"] {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.admin-btn-sub {
  width: 100%;
  padding: 10px;
  background-color: #95a5a6; /* 덜 강조된 색상 */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}
.admin-btn-sub:hover {
  background-color: #7f8c8d;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  font-size: 0.85rem;
}


</style>



