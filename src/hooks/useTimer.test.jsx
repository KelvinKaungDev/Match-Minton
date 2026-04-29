import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from './useTimer.js'

describe('useTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  // ── initial state ──────────────────────────────────────────────────────────

  it('starts with the provided seconds and not running', () => {
    const { result } = renderHook(() => useTimer(90))
    expect(result.current.timeLeft).toBe(90)
    expect(result.current.running).toBe(false)
  })

  it('defaults to 900 seconds (15 minutes) when no argument given', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.timeLeft).toBe(900)
  })

  // ── display formatting ─────────────────────────────────────────────────────

  it('formats display as MM:SS', () => {
    const { result } = renderHook(() => useTimer(75))
    expect(result.current.display).toBe('01:15')
  })

  it('pads single-digit seconds with a leading zero', () => {
    const { result } = renderHook(() => useTimer(65))
    expect(result.current.display).toBe('01:05')
  })

  it('shows 15:00 for the default 900 seconds', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.display).toBe('15:00')
  })

  // ── start ──────────────────────────────────────────────────────────────────

  it('sets running to true after start()', () => {
    const { result } = renderHook(() => useTimer(30))
    act(() => result.current.start())
    expect(result.current.running).toBe(true)
  })

  it('decrements timeLeft by 1 every second while running', () => {
    const { result } = renderHook(() => useTimer(10))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.timeLeft).toBe(7)
  })

  // ── pause ──────────────────────────────────────────────────────────────────

  it('stops decrementing after pause()', () => {
    const { result } = renderHook(() => useTimer(10))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    act(() => result.current.pause())
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.timeLeft).toBe(7)
    expect(result.current.running).toBe(false)
  })

  // ── reset ──────────────────────────────────────────────────────────────────

  it('restores timeLeft to initialSeconds and stops the timer', () => {
    const { result } = renderHook(() => useTimer(10))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(4000))
    act(() => result.current.reset())
    expect(result.current.timeLeft).toBe(10)
    expect(result.current.running).toBe(false)
  })

  // ── natural end ────────────────────────────────────────────────────────────

  it('stops at exactly 0 and does not go negative', () => {
    const { result } = renderHook(() => useTimer(3))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.timeLeft).toBe(0)
    expect(result.current.running).toBe(false)
  })

  it('displays 00:00 when time runs out', () => {
    const { result } = renderHook(() => useTimer(2))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.display).toBe('00:00')
  })

  // ── initialSeconds change ──────────────────────────────────────────────────

  it('resets timeLeft and stops when initialSeconds prop changes', () => {
    const { result, rerender } = renderHook(
      ({ s }) => useTimer(s),
      { initialProps: { s: 60 } },
    )
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10_000))
    rerender({ s: 120 })
    expect(result.current.timeLeft).toBe(120)
    expect(result.current.running).toBe(false)
  })
})
