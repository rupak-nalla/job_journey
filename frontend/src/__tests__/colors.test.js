/**
 * Color Utility Tests
 */

import { getStatusBadgeClass } from '@/utils/colors'

describe('Color Utilities', () => {
  describe('getStatusBadgeClass', () => {
    it('should return correct class for Applied status', () => {
      const className = getStatusBadgeClass('Applied')
      expect(className).toContain('bg-blue-100')
      expect(className).toContain('text-blue-700')
    })

    it('should return correct class for Ghosted status', () => {
      const className = getStatusBadgeClass('Ghosted')
      expect(className).toContain('bg-slate-100')
      expect(className).toContain('text-slate-700')
    })

    it('should return correct class for Interviewing status', () => {
      const className = getStatusBadgeClass('Interviewing')
      expect(className).toContain('bg-amber-100')
      expect(className).toContain('text-amber-700')
    })

    it('should return correct class for Assessment status', () => {
      const className = getStatusBadgeClass('Assessment')
      expect(className).toContain('bg-purple-100')
      expect(className).toContain('text-purple-700')
    })

    it('should be case insensitive', () => {
      const className1 = getStatusBadgeClass('applied')
      const className2 = getStatusBadgeClass('APPLIED')
      const className3 = getStatusBadgeClass('Applied')
      
      expect(className1).toBe(className2)
      expect(className2).toBe(className3)
    })

    it('should handle null/undefined status', () => {
      const className1 = getStatusBadgeClass(null)
      const className2 = getStatusBadgeClass(undefined)
      
      // Should return default (Applied)
      expect(className1).toContain('bg-blue-100')
      expect(className2).toContain('bg-blue-100')
    })

    it('should handle unknown status', () => {
      const className = getStatusBadgeClass('Unknown')
      
      // Should return default (Applied)
      expect(className).toContain('bg-blue-100')
      expect(className).toContain('text-blue-700')
    })

    it('should include base classes', () => {
      const className = getStatusBadgeClass('Applied')
      expect(className).toContain('px-3')
      expect(className).toContain('py-1')
      expect(className).toContain('rounded-full')
    })
  })
})
