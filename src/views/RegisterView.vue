<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <img src="@/assets/ci-kor-img.png" alt="일광금속" />
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group">
          <input 
            type="text" 
            v-model="formData.username" 
            placeholder="사용자 ID"
            class="modern-input"
            required
            @focus="handleEnglishInput"
            autocomplete="username"
          />
        </div>

        <div class="input-group">
          <input 
            type="password" 
            v-model="formData.password" 
            placeholder="비밀번호"
            class="modern-input"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="input-group">
          <input 
            type="text" 
            v-model="formData.name" 
            placeholder="이름"
            class="modern-input"
            required
            autocomplete="name"
          />
        </div>

        <div class="input-group">
          <input 
            type="email" 
            v-model="formData.email" 
            placeholder="이메일"
            class="modern-input"
            required
            @input="validateEmail"
            @focus="handleEmailFocus"
            autocomplete="email"
            title="유효한 이메일 주소를 입력해주세요"
          />
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <div class="input-group">
          <input 
            type="text" 
            v-model="formData.factory" 
            placeholder="공장"
            class="modern-input korean-input"
            required
            @focus="handleKoreanInput"
            @input="validateKorean($event, 'factory')"
            autocomplete="organization"
          />
        </div>

        <div class="input-group">
          <input 
            type="text" 
            v-model="formData.department" 
            placeholder="부서"
            class="modern-input korean-input"
            required
            @focus="handleKoreanInput"
            @input="validateKorean($event, 'department')"
            autocomplete="organization-title"
          />
        </div>

        <div class="input-group">
          <input 
            type="text" 
            v-model="formData.position" 
            placeholder="직책"
            class="modern-input korean-input"
            required
            @focus="handleKoreanInput"
            @input="validateKorean($event, 'position')"
            autocomplete="organization-title"
          />
        </div>

        <div class="button-group">
          <button type="button" class="register-button" @click="goToLogin">돌아가기</button>
          <button type="submit" class="login-button">가입하기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'

const router = useRouter()

const formData = ref({
  username: '',
  password: '',
  name: '',
  email: '',
  factory: '',
  department: '',
  position: ''
})

const emailError = ref('')

const validateEmail = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value
  
  // 영문, 숫자, 특수문자만 허용하는 정규식
  const validChars = /^[a-zA-Z0-9.@_+-]+$/
  
  if (!validChars.test(value)) {
    formData.value.email = value.replace(/[^a-zA-Z0-9.@_+-]/g, '')
  }
  
  // 이메일 형식 검사
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  emailError.value = emailRegex.test(value) ? '' : '유효한 이메일 주소를 입력해주세요'
}

const handleEnglishInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  // inputmode 속성 사용
  input.setAttribute('inputmode', 'email')
  // -webkit-ime-mode 스타일 적용
  input.style.setProperty('-webkit-ime-mode', 'disabled')
  input.style.setProperty('ime-mode', 'disabled')
}

const handleEmailFocus = (event: Event) => {
  handleEnglishInput(event)
}

const validateKorean = (event: Event, field: 'factory' | 'department' | 'position') => {
  const input = event.target as HTMLInputElement
  const value = input.value
  
  // 한글, 영문, 숫자, 공백만 허용
  const validChars = /^[가-힣a-zA-Z0-9\s]*$/
  
  if (!validChars.test(value)) {
    formData.value[field] = value.replace(/[^가-힣a-zA-Z0-9\s]/g, '')
  }
}

const handleKoreanInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.setAttribute('inputmode', 'text')
  input.setAttribute('lang', 'ko')
}

const handleSubmit = async () => {
  try {
    const response = await register(formData.value)
    alert(response.message)
    router.push('/login')
  } catch (error: any) {
    alert(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f7;
}

.login-box {
  width: 100%;
  max-width: 380px;
  padding: 2.5rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.logo-section {
  text-align: center;
  margin-bottom: 2.5rem;
  
  img {
    height: 32px;
    width: auto;
  }
}

.login-form {
  .input-group {
    margin-bottom: 1rem;
  }

  .modern-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    background: #f8f8f8;
    box-sizing: border-box;
    
    &::placeholder {
      color: #999;
    }

    &:focus {
      outline: none;
      border-color: #007AFF;
      background: white;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
  }

  .button-group {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .login-button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: #007AFF;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #0066d6;
    }
  }

  .register-button {
    flex: 1;
    padding: 12px;
    border: 1px solid #007AFF;
    border-radius: 8px;
    background: white;
    color: #007AFF;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f0f0f0;
    }
  }
}

@media (max-width: 480px) {
  .login-box {
    margin: 1rem;
    padding: 2rem;
  }
}

.error-message {
  color: #ff3b30;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.korean-input {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
  &::placeholder {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
  }
}
</style> 