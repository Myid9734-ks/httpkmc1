import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import axios from 'axios'

// axios 기본 설정
axios.defaults.baseURL = 'http://ikmc1.duckdns.org:3001'

// Font Awesome 설정
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faHome, 
  faCog, 
  faChevronDown,
  faIndustry,
  faTools,
  faStream,
  faTasks,
  faClipboardCheck,
  faBox,
  faExchangeAlt,
  faChartBar,
  faMoon,
  faSun,
  faBars,
  faHandshake,
  faClipboard,
  faHistory,
  faSave,
  faCheck,
  faSearch,
  faPlus,
  faBell,
  faArrowRightArrowLeft,
  faCalendar,
  faCalendarWeek,
  faCalendarDay,
  faCalendarAlt,
  faUser,
  faUsersCog,
  faSignOutAlt,
  faEdit,
  faChartLine,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faListCheck,
  faSpinner,
  faFileAlt,
  faClipboardList,
  faCheckSquare,
  faList,
  faShoppingCart,
  faPaperPlane,
  faTimes,
  faCalendarCheck,
  faArrowUp,
  faArrowDown,
  faCamera
} from '@fortawesome/free-solid-svg-icons'

// 아이콘 등록
library.add(
  faHome,
  faCog,
  faChevronDown,
  faIndustry,
  faTools,
  faStream,
  faTasks,
  faClipboardCheck,
  faBox,
  faExchangeAlt,
  faChartBar,
  faMoon,
  faSun,
  faBars,
  faHandshake,
  faClipboard,
  faHistory,
  faSave,
  faCheck,
  faSearch,
  faPlus,
  faBell,
  faArrowRightArrowLeft,
  faCalendar,
  faCalendarWeek,
  faCalendarDay,
  faCalendarAlt,
  faUser,
  faUsersCog,
  faSignOutAlt,
  faEdit,
  faChartLine,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faListCheck,
  faSpinner,
  faFileAlt,
  faClipboardList,
  faCheckSquare,
  faList,
  faShoppingCart,
  faPaperPlane,
  faTimes,
  faCalendarCheck,
  faArrowUp,
  faArrowDown,
  faCamera
)

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ToastPlugin, {
  position: 'top-right',
  duration: 3000
})
app.use(ElementPlus)

// Font Awesome 컴포넌트 전역 등록
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app') 