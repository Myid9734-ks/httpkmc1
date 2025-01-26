<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <img src="@/assets/ci-kor-img.png" alt="일광금속" />
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <input 
            type="text" 
            v-model="username"
            placeholder="아이디를 입력하세요"
            class="modern-input"
            required
            autocomplete="username"
          />
        </div>

        <div class="input-group">
          <input 
            type="password" 
            v-model="password"
            placeholder="비밀번호를 입력하세요"
            class="modern-input"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="button-group">
          <button type="submit" class="login-button">로그인</button>
          <button type="button" class="register-button" @click="goToRegister">회원가입</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    // 입력값 검증
    if (!username.value || !password.value) {
      alert('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    console.log('[로그인 시도 - View]', {
      inputUsername: username.value,
      inputPassword: password.value,
      credentials: {
        username: username.value?.trim(),
        password: password.value?.trim()
      }
    })

    // 로그인 시도
    await authStore.login({
      username: username.value.trim(),
      password: password.value.trim()
    })

  } catch (error) {
    console.error('[로그인 에러]', error)
    alert(error.response?.data?.message || '로그인 중 오류가 발생했습니다.')
  }
}

const goToRegister = () => {
  router.push('/register')
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
</style> 