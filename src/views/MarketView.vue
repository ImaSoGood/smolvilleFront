<template>
  <div class="container">
    <!-- Логотип -->
    <div class="logo">
      <img src="@/assets/logo.PNG" alt="Смок Вилле" @error="handleImageError">
    </div>
    
    <!-- Заголовок раздела -->
    <h1 style="color: white; margin-bottom: 20px; text-align: center;">Маркет</h1>
    
    <!-- Контент маркета -->
    <div class="market-container">
      <div class="placeholder-section">
        <div class="placeholder-icon">🛒</div>
        <div class="placeholder-text">Маркетплейс</div>
        <div class="placeholder-subtext">Скоро здесь появится магазин мерча и автозапчастей</div>
      </div>
    </div>
  </div>
</template>

<script setup>
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