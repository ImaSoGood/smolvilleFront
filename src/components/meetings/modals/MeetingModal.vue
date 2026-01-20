<template>
  <div class="modal" :class="{ active: isOpen }" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">×</button>
      
      <h2 class="modal-title">{{ meeting.title || 'Без названия' }}</h2>
      
      <div class="modal-subtitle">
        <span>{{ formatDate(meeting.date) }}</span> • 
        <span>{{ meeting.location || 'Не указано' }}</span>
      </div>
      
      <img 
        :src="meeting.image_url || 'https://via.placeholder.com/400x200/333/666?text=Событие'" 
        :alt="meeting.title"
        class="modal-image"
      >
      
      <p class="modal-description">{{ meeting.description || 'Описание отсутствует' }}</p>
      
      <div class="modal-actions">
        <button 
          v-if="meeting.map_link" 
          class="btn btn-secondary"
          @click="openMap"
        >
          На карте
        </button>
        
        <button 
          class="btn" 
          :class="attendButtonClass"
          @click="handleAttendClick"
          :disabled="isProcessing"
        >
          <span v-if="isProcessing">Загрузка...</span>
          <span v-else>{{ attendButtonText }}</span>
        </button>
      </div>
      
      <div class="modal-attendees">
        <span class="attendees-text">
          Идут: <span class="attendees-count">{{ attendeesCount }}</span> человек
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import { useMeetingStore } from '@/stores/meetingStore'
import { useTelegramStore } from '@/stores/telegramStore'

const props = defineProps({
  meeting: {
    type: Object,
    default: () => ({})
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const meetingStore = useMeetingStore()
const telegramStore = useTelegramStore()

const isProcessing = ref(false)
const isUserAttending = ref(false)
const attendeesCount = ref(0)

const attendButtonText = computed(() => {
  return isUserAttending.value ? 'Не пойду' : 'Я пойду!'
})

const attendButtonClass = computed(() => {
  return isUserAttending.value ? 'btn-secondary' : 'btn-primary'
})

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.meeting?.meet_token) {
    console.log('Модалка открылась, загружаем данные...')
    await loadMeetingData()
  }
}, { immediate: true }) // Добавьте immediate: true

watch(() => props.meeting?.meet_token, async (newToken) => {
  if (newToken && props.isOpen) {
    console.log('Meeting обновился, загружаем данные...')
    await loadMeetingData()
  }
})

async function loadMeetingData() {
  try {
    // Установите attendeesCount из пропсов
    attendeesCount.value = props.meeting.attendees_count || 0
    
    // Проверьте участие пользователя ТОЛЬКО если есть meet_token
    if (props.meeting?.meet_token) {
      const isAttending = await meetingStore.checkUserAttendance(props.meeting.meet_token)
      isUserAttending.value = isAttending
      console.log('Участие пользователя:', isAttending)
    }
    
    // Увеличивайте счетчик просмотров ТОЛЬКО если модалка открыта и есть meet_token
    if (props.isOpen && props.meeting?.meet_token) {
      await meetingStore.addMeetView(props.meeting.meet_token)
    }
  } catch (error) {
    console.error('Ошибка загрузки данных встречи:', error)
  }
}

function formatDate(dateStr) {
  return meetingStore.formatDate(dateStr)
}

function close() {
  telegramStore.hideBackButton()
  emit('close')
}

function openMap() {
  if (props.meeting.map_link) {
    telegramStore.openLink(props.meeting.map_link)
  }
}

async function handleAttendClick() {
  if (isProcessing.value) return
  isProcessing.value = true
  try {
    if (isUserAttending.value) {
      const confirm = window.confirm('Вы действительно не пойдете на мероприятие?')
      if (!confirm) {
        console.log('isProcessing: ' + isProcessing);
        isProcessing.value = false
        return
      }
      const success = await meetingStore.unattendMeeting(props.meeting.meet_token)
      if (success) {
        isUserAttending.value = false
        console.log('isProcessing: ' + isProcessing);
        attendeesCount.value = Math.max(0, attendeesCount.value - 1)
        telegramStore.showNotification('Вы больше не идете на мероприятие')
      }
    } else {
      const success = await meetingStore.attendMeeting(props.meeting.meet_token)
      if (success) {
        isUserAttending.value = true
        attendeesCount.value += 1
        telegramStore.showNotification('Отлично! Вы идете на мероприятие!')
      } else {
        telegramStore.showNotification('Вы уже записаны на это мероприятие!', 'warning')
      }
    }
  } catch (error) {
    console.error('Ошибка обработки участия:', error)
    telegramStore.showNotification('Ошибка при обработке запроса', 'error')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal.active {
  display: flex;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
}

.modal-subtitle {
  color: #888;
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
}

.modal-description {
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #fff;
  color: #000;
}

.btn-primary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-primary:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.btn-secondary {
  background: #333;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background: #444;
}

.modal-attendees {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #333;
}

.attendees-text {
  color: #888;
  font-size: 14px;
}

.attendees-count {
  color: #00ffcc;
  font-weight: 600;
}
</style>