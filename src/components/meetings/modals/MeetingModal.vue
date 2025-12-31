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
      
      <div class="modal-attendees">
        <span class="attendees-text">
          Идут: <span class="attendees-count">{{ meeting.attendees_count || 0 }}</span> человек
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
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

async function handleSubmit() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Проверяем обязательные поля
    if (!form.value.title.trim()) {
      throw new Error('Введите название встречи')
    }
    if (!form.value.description.trim()) {
      throw new Error('Введите описание встречи')
    }
    if (!form.value.date) {
      throw new Error('Выберите дату и время')
    }
    if (!form.value.type) {
      throw new Error('Выберите тип встречи')
    }
    if (!form.value.location.trim()) {
      throw new Error('Введите место проведения')
    }
    
    const result = await meetingStore.createMeeting(form.value)
    
    if (result.success) {
      telegramStore.showNotification('Встреча успешно создана!')
      emit('created', result.data)
      close()
    } else {
      throw new Error(result.message || ' встречи')
    }
  } catch (error) {
    console.error('Ошибка создания встречи:', error)
    telegramStore.showNotification(error.message, 'error')
  } finally {
    isSubmitting.value = false
  }
}

async function handleAttendClick() {
  if (isProcessing.value || isCompleted.value) return
  
  isProcessing.value = true
  
  try {
    // Используем meet_token вместо id
    const success = await meetingStore.attendMeeting(props.meeting.meet_token)
    
    if (success) {
      // Закрываем модалку через 1.5 секунды
      setTimeout(() => {
        close()
      }, 1500)
    }
  } catch (error) {
    console.error('Ошибка присоединения к встрече:', error)
    telegramStore.showNotification('Ошибка при присоединении', 'error')
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
</style>