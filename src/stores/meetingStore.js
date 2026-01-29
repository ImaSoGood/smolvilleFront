// src/stores/meetingStore.js
import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useTelegramStore } from './telegramStore'

export const useMeetingStore = defineStore('meetings', () => {
  const telegramStore = useTelegramStore()
  
  // Состояние
  const meetings = ref([])
  const loading = ref(true)
  const error = ref(null)
  const selectedMeeting = ref(null)
  const showCreateModal = ref(false)
  const serverAvailable = ref(true)
  
  // Геттеры
  const activeMeetings = computed(() => {
    return meetings.value.filter(meeting => {
      try {
        const meetingDate = new Date(meeting.date)
        const now = new Date()
        const isFuture = meetingDate > now
        // status: true = активна, false = завершена
        return isFuture && meeting.status !== false
      } catch (err) {
        return meeting.status !== false
      }
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  })
  
  const pastMeetings = computed(() => {
    return meetings.value.filter(meeting => {
      try {
        const meetingDate = new Date(meeting.date)
        const now = new Date()
        const isPast = meetingDate <= now || meeting.status === false
        return isPast
      } catch (err) {
        return meeting.status === false
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  })
  
  // Действия
  async function fetchMeetings() {
    loading.value = true
    error.value = null
    
    try {
      console.log('Загружаем встречи с сервера...')
      
      const response = await api.getMeetings()
      console.log('Ответ от сервера (встречи):', response)
      
      if (Array.isArray(response)) {
        meetings.value = processMeetings(response)
      } else if (response?.data && Array.isArray(response.data)) {
        meetings.value = processMeetings(response.data)
      } else {
        console.warn('Некорректный формат ответа:', response)
        throw new Error('Некорректный формат данных встреч')
      }
      
      console.log('Успешно загружено встреч:', meetings.value.length)
      
    } catch (err) {
      console.error('Ошибка загрузки встреч:', err)
      error.value = 'Не удалось загрузить встречи'
    } finally {
      loading.value = false
    }
  }
  
  function processMeetings(meetingsArray) {
    return meetingsArray.map(meeting => {
      console.log('Обрабатываем встречу:', meeting)
      
      // Исправляем URL изображения (добавляем baseURL если нужно)
      let imageUrl = meeting.image_url
      if (imageUrl && imageUrl.startsWith('/')) {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://hundredtries.ru/smolville/server'
        imageUrl = baseUrl + imageUrl
      }
      
      return {
        meet_token: meeting.meet_token,
        user_token_id: meeting.user_token_id,
        title: meeting.title || 'Без названия',
        description: meeting.description || '',
        date: meeting.date || new Date().toISOString(),
        type: meeting.type || 'Встреча',
        location: meeting.location || 'Не указано',
        age_limit: meeting.age_limit || 0,
        map_link: meeting.map_link || null,
        image_url: imageUrl || 'https://via.placeholder.com/400x200/333/666?text=Встреча',
        status: meeting.status !== false, // true = активна, false = завершена
        created_at: meeting.created_at,
        updated_at: meeting.updated_at,
        attendees_count: meeting.attendees_count ?? 0,
        view_count: meeting.view_count || 0,
        creator: meeting.creator,
        created_by: meeting.user_token_id || 'unknown'
      }
    })
  }
  
  function selectMeeting(meeting) {
    selectedMeeting.value = meeting
  }
  
  function clearSelectedMeeting() {
    selectedMeeting.value = null
  }
  
  function openCreateModal() {
    showCreateModal.value = true
  }
  
  function closeCreateModal() {
    showCreateModal.value = false
  }
  
  async function createMeeting(formData) {
    try {
      const userId = telegramStore.user?.id
      if (!userId) {
        telegramStore.showNotification('Войдите в систему', 'error')
        return false
      }
      
      console.log('Создание встречи:', formData)
      
      // Подготавливаем данные для отправки
      const meetingData = new FormData()
      
      // Добавляем текстовые поля
      meetingData.append('title', formData.title)
      meetingData.append('description', formData.description)
      meetingData.append('date', formData.date)
      meetingData.append('type', formData.type)
      meetingData.append('age_limit', formData.age_limit || 0)
      meetingData.append('location', formData.location)
      meetingData.append('map_link', formData.map_link || '')
      
      // Добавляем изображение если есть
      if (formData.image) {
        meetingData.append('file', formData.image)
      }
      
      // Добавляем user_id
      meetingData.append('user_id', telegramStore.user?.id || '0')
      meetingData.append('username', telegramStore.user?.username || 'Smolville_bot')
      
      // Отправляем на сервер
      const response = await api.createMeeting(meetingData)
      console.log('Ответ при создании встречи:', response)
      
      if (response.success) {
        // Обновляем список встреч
        await fetchMeetings()
        
        telegramStore.showNotification('Встреча успешно создана!')
        return { success: true, data: response.data }
      } else {
        telegramStore.showNotification(response.message)
      }
      
    } catch (error) {
      console.error('Ошибка создания встречи:', error)
      telegramStore.showNotification('Ошибка при создании встречи', 'error')
      return { success: false, message: error.message }
    }
  }
  
  async function attendMeeting(meetingToken) {
    try {
      const userId = telegramStore.user?.id
      if (!userId) {
        telegramStore.showNotification('Войдите в систему', 'error')
        return false
      }

      const response = await api.attendMeeting(meetingToken, userId)

      if (response.success) {
        // Обновляем локальное состояние
        const meeting = meetings.value.find(m => m.meet_token === meetingToken)
        if (meeting) {
          meeting.attendees_count += 1
        }

        telegramStore.showNotification('Вы присоединились к встрече!')
        return true
      } else {
        telegramStore.showNotification(response.message || 'Ошибка присоединения', 'error')
        return false
      }
    } catch (error) {
      console.error('Ошибка присоединения к встрече:', error)
      telegramStore.showNotification('Ошибка при присоединении', 'error')
      return false
    }
  }

  async function unattendMeeting(meetingToken) {
    try {
      const userId = telegramStore.user?.id
      if (!userId) {
        telegramStore.showNotification('Войдите в систему', 'error')
        return false
      }

      const response = await api.unattendMeeting(meetingToken, userId)

      if (response.success) {
        // Обновляем локальное состояние
        const meeting = meetings.value.find(m => m.meet_token === meetingToken)
        if (meeting && meeting.attendees_count > 0) {
          meeting.attendees_count -= 1
        }

        telegramStore.showNotification('Вы вышли из встречи')
        return true
      } else {
        telegramStore.showNotification(response.message || 'Ошибка выхода', 'error')
        return false
      }
    } catch (error) {
      console.error('Ошибка выхода из встречи:', error)
      telegramStore.showNotification('Ошибка при выходе', 'error')
      return false
    }
  }

  async function getMeetingCreator(meetingToken) {
    try {
      const response = await api.getMeetingCreator(meetingToken)
      console.log('Ответ getMeetingCreator:', response)

      // Ожидаем ответ в формате: { "username": "Smolville_bot" }
      if (response && response.username) {
        return response.username
      }

      console.warn('Некорректный формат ответа:', response)
      return null

    } catch (error) {
      console.error('Ошибка получения создателя встречи:', error)
      return null
    }
  }

  async function checkUserAttendance(meetingToken) {
    try {
      const userId = telegramStore.user?.id || '0'

      console.log('checkUserAttendance запрос:', { meetingToken, userId })

      const response = await api.checkMeetingAttendance(meetingToken, userId)
      console.log('checkUserAttendance ответ:', response)

      // Если ответ уже содержит is_attending напрямую
      if (typeof response.is_attending !== 'undefined') {
        return response.is_attending
      }

    } catch (error) {
      console.error('Ошибка проверки участия:', error)
      return false
    }
  }

  async function addMeetView(meetingToken) {
    try {
      const userId = telegramStore.user?.id
      if (!userId) return false

      // Отправляем запрос на увеличение просмотров
      await api.addMeetView(meetingToken, userId)

      // Локально увеличиваем счетчик просмотров
      const meeting = meetings.value.find(m => m.meet_token === meetingToken)
      if (meeting) {
        meeting.view_count += 1
      }

      return true
    } catch (error) {
      console.error('Ошибка увеличения просмотров:', error)
      return false
    }
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return 'Без даты'
    try {
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
      const date = new Date(dateStr)
      const now = new Date()
      
      // Если сегодня
      if (date.toDateString() === now.toDateString()) {
        return `Сегодня, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
      
      // Если завтра
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      if (date.toDateString() === tomorrow.toDateString()) {
        return `Завтра, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
      
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } catch (err) {
      console.error('Ошибка форматирования даты:', err, dateStr)
      return 'Неверная дата'
    }
  }
  
  function formatAgeLimit(ageLimit) {
    return ageLimit > 0 ? `${ageLimit}+` : 'Без ограничений'
  }
  
  function getStatusBadgeStyle(isCompleted) {
    return isCompleted 
      ? { background: 'rgba(107, 114, 128, 0.9)', color: 'white' }
      : { background: 'rgba(59, 130, 246, 0.9)', color: 'white' }
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
    console.log('MeetingStore инициализируется')
    await fetchMeetings()
  })
  
  return {
    // Состояние
    meetings,
    loading,
    error,
    selectedMeeting,
    showCreateModal,
    serverAvailable,
    
    // Геттеры
    activeMeetings,
    pastMeetings,
    
    // Действия
    fetchMeetings,
    selectMeeting,
    clearSelectedMeeting,
    openCreateModal,
    closeCreateModal,
    createMeeting,
    attendMeeting,       
    unattendMeeting,     
    checkUserAttendance, 
    addMeetView,         
    formatDate,
    formatAgeLimit,
    getStatusBadgeStyle,
    getAttendeesBadgeStyle,

    getMeetingCreator
  }
})