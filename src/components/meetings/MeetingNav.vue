<!-- src/components/meetings/MeetingNav.vue -->
<template>
  <div class="nav" id="meetingsNav">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="{ active: activeTab === tab.key }"
      @click="handleTabClick(tab.key)"
    >
      <div class="nav-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path :d="tab.icon" fill="currentColor" />
        </svg>
      </div>
      <div class="nav-text">{{ tab.label }}</div>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('active')

const tabs = [
  { 
    key: 'active', 
    label: 'Активные', 
    icon: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z' 
  },
  { 
    key: 'past', 
    label: 'Прошедшие', 
    icon: 'M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z' 
  }
]

function handleTabClick(tab) {
  activeTab.value = tab
}

defineExpose({
  activeTab
})
</script>

<style scoped>
/* Стили наследуются из глобальных */
</style>