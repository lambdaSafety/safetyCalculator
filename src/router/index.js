//import { createRouter, createWebHistory } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router'; // HashHistory로 변경

import LoginPage              from '../components/LoginPage.vue';
import MainPage               from '../components/MainPage.vue';

import ProbabilityCalculator  from '../components/ProbabilityCalculator.vue';
import CalExp                 from '../components/cal_exp.vue'; 

import modelingSysML          from '../components/modelingSysML.vue'; 
import ChartExp               from '../components/ChartExp.vue'; 
import test_grid_handsontable from '../components/test_grid_handsontable.vue'; 
import test_FTA               from '../components/test_FTA.vue'; 

import myPropertyTemp1        from '../components/tempVue/property1.vue'; 
import myPropertyTemp2        from '../components/tempVue/property2.vue'; 
import mostSimple             from '../components/tempVue/mostSimple.vue'; 
import saveWeb                from '../components/tempVue/saveWeb.vue'; 

const routes = [
  { path: '/',                        name: 'Login',                  component: LoginPage },
  { path: '/main',                    name: 'Main',                   component: MainPage,                meta: { requiresAuth: true }  },
  { path: '/calculator/probability',  name: 'ProbabilityCalculator',  component: ProbabilityCalculator,   meta: { requiresAuth: true }  },
  { path: '/calculator/exponential',  name: 'CalExp',                 component: CalExp,                  meta: { requiresAuth: true }  },  
  { path: '/testing/sysml',           name: 'sysml',                  component: modelingSysML,           meta: { requiresAuth: true }  },
  { path: '/testing/dist',            name: 'ChartExp',               component: ChartExp,                meta: { requiresAuth: true }  },
  { path: '/testing/grid',            name: 'test_grid_handsontable', component: test_grid_handsontable,  meta: { requiresAuth: true }  },
  { path: '/testing/FTA',             name: 'test_FTA',               component: test_FTA,                meta: { requiresAuth: true }  },
  { path: '/testing/myPropertyTemp1', name: 'myPropertyTemp1',        component: myPropertyTemp1,         meta: { requiresAuth: true }  },
  { path: '/testing/myPropertyTemp2', name: 'myPropertyTemp2',        component: myPropertyTemp2,         meta: { requiresAuth: true }  },
  { path: '/testing/mySimpleCode__0', name: 'mySimpleCode__0',        component: mostSimple,              meta: { requiresAuth: true }  },
  { path: '/testing/store_________0', name: 'saveWebCode___0',        component: saveWeb,                 meta: { requiresAuth: true }  },
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



