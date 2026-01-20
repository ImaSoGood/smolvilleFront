<script setup>
import { ref } from 'vue'

const activeTab = ref('active')


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