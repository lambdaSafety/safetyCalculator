<template>
  <div class="main-layout">
    <header class="app-header">
      <!-- <img src="https://picsum.photos/seed/functional-safety/800/200" alt="Functional Safety Concept" class="header-image" /> -->
      <!-- <img src="../assets/safetyCalculator.jpg" alt="Functional Safety Concept" class="header-image" /> -->
      <img src="/safetyCalculator.jpg" alt="Functional Safety Concept" class="header-image" />
      <h1>환영합니다! 안전 분석 웹서버</h1>
      <p>필요한 기능을 트리 메뉴에서 선택해주세요.</p>
    </header>

    <div class="main-content">

      <aside class="sidebar">
        <h2>메뉴</h2>
        <ul class="tree-menu">
          <li @click="toggleSubMenu('calculators')" :class="{ 'has-submenu': true, 'open': openSubMenu === 'calculators' }">
            <span class="menu-item-toggle">기본 계산</span>
            <ul v-if="openSubMenu === 'calculators'" class="submenu">
              <li><router-link to="/calculator/probability">확률 계산기 (P(AUB))</router-link></li>
              <li><router-link to="/calculator/exponential">지수분포 확률 계산</router-link></li>
              <li><router-link to="/calculator/dist">CDF,pdf 그래프</router-link></li>
              <li><router-link to="/calculator/eventProb">이벤트 확률(일반,repaired, monitored)</router-link></li>
            </ul>
          </li>

          <template v-if="userRole === 'admin'">
            <li @click="toggleSubMenu('modeling')" :class="{ 'has-submenu': true, 'open': openSubMenu === 'modeling' }">
              <span class="menu-item-toggle">연습1</span>
              <ul v-if="openSubMenu === 'modeling'" class="submenu">
                <li><router-link to="/modeling/sysml">SysML 2.0</router-link></li>
                <li><router-link to="/modeling/FTA">FTA 연습중</router-link></li>
                <li><router-link to="/modeling/grid">test_grid_handsontable 연습중</router-link></li>
                <li><router-link to="/modeling/fta">TBD</router-link></li>
              </ul>
            </li>
            <li @click="toggleSubMenu('testing')" :class="{ 'has-submenu': true, 'open': openSubMenu === 'testing' }">
              <span class="menu-item-toggle">연습2</span>
              <ul v-if="openSubMenu === 'testing'" class="submenu">
                <li><router-link to="/testing/mySimpleCode__0">mySimpleCode__0</router-link></li>
                <li><router-link to="/testing/myPropertyTemp1">myPropertyTemp1</router-link></li>
                <li><router-link to="/testing/myPropertyTemp2">myPropertyTemp2</router-link></li>
                <li><router-link to="/testing/store_________0">saveWebCode___0</router-link></li>
                </ul>
            </li>
          </template>

          <li @click="logout" class="logout-item">로그아웃</li>
        </ul>
      </aside>

      <section class="content-area">
        <router-view /> 
        <div v-if="$route.path === '/main'" class="welcome-section">
          <h2>기능 개요</h2>
          <p>이 웹서버는 기능안전 엔지니어링의 다양한 측면을 탐구하고 실습할 수 있도록 설계되었습니다.</p>
          <p>좌측 메뉴를 통해 확률 계산, 신뢰도 모델링, FTA/FMEA 분석 등 다양한 도구를 사용해보세요.</p>
          <p>새로운 기능을 개발하고 본인의 전문성을 시각화하는 강력한 포트폴리오가 될 것입니다.</p>
          <p>지속적인 업데이트와 확장을 통해 더욱 강력한 기능안전 분석 환경을 만들어갈 수 있습니다.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // ★ onMounted 추가됨
import { useRouter } from 'vue-router';


const router = useRouter();
const openSubMenu = ref(''); // 현재 열려있는 서브 메뉴
const userRole = ref(''); // 사용자 역할 상태 추가

onMounted(() => {
  // 컴포넌트 로드 시 로컬스토리지에서 역할 가져오기
  userRole.value = localStorage.getItem('userRole') || 'guest';
});

const toggleSubMenu = (menu) => {
  openSubMenu.value = openSubMenu.value === menu ? '' : menu;
};

const logout = () => {
  // localStorage.removeItem('isLoggedIn'); // 로그인 상태 제거
  // router.push('/'); // 로그인 페이지로 리다이렉트
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole'); // 역할 정보도 삭제
  router.push('/');

};
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f7f6;
}
.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
.header-image {
  width: 100%;
  max-height: 200px; /* 이미지 높이 제한 */
  object-fit: cover; /* 이미지가 잘리지 않고 채워지도록 */
  display: block;
  margin-bottom: 15px;
}
h1 {
  font-size: 2.2rem;
  margin-bottom: 5px;
}
p {
  font-size: 1.1rem;
  opacity: 0.9;
}
.main-content {
  display: flex;
  flex-grow: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
}
.sidebar {
  width: 250px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-right: 20px;
  flex-shrink: 0;
}
.sidebar h2 {
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.tree-menu {
  list-style: none;
  padding: 0;
}
.tree-menu li {
  margin-bottom: 10px;
}
.tree-menu li span.menu-item-toggle,
.tree-menu li a {
  display: block;
  padding: 10px 15px;
  color: #34495e;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.2s, color 0.2s;
}
.tree-menu li span.menu-item-toggle {
  cursor: pointer;
  font-weight: bold;
}
.tree-menu li span.menu-item-toggle:hover {
  background-color: #e9ecef;
}
.tree-menu li.open > span.menu-item-toggle {
  background-color: #d1e7dd;
  color: #2c3e50;
}
.tree-menu li a:hover {
  background-color: #e9ecef;
  color: #2c3e50;
}
.submenu {
  list-style: none;
  padding-left: 20px;
  margin-top: 5px;
  border-left: 2px solid #42b883; /* 서브메뉴 구분선 */
}
.submenu li a {
  padding: 8px 15px;
  font-size: 0.95rem;
}
.submenu li a.router-link-active {
  background-color: #d1e7dd;
  color: #2c3e50;
  font-weight: bold;
}
.content-area {
  flex-grow: 1;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.welcome-section {
  text-align: left;
  line-height: 1.6;
  color: #34495e;
}
.welcome-section h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}
.logout-item {
  color: #e74c3c !important;
  cursor: pointer;
  font-weight: bold;
  margin-top: 20px;
  padding: 10px 15px;
  border-top: 1px solid #eee;
}
.logout-item:hover {
  background-color: #fbe6e6 !important;
}
</style>
