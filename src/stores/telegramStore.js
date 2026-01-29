import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export const useTelegramStore = defineStore('telegram', () => {
  const user = ref({ id: 0, first_name: 'Гость' })
  const isReady = ref(false)
  
  function initTelegram() {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      if (tg.initDataUnsafe?.user) {
        user.value = tg.initDataUnsafe.user
      }
      
      isReady.value = true
      return true
    } else {
      console.error('Telegram WebApp not found')
      return false
    }
  }
  
  function showBackButton(callback) {
    if (window.Telegram?.WebApp?.BackButton) {
      try {
        const tg = window.Telegram.WebApp
        tg.BackButton.show()
        tg.BackButton.onClick(callback)
      } catch (error) {
        console.warn('Telegram BackButton error:', error)
      }
    }
  }
  
  function hideBackButton() {
    if (window.Telegram?.WebApp?.BackButton) {
      try {
        window.Telegram.WebApp.BackButton.hide()
      } catch (error) {
        console.warn('Telegram BackButton hide error:', error)
      }
    }
  }
  
  function openLink(url) {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }
  
  function showNotification(message, type = 'success') {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp

      // Тактильная обратная связь (если есть)
      if (tg.HapticFeedback) {
        try {
          tg.HapticFeedback.notificationOccurred(
            type === 'error' ? 'error' :
              type === 'warning' ? 'warning' : 'success'
          )
        } catch (e) {
          // Игнорируем ошибки haptic feedback
        }
      }

      // Показываем всплывающее окно Telegram
      if (tg.showPopup) {
        try {
          tg.showPopup({
            title: 'Уведомление',  // Всегда "Уведомление"
            message: message,
            buttons: [{ type: 'ok', text: 'OK' }]
          }, () => {
            // Колбек после закрытия (опционально)
          })
          return
        } catch (e) {
          console.warn('Telegram popup error:', e)
        }
      }
    }

    // Fallback на обычный alert
    alert(message)
  }
  
  onMounted(() => {
    initTelegram()
  })
  
  return {
    user,
    isReady,
    initTelegram,
    showBackButton,
    hideBackButton,
    openLink,
    showNotification
  }
})