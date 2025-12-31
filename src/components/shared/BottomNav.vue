<template>
  <div class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.id"
      :class="{ active: isActive(item.route) }"
      @click="navigateTo(item.route)"
    >
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path :d="item.icon" fill="currentColor" />
      </svg>
      <span>{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  {
    id: 1,
    label: 'События',
    route: '/',
    icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z'
  },
  {
    id: 2,
    label: 'Встречи',
    route: '/meetings',
    icon: 'M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63C19.68 7.55 18.92 7 18.06 7h-.12c-.86 0-1.63.55-1.9 1.37l-.86 2.58c1.08.6 1.82 1.73 1.82 3.05v8h3zm-7.5-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4zm6.5 0v-4h1v-4c0-.82-.68-1.5-1.5-1.5h-2c-.82 0-1.5.68-1.5 1.5v4h1v4h3z'
  },
  {
    id: 3,
    label: 'Маркет',
    route: '/market',
    icon: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z'
  },
  {
    id: 4,
    label: 'Аккаунт',
    route: '/account',
    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
  }
]

const isActive = computed(() => {
  return (routePath) => {
    if (routePath === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(routePath)
  }
})

function navigateTo(routePath) {
  router.push(routePath)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000;
  border-top: 1px solid #222;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 16px;
  z-index: 100;
}

.bottom-nav button {
  background: none;
  border: none;
  color: #666;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: color 0.3s ease;
  padding: 4px;
  cursor: pointer;
  width: 70px;
}

.bottom-nav button.active {
  color: #fff;
}

.bottom-nav svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}
</style>