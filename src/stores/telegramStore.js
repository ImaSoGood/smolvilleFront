import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export const useTelegramStore = defineStore('telegram', () => {
  const tg = ref(null)
  const user = ref({ id: 0, first_name: 'Гость' })
  const isReady = ref(false)
  
  function initTelegram() {
    if (window.Telegram?.WebApp) {
      tg.value = window.Telegram.WebApp
      tg.value.ready()
      tg.value.expand()
      
      if (tg.value.initDataUnsafe?.user) {
        user.value = tg.value.initDataUnsafe.user
      }
      
      isReady.value = true
      return true
    } else {
      console.error('Telegram WebApp not found')
      return false
    }
  }
  
  function showBackButton(callback) {
    if (tg.value) {
      tg.value.BackButton.show()
      tg.value.BackButton.onClick(callback)
    }
  }
  
  function hideBackButton() {
    if (tg.value) {
      tg.value.BackButton.hide()
    }
  }
  
  function openLink(url) {
    if (tg.value) {
      tg.value.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }
  
  function showNotification(message, type = 'success') {
    // В реальном приложении можно использовать tg.HapticFeedback
    alert(message) // временно
  }
  
  onMounted(() => {
    initTelegram()
  })
  
  return {
    tg,
    user,
    isReady,
    initTelegram,
    showBackButton,
    hideBackButton,
    openLink,
    showNotification
  }
})