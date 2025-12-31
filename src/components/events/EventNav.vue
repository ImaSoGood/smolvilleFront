<template>
  <div class="nav" id="eventsNav">
    <button
      v-for="filter in filters"
      :key="filter.key"
      :class="{ active: activeFilter === filter.key }"
      @click="handleFilterClick(filter.key)"
    >
      <div class="nav-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path :d="filter.icon" fill="currentColor" />
        </svg>
      </div>
      <div class="nav-text">{{ filter.label }}</div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEventStore } from '@/stores/eventStore'

const eventStore = useEventStore()

const filters = [
  { key: 'all', label: 'Все', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { key: 'Спорт', label: 'Спорт', icon: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z' },
  { key: 'Выставки', label: 'Выставки', icon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' }
]

const activeFilter = computed({
  get: () => eventStore.activeFilter,
  set: (value) => eventStore.setFilter(value)
})

function handleFilterClick(filter) {
  activeFilter.value = filter
}
</script>

<style scoped>
.nav {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding: 0 4px;
  scrollbar-width: none;
  justify-content: center;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav button {
  padding: 12px;
  background: #1a1a1a;
  border: none;
  color: #888;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
  min-width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.nav button.active {
  background: #fff;
  color: #000;
  font-weight: 600;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  font-size: 11px;
  font-weight: 500;
}
</style>