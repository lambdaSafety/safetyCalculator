//import { createRouter, createWebHistory } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router'; // HashHistory로 변경

import LoginPage              from '../components/f1_main/LoginPage.vue';
import MainPage               from '../components/f1_main/MainPage.vue';

import CalExp                 from '../components/f2_public/cal_exp.vue'; 
import ChartExp               from '../components/f2_public/ChartExp.vue'; 
import ProbabilityCalculator  from '../components/f2_public/ProbabilityCalculator.vue';
import eventProb              from '../components/f2_public/eventProb.vue';



import modelingSysML          from '../components/f3_tempVue1/modelingSysML.vue'; 
import test_FTA               from '../components/f3_tempVue1/test_FTA.vue'; 
import test_grid_handsontable from '../components/f3_tempVue1/test_grid_handsontable.vue'; 

import mostSimple             from '../components/f4_tempVue2/mostSimple.vue'; 
import myPropertyTemp1        from '../components/f4_tempVue2/property1.vue'; 
import myPropertyTemp2        from '../components/f4_tempVue2/property2.vue'; 
import saveWeb                from '../components/f4_tempVue2/saveWeb.vue'; 

const routes = [
  { path: '/',                        name: 'Login',                  component: LoginPage },
  { path: '/main',                    name: 'Main',                   component: MainPage,                meta: { requiresAuth: true }  },
  
  { path: '/calculator/exponential',  name: 'CalExp',                 component: CalExp,                  meta: { requiresAuth: true }  },  
  { path: '/calculator/dist',         name: 'ChartExp',               component: ChartExp,                meta: { requiresAuth: true }  },
  { path: '/calculator/probability',  name: 'ProbabilityCalculator',  component: ProbabilityCalculator,   meta: { requiresAuth: true }  },
  { path: '/calculator/eventProb',    name: 'eventProb',              component: eventProb,               meta: { requiresAuth: true }  },
  
  { path: '/modeling/sysml',          name: 'sysml',                  component: modelingSysML,           meta: { requiresAuth: true }  },
  { path: '/modeling/FTA',            name: 'test_FTA',               component: test_FTA,                meta: { requiresAuth: true }  },
  { path: '/modeling/grid',           name: 'test_grid_handsontable', component: test_grid_handsontable,  meta: { requiresAuth: true }  },
  
  { path: '/testing/mySimpleCode__0', name: 'mySimpleCode__0',        component: mostSimple,              meta: { requiresAuth: true }  },
  { path: '/testing/myPropertyTemp1', name: 'myPropertyTemp1',        component: myPropertyTemp1,         meta: { requiresAuth: true }  },
  { path: '/testing/myPropertyTemp2', name: 'myPropertyTemp2',        component: myPropertyTemp2,         meta: { requiresAuth: true }  },
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



