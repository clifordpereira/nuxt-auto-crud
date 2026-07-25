import { describe, it, expect } from 'vitest'
import { nacGetModelFromPath } from '../../../src/runtime/server/utils/modelMapper'

describe('nacGetModelFromPath()', () => {
  it('resolves a real model from a list route', () => {
    expect(nacGetModelFromPath('/api/_nac/posts', '/api/_nac')).toBe('posts')
  })

  it('resolves a real model from a single-record route', () => {
    expect(nacGetModelFromPath('/api/_nac/posts/5', '/api/_nac')).toBe('posts')
  })

  it('returns null for _schemas', () => {
    expect(nacGetModelFromPath('/api/_nac/_schemas', '/api/_nac')).toBeNull()
  })

  it('returns null for _schemas/:model', () => {
    expect(nacGetModelFromPath('/api/_nac/_schemas/posts', '/api/_nac')).toBeNull()
  })

  it('returns null for _meta', () => {
    expect(nacGetModelFromPath('/api/_nac/_meta', '/api/_nac')).toBeNull()
  })

  it('returns null for _sse', () => {
    expect(nacGetModelFromPath('/api/_nac/_sse', '/api/_nac')).toBeNull()
  })

  it('returns null for a path outside the NAC prefix entirely', () => {
    expect(nacGetModelFromPath('/api/other-module/thing', '/api/_nac')).toBeNull()
  })
})