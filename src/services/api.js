import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
 headers: {
    'Content-Type': 'application/json'
  }
})

// Перехватчики для обработки ошибок
api.interceptors.response.use(
  response => {
    console.log('API Response:', response)
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default {
  // Проверка статуса сервера
  async getStatus() {
    return api.get('/api/STATUS')
  },


  
  /*
  События
  События
  События
  */ 

  async getEvents() {
    return api.get('/api/v1/events')
  },
  
  async attendEvent(eventId, userId) {
    return api.post('/api/v1/event/attend', {
      event_id: eventId,
      user_id: userId
    })
  },
  
  async unattendEvent(eventId, userId) {
    return api.post('/api/v1/event/unattend', {
      event_id: eventId,
      user_id: userId
    })
  },
  
  async checkUserAttendance(eventId, userId) {
    return api.get(`/api/v1/event/check/${eventId}/${userId}`)
  },

  /*
  События
  События
  События
  */ 

  



  
  /*
  Встречи
  Встречи
  Встречи
  */ 
  async getMeetings() {
    try {
      return await api.get('/api/v1/meetings')
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
      throw error
    }
  },
  
  async createMeeting(formData) {
    try {
      return await api.post('/api/v1/meeting/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error('Failed to create meeting:', error)
      throw error
    }
  },
  
  async attendMeeting(meetingToken, userId) {
    try {
      return await api.post('/api/v1/meeting/attend', {
        meet_token: meetingToken,
        user_id: userId
      })
    } catch (error) {
      console.error('Failed to attend meeting:', error)
      throw error
    }
  },

  async unattendMeeting(meetingToken, userId) {
    try {
      return await api.post('/api/v1/meeting/unattend', {
        meet_token: meetingToken,
        user_id: userId
      })
    } catch (error) {
      console.error('Failed to unattend meeting:', error)
      throw error
    }
  },

  async checkMeetingAttendance(meetingToken, userId) {
    try {
      const response = await api.get(`/api/v1/meeting/checkAttendance`, {
        params: {
          meet_token: meetingToken,
          user_id: userId
        }
      })
      return response 
    } catch (error) {
      console.error('Failed to check meeting attendance:', error)
      throw error
    }
  },

  async addMeetView(meetingToken, userId) {
    try {
      return await api.post('/api/v1/meeting/watchMeet', {
        meet_token: meetingToken,
        user_id: userId
      })
    } catch (error) {
      console.error('Failed to add meet view:', error)
      throw error
    }
  },

  async getMeetingCreator(meetingToken) {
    try {
      const response = await api.get(`/api/v1/meeting/profile/${meetingToken}`)
      return response
    } catch (error) {
      console.error('Failed to get meeting creator:', error)
      throw error
    }
  },

  /*
  Встречи
  Встречи
  Встречи
  */ 






  /*
  Реклама
  Реклама
  Реклама
  */ 

  async getAds() {
    return api.get('/api/v1/ads')
  }

  /*
  Реклама
  Реклама
  Реклама
  */ 
}