<template>
  <div class="event-card" @click="handleCardClick">
    <div class="event-img-wrapper">
      <img 
        :src="event.image_url || 'https://via.placeholder.com/480x180/333/666?text=Событие'" 
        :alt="event.title" 
        class="event-img"
        loading="lazy"
      >
      <div class="gradient-overlay"></div>
      
      <!-- Бейдж участников -->
      <div 
        class="attendees-badge" 
        :style="attendeesBadgeStyle"
        :class="{ pulse: event.attendees_count > 0 }"
      >
        {{ event.attendees_count }} идут
      </div>
    </div>
    
    <div class="event-content">
      <div class="event-tag">{{ event.type || 'СОБЫТИЕ' }}</div>
      <h3 class="event-title">{{ event.title || 'Без названия' }}</h3>
      <div class="event-date">{{ formatDate(event.date) }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useEventStore } from '@/stores/eventStore'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const eventStore = useEventStore()

const attendeesBadgeStyle = computed(() => {
  const count = props.event.attendees_count || 0
  return eventStore.getAttendeesBadgeStyle(count)
})

function formatDate(dateStr) {
  return eventStore.formatDate(dateStr)
}

function handleCardClick() {
  emit('click', props.event)
}
</script>

<style scoped>
.event-card {
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-img-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.event-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-card:hover .event-img {
  transform: scale(1.03);
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 50%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.attendees-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.attendees-badge.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.event-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  z-index: 2;
}

.event-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.3;
}

.event-tag {
  display: inline-block;
  background: #e91e63;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.event-date {
  font-size: 13px;
  color: #ccc;
  font-weight: 500;
}
</style>