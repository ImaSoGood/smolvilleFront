<template>
  <div class="container">
    <!-- Логотип -->
    <div class="logo">
      <img src="@/assets/logo.PNG" alt="Смок Вилле" @error="handleImageError">
    </div>
    
    <!-- Навигация по категориям -->
    <EventNav />
    
    <!-- Вкладки Будущие/Прошедшие -->
    <div class="tabs" id="eventsTabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'future' }"
        @click="setTab('future')"
      >
        Будущие
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'past' }"
        @click="setTab('past')"
      >
        Прошедшие
      </div>
      <div 
        class="tab-indicator" 
        :style="{ transform: `translateX(${activeTab === 'future' ? '0' : '100%'})` }"
      ></div>
    </div>
    
    <!-- Секция событий -->
    <div class="events-section">
      <!-- Ошибка сервера -->
      <div v-if="!serverAvailable" class="server-error">
        <img 
          :src="`${BACKEND_URL}/images/SERVERWORKS.gif`" 
          alt="Технические работы" 
          class="server-error-image"
        >
        <h3>{{ serverStatusMessage || 'Ведутся технические работы' }}</h3>
        <p>Мы улучшаем приложение для вашего удобства.<br>Скоро всё заработает!</p>
        <button class="btn btn-primary" @click="reload">Обновить</button>
      </div>
      
      <!-- Состояние загрузки -->
      <div v-else-if="loading" class="loading-container">
        <div class="skeleton skeleton-card" v-for="n in 3" :key="n"></div>
      </div>
      
      <!-- Состояние ошибки -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error }}</div>
        <button class="btn btn-primary" @click="fetchEvents">
          Попробовать снова
        </button>
      </div>
      
      <!-- Пустое состояние -->
      <div v-else-if="!filteredEvents.length" class="empty-container">
        <div class="empty-icon">📅</div>
        <div class="empty-text">
          {{ activeTab === 'future' ? 'Будущих событий пока нет' : 'Прошедших событий пока нет' }}
        </div>
      </div>
      
      <!-- Список событий -->
      <div v-else class="events-container">
        <EventCard 
          v-for="event in filteredEvents" 
          :key="event.id"
          :event="event"
          @click="openEventModal(event)"
        />
      </div>
    </div>
    
    <!-- Модальное окно события -->
    <EventModal 
      v-if="selectedEvent"
      :event="selectedEvent"
      :isOpen="showEventModal"
      @close="closeEventModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventStore } from '@/stores/eventStore'
import EventNav from '@/components/events/EventNav.vue'
import EventCard from '@/components/events/EventCard.vue'
import EventModal from '@/components/events/modals/EventModal.vue'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

const eventStore = useEventStore()

const selectedEvent = ref(null)
const showEventModal = ref(false)

// Получаем данные из хранилища
const loading = computed(() => eventStore.loading)
const error = computed(() => eventStore.error)
const filteredEvents = computed(() => eventStore.filteredEvents)
const activeTab = computed({
  get: () => eventStore.activeTab,
  set: (value) => eventStore.setTab(value)
})
const serverAvailable = computed(() => eventStore.serverAvailable)
const serverStatusMessage = computed(() => eventStore.serverStatusMessage)

onMounted(() => {
  // Данные уже загружаются в хранилище
})

function setTab(tab) {
  activeTab.value = tab
}

function fetchEvents() {
  eventStore.fetchEvents()
}

function reload() {
  window.location.reload()
}

function openEventModal(event) {
  selectedEvent.value = event
  showEventModal.value = true
}

function closeEventModal() {
  showEventModal.value = false
  selectedEvent.value = null
}

function handleImageError(event) {
  event.target.style.display = 'none'
}
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 80px; /* Для нижней навигации */
}

.logo {
  text-align: center;
  margin: 16px 0 20px;
}

.logo img {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.tabs {
  display: flex;
  background: #1a1a1a;
  border-radius: 25px;
  padding: 4px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 11px 0;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #888;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
  cursor: pointer;
  user-select: none;
}

.tab.active {
  color: #000;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 8px);
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 21px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Стили для состояний */
.server-error {
  text-align: center;
  padding: 40px 20px;
}

.server-error-image {
  width: 128px;
  height: 128px;
  object-fit: contain;
  margin: 0 auto 16px;
  border-radius: 8px;
}

.server-error h3 {
  margin-bottom: 8px;
  color: #fff;
  font-size: 18px;
}

.server-error p {
  color: #888;
  margin-bottom: 20px;
  line-height: 1.5;
}

.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 60px 20px;
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text,
.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
  color: #fff;
}

.empty-text {
  color: #888;
}

.btn {
  padding: 12px 24px;
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

.btn-primary:hover {
  background: #e0e0e0;
}

/* Скелетон-загрузчик */
.skeleton {
  background: #2a2a2a;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  position: relative;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: loading 1.5s infinite;
}

.skeleton-card {
  height: 200px;
}

@keyframes loading {
  100% {
    transform: translateX(100%);
  }
}
</style>
