<!-- src/components/meetings/modals/CreateMeetingModal.vue -->
<template>
  <div class="modal" :class="{ active: isOpen }" @click.self="close">
    <div class="modal-content" style="max-width: 500px;">
      <button class="modal-close" @click="close">×</button>
      
      <h2 class="modal-title">Создание новой встречи</h2>
      
      <form @submit.prevent="handleSubmit">
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Название встречи *
          </label>
          <input 
            type="text" 
            v-model="form.title"
            required 
            maxlength="256" 
            placeholder="Введите название встречи"
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px;"
          >
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Описание *
          </label>
          <textarea 
            v-model="form.description"
            required 
            maxlength="1024" 
            rows="4" 
            placeholder="Опишите встречу..."
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px; resize: vertical;"
          ></textarea>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Дата и время *
          </label>
          <input 
            type="datetime-local" 
            v-model="form.date"
            required
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px;"
          >
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Тип встречи *
          </label>
          <select 
            v-model="form.type"
            required
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px;"
          >
            <option value="">Выберите тип</option>
            <option value="Спорт">Спорт</option>
            <option value="Кальянная компания">Кальянная компания</option>
            <option value="Знакомства">Знакомства</option>
            <option value="Покатушки">Покатушки</option>
            <option value="Большая компания">Большая компания</option>
            <option value="Фан встреча">Фан встреча</option>
            <option value="Другое">Другое</option>
          </select>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Возрастное ограничение
          </label>
          <input 
            type="number" 
            v-model="form.age_limit"
            min="0" 
            max="40" 
            placeholder="0 (без ограничений)"
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px;"
          >
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Место проведения *
          </label>
          <input 
            type="text" 
            v-model="form.location"
            required 
            maxlength="256" 
            placeholder="Укажите место встречи"
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px;"
          >
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Ссылка на карту
          </label>
          <input 
            type="url" 
            v-model="form.map_link"
            maxlength="512" 
            placeholder="https://maps.google.com/..."
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px;"
          >
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e5e7eb;">
            Изображение встречи
          </label>
          <input 
            type="file" 
            ref="fileInput"
            @change="handleFileUpload"
            accept="image/*"
            style="width: 100%; padding: 12px; border: 1px solid #4b5563; border-radius: 8px; background: #1f2937; color: #f9fafb; font-size: 14px;"
          >
          <div v-if="imagePreview" style="margin-top: 10px;">
            <img :src="imagePreview" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #4b5563;">
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 24px;">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="close"
            style="flex: 1;"
            :disabled="isSubmitting"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            style="flex: 1; background: #10b981;"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Создание...' : 'Создать встречу' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import { useMeetingStore } from '@/stores/meetingStore'
import { useTelegramStore } from '@/stores/telegramStore'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'created'])

const meetingStore = useMeetingStore()
const telegramStore = useTelegramStore()

const form = ref({
  title: '',
  description: '',
  date: getDefaultDateTime(),
  type: '',
  age_limit: 0,
  location: '',
  map_link: '',
  image: null
})

const imagePreview = ref(null)
const fileInput = ref(null)
const isSubmitting = ref(false)

function getDefaultDateTime() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    form.value.image = null
    imagePreview.value = null
  }
}

function resetForm() {
  form.value = {
    title: '',
    description: '',
    date: getDefaultDateTime(),
    type: '',
    age_limit: 0,
    location: '',
    map_link: '',
    image: null
  }
  imagePreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const result = await meetingStore.createMeeting(form.value)
    
    if (result.success) {
      telegramStore.showNotification('Встреча успешно создана!')
      emit('created', result.meeting)
      close()
    } else {
      telegramStore.showNotification(result.message)
    }
  } catch (error) {
    console.error('Ошибка создания встречи:', error)
    telegramStore.showNotification('Ошибка при создании встречи', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function close() {
  resetForm()
  emit('close')
}

onMounted(() => {
  form.value.date = getDefaultDateTime()
})
</script>

<style scoped>
/* Стили наследуются из глобальных */
</style>