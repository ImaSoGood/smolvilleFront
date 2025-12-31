<template>
  <div id="app">
    <RouterView />
    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import BottomNav from '@/components/shared/BottomNav.vue'

const route = useRoute()

// Показываем нижнюю навигацию на всех страницах, кроме возможных исключений
const showBottomNav = computed(() => {
  return true // Всегда показываем, или можно добавить исключения
})
</script>

<style>
/* Глобальные стили уже в style.css */
</style>