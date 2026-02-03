/**
 * API Configuration Tests
 */

import { API_BASE_URL, API_ENDPOINTS, handleApiError } from '@/config/api'

describe('API Configuration', () => {
  describe('API_BASE_URL', () => {
    it('should be defined', () => {
      expect(API_BASE_URL).toBeDefined()
    })

    it('should be a valid URL', () => {
      expect(API_BASE_URL).toMatch(/^https?:\/\//)
    })
  })

  describe('API_ENDPOINTS', () => {
    it('should have all required endpoints', () => {
      expect(API_ENDPOINTS).toHaveProperty('JOB_STATS')
      expect(API_ENDPOINTS).toHaveProperty('RECENT_APPLICATIONS')
      expect(API_ENDPOINTS).toHaveProperty('UPCOMING_INTERVIEWS')
      expect(API_ENDPOINTS).toHaveProperty('ADD_JOB_APPLICATION')
      expect(API_ENDPOINTS).toHaveProperty('GET_JOB_APPLICATION')
      expect(API_ENDPOINTS).toHaveProperty('UPDATE_JOB_APPLICATION')
      expect(API_ENDPOINTS).toHaveProperty('DELETE_JOB_APPLICATION')
      expect(API_ENDPOINTS).toHaveProperty('MEDIA_BASE')
    })

    it('should generate correct GET_JOB_APPLICATION URL', () => {
      const url = API_ENDPOINTS.GET_JOB_APPLICATION(1)
      expect(url).toContain('/api/applications/1/')
    })

    it('should generate correct UPDATE_JOB_APPLICATION URL', () => {
      const url = API_ENDPOINTS.UPDATE_JOB_APPLICATION(5)
      expect(url).toContain('/api/applications/5/update/')
    })

    it('should generate correct DELETE_JOB_APPLICATION URL', () => {
      const url = API_ENDPOINTS.DELETE_JOB_APPLICATION(10)
      expect(url).toContain('/api/applications/10/delete/')
    })
  })

  describe('handleApiError', () => {
    it('should return network error message for fetch errors', () => {
      const error = new TypeError('Failed to fetch')
      const message = handleApiError(error)
      expect(message).toContain('Network error')
    })

    it('should return custom error message', () => {
      const error = new Error('Custom error')
      const message = handleApiError(error)
      expect(message).toBe('Custom error')
    })

    it('should return default message for unknown errors', () => {
      const message = handleApiError({}, 'Default message')
      expect(message).toBe('Default message')
    })
  })
})
