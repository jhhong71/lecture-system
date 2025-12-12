import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// vite-plugin-vuetify가 컴포넌트와 디렉티브를 자동으로 주입하므로
// 여기에 별도의 components, directives 설정이 필요 없습니다.

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})