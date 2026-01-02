

// src/main.js

// src/main.js는 이 프로젝트의 엔트리 포인트(Entry Point), 즉 웹 애플리케이션이 시작될 때 
// 가장 먼저 실행되는 자바스크립트 파일입니다. 모든 부품(컴포넌트, 라우터, 라이브러리)을 하나로 모아 
// 실제 웹 화면에 띄우는 역할을 합니다.

// 1) Vue 3의 핵심 함수인 createApp을 가져옵니다. 이 함수는 새로운 Vue 애플리케이션 인스턴스를 생성하는 엔진 역할을 합니다.
// 2) 프로젝트의 최상위 컴포넌트인 App.vue를 가져옵니다. 모든 페이지는 이 App.vue라는 큰 틀 안에서 바뀌게 됩니다.
// 3) 우리가 설정한 src/router/index.js의 경로 설정(지도)을 가져옵니다. "어떤 주소로 들어오면 어떤 계산기를 보여줄지"에 대한 규칙이 담겨 있습니다.
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // router 임포트

// import './assets/main.css'; // 기본 CSS 임포트 (기존에 있다면 유지)
// 1) App.vue를 뿌리로 하는 실제 애플리케이션 인스턴스를 생성하여 app이라는 변수에 담습니다.
// 2) 생성된 애플리케이션에 라우터 기능을 장착합니다. 이 줄이 있어야 사용자가 메뉴를 클릭했을 때 페이지가 새로고침 없이 부드럽게 전환됩니다.
// 3) 최종 완성된 애플리케이션을 index.html 파일 안에 있는 <div id="app"></div> 공간에 갖다 붙입니다(렌더링). 이때 비로소 브라우저 화면에 우리의 웹 서버가 나타납니다.
const app = createApp(App);
app.use(router); // router 사용 설정
app.mount('#app');