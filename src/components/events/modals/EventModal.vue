<template>
  <div class="modal" :class="{ active: isOpen }" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">×</button>
      
      <h2 class="modal-title">{{ event.title || 'Без названия' }}</h2>
      
      <div class="modal-subtitle">
        <span>{{ formatDate(event.date) }}</span> • 
        <span>{{ event.location || 'Не указано' }}</span>
      </div>
      
      <img 
        :src="event.image_url || 'https://via.placeholder.com/400x200/333/666?text=Событие'" 
        :alt="event.title"
        class="modal-image"
      >
      
      <p class="modal-description">{{ event.description || 'Описание отсутствует' }}</p>
      
      <div class="modal-actions">
        <button 
          v-if="event.map_link" 
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
import { defineProps, defineEmits, ref, computed, watch, onMounted } from 'vue'
import { useEventStore } from '@/stores/eventStore'
import { useTelegramStore } from '@/stores/telegramStore'

const props = defineProps({
  event: {
    type: Object,
    default: () => ({})
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const eventStore = useEventStore()
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

onMounted(async () => {
  if (props.event.id) {
    await loadEventData()
  }
})

watch(() => props.event.id, async (newId) => {
  if (newId) {
    await loadEventData()
  }
})

async function loadEventData() {
  try {
    // Загружаем количество участников
    attendeesCount.value = props.event.attendees_count || 0
    
    // Проверяем участие пользователя
    isUserAttending.value = await eventStore.checkUserAttendance(props.event.id)
  } catch (error) {
    console.error('Ошибка загрузки данных события:', error)
  }
}

function formatDate(dateStr) {
  return eventStore.formatDate(dateStr)
}

function close() {
  telegramStore.hideBackButton()
  emit('close')
}

function openMap() {
  if (props.event.map_link) {
    telegramStore.openLink(props.event.map_link)
  }
}

async function handleAttendClick() {
  if (isProcessing.value) return
  
  isProcessing.value = true
  
  try {
    if (isUserAttending.value) {
      // Отмена участия
      const confirm = window.confirm('Вы действительно не пойдете на мероприятие?')
      if (!confirm) {
        isProcessing.value = false
        return
      }
      
      const success = await eventStore.unattendEvent(props.event.id)
      if (success) {
        isUserAttending.value = false
        attendeesCount.value = Math.max(0, attendeesCount.value - 1)
        telegramStore.showNotification('Вы больше не идете на мероприятие')
      }
    } else {
      // Запись на участие
      const success = await eventStore.attendEvent(props.event.id)
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