<!-- src/views/MeetingsView.vue -->
<template>
  <div class="container">
    <!-- Логотип -->
    <div class="logo">
      <img src="@/assets/logo.PNG" alt="Смок Вилле" @error="handleImageError">
    </div>
    
    <!-- Навигация встреч -->
    <MeetingNav ref="meetingNav" />
    
    <!-- Вкладки -->
    <div class="tabs" v-if="meetingNav">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'active' }"
        @click="setActiveTab('active')"
      >
        Активные
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'past' }"
        @click="setActiveTab('past')"
      >
        Прошедшие
      </div>
      <div 
        class="tab-indicator" 
        :style="{ transform: `translateX(${activeTab === 'active' ? '0' : '100%'})` }"
      ></div>
    </div>
    
    <!-- Кнопка создания встречи -->
    <div class="create-meeting-btn-container" style="margin-bottom: 20px;">
      <button class="btn btn-primary" @click="openCreateModal" style="width: 100%; background: #10b981;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
          style="margin-right: 8px; vertical-align: middle;">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Создать встречу
      </button>
    </div>
    
    <!-- Контейнер встреч -->
    <div class="meetings-section">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-container">
        <div class="skeleton skeleton-card" v-for="n in 3" :key="n"></div>
      </div>
      
      <!-- Состояние ошибки -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error }}</div>
        <button class="btn btn-primary" @click="fetchMeetings">
          Попробовать снова
        </button>
      </div>
      
      <!-- Пустое состояние -->
      <div v-else-if="!displayedMeetings.length" class="empty-container">
        <div class="empty-icon">{{ activeTab === 'active' ? '👥' : '📅' }}</div>
        <div class="empty-text">
          {{ activeTab === 'active' ? 'Активных встреч пока нет' : 'Прошедших встреч пока нет' }}
        </div>
        <div v-if="activeTab === 'active'" class="empty-subtext" style="margin-top: 8px;">
          Создайте первую встречу!
        </div>
      </div>
      
      <!-- Список встреч -->
      <div v-else class="meetings-container">
        <MeetingCard 
          v-for="meeting in displayedMeetings" 
          :key="meeting.id"
          :meeting="meeting"
          @click="openMeetingModal(meeting)"
        />
      </div>
    </div>
    
    <!-- Модальное окно встречи -->
    <MeetingModal 
      v-if="selectedMeeting"
      :meeting="selectedMeeting"
      :isOpen="showMeetingModal"
      @close="closeMeetingModal"
    />
    
    <!-- Модальное окно создания встречи -->
    <CreateMeetingModal 
      :isOpen="showCreateModal"
      @close="closeCreateModal"
      @created="handleMeetingCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useMeetingStore } from '@/stores/meetingStore'
import MeetingNav from '@/components/meetings/MeetingNav.vue'
import MeetingCard from '@/components/meetings/MeetingCard.vue'
import MeetingModal from '@/components/meetings/modals/MeetingModal.vue'
import CreateMeetingModal from '@/components/meetings/modals/CreateMeetingModal.vue'

const meetingStore = useMeetingStore()
const meetingNav = ref(null)

const selectedMeeting = ref(null)
const showMeetingModal = ref(false)
const showCreateModal = ref(false)
const activeTab = ref('active')

// Получаем данные из хранилища
const loading = computed(() => meetingStore.loading)
const error = computed(() => meetingStore.error)

const displayedMeetings = computed(() => {
  if (activeTab.value === 'active') {
    return meetingStore.activeMeetings
  } else {
    return meetingStore.pastMeetings
  }
})

onMounted(async () => {
  console.log('MeetingsView mounted')
  await nextTick() // Ждем инициализации ref
})

function setActiveTab(tab) {
  activeTab.value = tab
  if (meetingNav.value) {
    meetingNav.value.activeTab = tab
  }
}

function fetchMeetings() {
  meetingStore.fetchMeetings()
}

function openMeetingModal(meeting) {
  selectedMeeting.value = meeting
  showMeetingModal.value = true
}

function closeMeetingModal() {
  showMeetingModal.value = false
  selectedMeeting.value = null
}

function openCreateModal() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function handleMeetingCreated(newMeeting) {
  console.log('Новая встреча создана:', newMeeting)
  // Данные уже добавлены в хранилище через meetingStore
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
  padding-bottom: 100px; /* Для нижней навигации */
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

.create-meeting-btn-container {
  margin-top: 20px;
}

.meetings-section {
  padding-bottom: 20px;
}

/* Стили для состояний */
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

.empty-subtext {
  font-size: 14px;
  color: #666;
}
</style>