import { describe, it, expect } from 'vitest'
import { nacResolvePagination } from '../../../src/runtime/server/utils/pagination'

describe('nacResolvePagination()', () => {
  it('defaults to limit 50, offset 0 with no query params', () => {
    expect(nacResolvePagination({})).toEqual({ limit: 50, offset: 0 })
  })

  it('honors an explicit limit under the cap', () => {
    expect(nacResolvePagination({ limit: '10' })).toEqual({ limit: 10, offset: 0 })
  })

  it('caps limit at 200 even when a higher value is requested', () => {
    expect(nacResolvePagination({ limit: '9999' })).toEqual({ limit: 200, offset: 0 })
  })

  it('falls back to the default limit for a non-positive or invalid limit', () => {
    expect(nacResolvePagination({ limit: '0' })).toEqual({ limit: 50, offset: 0 })
    expect(nacResolvePagination({ limit: '-5' })).toEqual({ limit: 50, offset: 0 })
    expect(nacResolvePagination({ limit: 'not-a-number' })).toEqual({ limit: 50, offset: 0 })
  })

  it('honors an explicit offset directly', () => {
    expect(nacResolvePagination({ offset: '30' })).toEqual({ limit: 50, offset: 30 })
  })

  it('falls back to offset 0 for a negative or invalid offset', () => {
    expect(nacResolvePagination({ offset: '-1' })).toEqual({ limit: 50, offset: 0 })
    expect(nacResolvePagination({ offset: 'bogus' })).toEqual({ limit: 50, offset: 0 })
  })

  it('converts page + limit into the correct offset (page 1 = offset 0)', () => {
    expect(nacResolvePagination({ page: '1', limit: '20' })).toEqual({ limit: 20, offset: 0 })
    expect(nacResolvePagination({ page: '3', limit: '20' })).toEqual({ limit: 20, offset: 40 })
  })

  it('page takes priority over an explicit offset when both are present', () => {
    expect(nacResolvePagination({ page: '2', offset: '999', limit: '10' })).toEqual({ limit: 10, offset: 10 })
  })

  it('ignores page 0 or negative page, falling back to offset logic', () => {
    expect(nacResolvePagination({ page: '0', offset: '15' })).toEqual({ limit: 50, offset: 15 })
  })
})
