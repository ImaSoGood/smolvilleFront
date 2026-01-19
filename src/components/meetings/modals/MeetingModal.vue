<!-- src/components/meetings/modals/MeetingModal.vue -->
<template>
  <div class="modal" :class="{ active: isOpen }" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">×</button>
      
      <h2 class="modal-title">{{ meeting.title || 'Без названия' }}</h2>
      
      <div class="modal-subtitle">
        <span>{{ formatDate(meeting.date) }}</span> • 
        <span>{{ meeting.location || 'Место не указано' }}</span> • 
        <span>{{ formatAgeLimit(meeting.age_limit) }}</span>
      </div>
      
      <img 
        :src="meeting.image_url || 'https://via.placeholder.com/400x200/333/666?text=Встреча'" 
        :alt="meeting.title"
        class="modal-image"
      >
      
      <div class="modal-badges">
        <span class="event-tag">{{ meeting.type || 'ВСТРЕЧА' }}</span>
        <span class="status-badge" :style="statusBadgeStyle">
          {{ isCompleted ? 'ЗАВЕРШЕНО' : 'АКТИВНО' }}
        </span>
      </div>
      
      <p class="modal-description">{{ meeting.description || 'Описание отсутствует' }}</p>
      
      <div class="modal-actions">
        <button 
          v-if="meeting.map_link" 
          class="btn btn-secondary"
          @click="openMap"
          style="display: flex; align-items: center; justify-content: center;"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
          </svg>
          На карте
        </button>
        
        <button 
          class="btn" 
          :class="attendButtonClass"
          @click="handleAttendClick"
          :disabled="isProcessing || isCompleted"
        >
          <span v-if="isProcessing">Загрузка...</span>
          <span v-else>{{ attendButtonText }}</span>
        </button>
      </div>
      <div class="modal-stats">
        <span class="attendees-text">
          Идут: <span class="attendees-count">{{ meeting.attendees_count || 0 }}</span> человек
        </span>
        <span class="views-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"
            style="vertical-align: middle; margin-right: 4px;">
            <path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          {{ meeting.view_count || 0 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import { useMeetingStore } from '@/stores/meetingStore'
import { useTelegramStore } from '@/stores/telegramStore'
import { onMounted } from 'vue'

onMounted(async () => {
  if (props.meeting.meet_token) {
    // Отправляем запрос об увеличении просмотров
    await meetingStore.addMeetView(props.meeting.meet_token)
    
    // Загружаем статус участия пользователя
    await loadUserAttendance()
  }
})

async function loadUserAttendance() {
  try {
    isUserAttending.value = await meetingStore.checkUserAttendance(props.meeting.meet_token)
    attendeesCount.value = props.meeting.attendees_count || 0 // ← ДОБАВЬ
  } catch (error) {
    console.error('Ошибка проверки участия:', error)
  }
}

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
const isUserAttending = ref(false) // ← ДОБАВЬ
const attendeesCount = ref(0) // ← ДОБАВЬ
const isSubmitting = ref(false) // ← ДОБАВЬ если используется

const isCompleted = computed(() => {
  return props.meeting.status === false
})

const attendButtonText = computed(() => {
  if (isCompleted.value) return 'Встреча завершена'
  return 'Я пойду!'
})

const attendButtonClass = computed(() => {
  if (isCompleted.value) return 'btn-disabled'
  return 'btn-primary'
})

const statusBadgeStyle = computed(() => {
  return meetingStore.getStatusBadgeStyle(isCompleted.value)
})

function formatDate(dateStr) {
  return meetingStore.formatDate(dateStr)
}

function formatAgeLimit(ageLimit) {
  return meetingStore.formatAgeLimit(ageLimit)
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
  if (isProcessing.value || isCompleted.value) return
  
  isProcessing.value = true
  
  try {
    if (isUserAttending.value) {
      // Отмена участия
      const confirm = window.confirm('Вы действительно не пойдете на встречу?')
      if (!confirm) {
        isProcessing.value = false
        return
      }
      
      const success = await meetingStore.unattendMeeting(props.meeting.meet_token)
      if (success) {
        isUserAttending.value = false
        attendeesCount.value = Math.max(0, attendeesCount.value - 1)
        telegramStore.showNotification('Вы вышли из встречи')
      }
    } else {
      // Запись на участие
      const success = await meetingStore.attendMeeting(props.meeting.meet_token)
      if (success) {
        isUserAttending.value = true
        attendeesCount.value += 1
        telegramStore.showNotification('Вы присоединились к встрече!')
      } else {
        telegramStore.showNotification('Вы уже записаны на эту встречу!', 'warning')
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
.modal-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.btn-disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.modal-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attendees-text {
  color: #888;
  font-size: 14px;
}

.attendees-count {
  color: #00ffcc;
  font-weight: 600;
}

.views-text {
  color: #888;
  font-size: 14px;
  display: flex;
  align-items: center;
}
</style>