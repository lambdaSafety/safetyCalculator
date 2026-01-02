//import { createRouter, createWebHistory } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router'; // HashHistory로 변경
import LoginPage from '../components/LoginPage.vue';
import MainPage from '../components/MainPage.vue';
import ProbabilityCalculator from '../components/ProbabilityCalculator.vue';
// 1. 새 컴포넌트 임포트
import CalExp from '../components/cal_exp.vue'; 

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/main',
    name: 'Main',
    component: MainPage,
    meta: { requiresAuth: true } 
  },
  {
    path: '/calculator/probability',
    name: 'ProbabilityCalculator',
    component: ProbabilityCalculator,
    meta: { requiresAuth: true }
  },
  // 2. 지수분포 계산기 경로 추가
  {
    path: '/calculator/exponential',
    name: 'CalExp',
    component: CalExp,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  // history: createWebHistory(),
  // routes
  history: createWebHashHistory('/safetyCalculator/'), // Base 경로 추가
  routes
  
});

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('isLoggedIn');

  if (to.meta.requiresAuth && !loggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;



