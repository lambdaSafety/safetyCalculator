// vite.config.js는 Vite를 사용하는 프로젝트의 "설계도"이자 "컨트롤 타워" 역할을 하는 아주 중요한 설정 파일입니다. 
// 프로젝트 루트 폴더(C:\Users\shubi\safety-analyzer)에 위치하며, 
// 개발 서버가 어떻게 동작할지, 빌드(배포 준비)를 어떻게 할지 결정합니다.


// Vite에서 제공하는 설정 함수를 가져옵니다. 이 함수를 사용하면 코드를 작성할 때 
// 자동 완성(IntelliSense) 기능을 쓸 수 있어 오타를 방지해 줍니다.
import { defineConfig } from 'vite'
// Vue 3 파일(.vue)은 브라우저가 직접 읽을 수 없는 형식입니다. 이 플러그인이 .vue 파일을 
// 자바스크립트와 HTML/CSS로 변환해주는 역할을 합니다.
import vue from '@vitejs/plugin-vue'



// 작성한 설정 내용을 외부(Vite 엔진)로 내보냅니다. 
// https://vite.dev/config/
export default defineConfig({
  //Vite에게 "우리는 Vue 프레임워크를 사용하니까, 관련 플러그인을 가동해줘"라고 명령하는 핵심 줄입니다.
  plugins: [vue()],
})
