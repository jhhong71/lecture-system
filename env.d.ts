/// <reference types="vite/client" />

// .vue 파일 인식 설정
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vuetify 스타일 인식 설정
declare module 'vuetify/styles' {
  const styles: any;
  export default styles;
}