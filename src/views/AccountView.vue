<template>
  <div class="container">
    <!-- Логотип -->
    <div class="logo">
      <img src="@/assets/logo.PNG" alt="Смок Вилле" @error="handleImageError">
    </div>
    
    <!-- Заголовок раздела -->
    <h1 style="color: white; margin-bottom: 20px; text-align: center;">Аккаунт</h1>
    
    <!-- Информация о пользователе -->
    <div class="user-info" style="background: #1a1a1a; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="width: 60px; height: 60px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#888">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div>
          <h3 style="color: white; margin-bottom: 5px;">Пользователь</h3>
          <p style="color: #888; font-size: 14px;">ID: {{ userId }}</p>
        </div>
      </div>
    </div>
    
    <!-- Контент аккаунта -->
    <div class="account-container">
      <div class="placeholder-section">
        <div class="placeholder-icon">👤</div>
        <div class="placeholder-text">Личный кабинет</div>
        <div class="placeholder-subtext">Скоро здесь можно будет управлять профилем и настройками</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTelegramStore } from '@/stores/telegramStore'

const telegramStore = useTelegramStore()

const userId = telegramStore.user?.id || 'Неизвестно'

function handleImageError(event) {
  event.target.style.display = 'none'
}
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 100px; /* Для нижней навигации */
}

.logo {
  text-align: center;
  margin: 16px 0 20px;
}

.logo img {
  height: 60px;
  width: auto;
  object-fit: contain;
}
</style>