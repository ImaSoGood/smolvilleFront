<!-- src/components/meetings/MeetingCard.vue -->
<template>
  <div 
    class="event-card" 
    :class="{ completed: isCompleted }"
    @click="!isCompleted && handleCardClick()"
  >
    <div class="event-img-wrapper">
      <img 
        :src="meeting.image_url || 'https://via.placeholder.com/480x180/333/666?text=Встреча'" 
        :alt="meeting.title" 
        class="event-img"
        loading="lazy"
        @error="handleImageError"
      >
      <div class="gradient-overlay"></div>
      
      <!-- Бейдж участников -->
      <div 
        class="attendees-badge" 
        :style="attendeesBadgeStyle"
        :class="{ pulse: meeting.attendees_count > 0 }"
      >
        {{ meeting.attendees_count }} идут
      </div>
      
      <!-- Бейдж статуса -->
      <div 
        class="status-badge" 
        :style="statusBadgeStyle"
      >
        {{ isCompleted ? 'ЗАВЕРШЕНО' : 'ВСТРЕЧА' }}
      </div>
    </div>
    
    <div class="event-content">
      <div class="event-tag">{{ meeting.type || 'ВСТРЕЧА' }}</div>
      <h3 class="event-title">{{ meeting.title || 'Без названия' }}</h3>
      <div class="event-date">{{ formatDate(meeting.date) }}</div>
      
      <div class="meeting-details">
        <div class="detail-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
          </svg>
          <span>{{ meeting.location || 'Место не указано' }}</span>
        </div>
        
        <div v-if="meeting.age_limit" class="detail-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>{{ formatAgeLimit(meeting.age_limit) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- src/components/meetings/MeetingCard.vue - обновляем script setup -->
<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useMeetingStore } from '@/stores/meetingStore'

const props = defineProps({
  meeting: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const meetingStore = useMeetingStore()

const isCompleted = computed(() => {
  // status: true = активна, false = завершена
  return props.meeting.status === false
})

const attendeesBadgeStyle = computed(() => {
  const count = props.meeting.visit_count || 0 // Используем visit_count
  return meetingStore.getAttendeesBadgeStyle(count)
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

function handleCardClick() {
  if (!isCompleted.value) {
    emit('click', props.meeting)
  }
}

function handleImageError(event) {
  console.error('Ошибка загрузки изображения:', props.meeting.image_url)
  event.target.src = 'https://via.placeholder.com/480x180/333/666?text=Ошибка+загрузки'
}
</script>

<style scoped>
.completed {
  opacity: 0.7;
  cursor: not-allowed;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.meeting-details {
  margin-top: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.detail-item svg {
  flex-shrink: 0;
}
</style>