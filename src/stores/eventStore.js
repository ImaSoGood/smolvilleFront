import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useTelegramStore } from './telegramStore'

export const useEventStore = defineStore('events', () => {
  const telegramStore = useTelegramStore()
  
  // Состояние (state)
  const events = ref([])
  const loading = ref(true)
  const error = ref(null)
  const activeFilter = ref('all') // 'all', 'Спорт', 'Выставки'
  const activeTab = ref('future') // 'future', 'past'
  const selectedEvent = ref(null)
  const serverAvailable = ref(true)
  const serverStatusMessage = ref('')
  
  // Геттеры (computed properties)
  const filteredEvents = computed(() => {
    if (!events.value.length) return []
    
    return events.value.filter(event => {
      // Фильтр по категории
      const matchesFilter = activeFilter.value === 'all' || 
                          event.type === activeFilter.value
      
      // Фильтр по времени (будущие/прошедшие)
      const eventDate = new Date(event.date)
      const now = new Date()
      const isFuture = eventDate > now
      
      const matchesTab = activeTab.value === 'future' ? isFuture : !isFuture
      
      return matchesFilter && matchesTab
    })
  })
  
  // Действия (actions)
  // Действия
  async function fetchEvents() {
    loading.value = true
    error.value = null
    
    try {
      await checkServerStatus()
      
      if (!serverAvailable.value) {
        await loadMockEvents()
        return
      }
      
      // Загружаем события
      const response = await api.getEvents()
      // Из вашего лога видно, что response.data содержит массив
      if (response && Array.isArray(response)) {
        events.value = response.map(event => ({
          ...event,
          attendees_count: event.attendees_count || 0,
        }))
      } else if (response && response.data && Array.isArray(response.data)) {
        events.value = response.data.map(event => ({
          ...event,
          attendees_count: event.attendees_count || 0,
        }))
      } else {
        console.warn('Некорректный формат ответа:', response)
        // Не выбрасываем ошибку, используем моковые данные
        await loadMockEvents()
      }
      
    } catch (err) {
      console.error('Ошибка в fetchEvents:', err)
      error.value = 'Не удалось загрузить события'
      // Не выбрасываем ошибку дальше, используем моковые данные
      await loadMockEvents()
    } finally {
      loading.value = false
    }
  }
  
  async function loadMockEvents() {
    events.value = [
      {
        id: 1,
        title: 'Горячий Лёд 2026 - 1 Этап',
        type: 'Спорт',
        date: '2026-01-18T09:00:00.000000Z',
        location: 'с. Охотское, Карьер «Охотский»',
        image_url: 'https://hundredtries.ru/smolville/server/images/1.jpeg',
        description: 'Открытие серии Горячий Лёд',
        map_link: 'https://2gis.ru/yuzhnosakhalinsk/geo/70030076320940240',
        attendees_count: 43,
      },
      {
        id: 2,
        title: 'Горячий Лёд 2026 - 2 Этап',
        type: 'Спорт',
        date: '2026-02-01T09:00:00.000000Z',
        location: 'с. Охотское, Карьер «Охотский»',
        image_url: 'https://hundredtries.ru/smolville/server/images/2.jpeg',
        description: 'Продолжение гоночных разборок на льду',
        map_link: 'https://2gis.ru/yuzhnosakhalinsk/geo/70030076320940240',
        attendees_count: 14
      }
    ]
  }

  async function checkServerStatus() {
    try {
      const status = await api.getStatus()
      
      if (status.available === 0) {
        serverAvailable.value = false
        serverStatusMessage.value = status.status || 'Технические работы'
      } else {
        serverAvailable.value = true
        serverStatusMessage.value = ''
      }
    } catch (err) {
      serverAvailable.value = false
      serverStatusMessage.value = 'Ошибка соединения'
    }
  }
  
  function setFilter(filter) {
    activeFilter.value = filter
  }
  
  function setTab(tab) {
    activeTab.value = tab
  }
  
  function selectEvent(event) {
    selectedEvent.value = event
  }
  
  function clearSelectedEvent() {
    selectedEvent.value = null
  }
  
  async function attendEvent(eventId) {
    try {
      const userId = telegramStore.user.id
      const response = await api.attendEvent(eventId, userId)
      
      if (response.success) {
        // Обновляем количество участников
        const event = events.value.find(e => e.id === eventId)
        if (event) {
          event.attendees_count = (event.attendees_count || 0) + 1
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка записи на событие:', error)
      return false
    }
  }
  
  async function unattendEvent(eventId) {
    try {
      const userId = telegramStore.user.id
      const response = await api.unattendEvent(eventId, userId)
      
      if (response.success) {
        // Обновляем количество участников
        const event = events.value.find(e => e.id === eventId)
        if (event && event.attendees_count > 0) {
          event.attendees_count -= 1
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка отмены записи:', error)
      return false
    }
  }
  
  async function checkUserAttendance(eventId) {
    try {
      const userId = telegramStore.user.id
      const response = await api.checkUserAttendance(eventId, userId)
      
      if (response) {
        return response.is_attending || false
      }
      return false
    } catch (error) {
      console.error('Ошибка проверки участия:', error)
      return false
    }
  }
  
  async function getEventAttendeesCount(eventId) {
    try {
      const response = await api.getEventAttendeesCount(eventId)
      
      if (response) {
        console.log('ОТВЕТ: ', response)
        return response.count || 0
      }
      return 0
    } catch (error) {
      console.error('Ошибка загрузки участников:', error)
      return 0
    }
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return 'Без даты'
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    const date = new Date(dateStr)
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }
  
  function getAttendeesBadgeStyle(count) {
    if (count === 0) {
      return { background: 'rgba(255, 255, 255, 0.3)', color: '#fff' }
    } else if (count < 5) {
      return { background: 'rgba(0, 255, 204, 0.9)', color: '#000' }
    } else if (count < 15) {
      return { background: 'rgba(255, 152, 0, 0.9)', color: '#000' }
    } else {
      return { background: 'rgba(233, 30, 99, 0.9)', color: '#fff' }
    }
  }
  
  // Инициализация
  onMounted(async () => {
    await fetchEvents()
  })
  
  return {
    // Состояние
    events,
    loading,
    error,
    activeFilter,
    activeTab,
    selectedEvent,
    serverAvailable,
    serverStatusMessage,
    
    // Геттеры
    filteredEvents,
    
    // Действия
    fetchEvents,
    setFilter,
    setTab,
    selectEvent,
    clearSelectedEvent,
    attendEvent,
    unattendEvent,
    checkUserAttendance,
    getEventAttendeesCount,
    formatDate,
    getAttendeesBadgeStyle
  }
})