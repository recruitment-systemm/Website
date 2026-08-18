const STORAGE_KEY = 'hiredesk:layoff-reasons'

/**
 * The backend has no column for a layoff reason at all — `ApplicationEntity`
 * and `UpdateApplicationStatusRequest` only carry `status`, nothing else —
 * so there's nowhere real to persist this. Stored client-side, keyed by
 * application id, as a deliberate, known-limited fallback: it survives a
 * refresh in *this* browser but isn't visible to teammates, doesn't sync
 * across devices, and would be lost if storage is cleared. Don't treat this
 * as durable or shareable data.
 */
function readReasons(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

export function saveLayoffReason(candidateId: string, reason: string): void {
  try {
    const reasons = readReasons()
    reasons[candidateId] = reason
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reasons))
  } catch {
    // localStorage unavailable — the layoff itself still goes through, only
    // the reason fails to save.
  }
}

export function getLayoffReason(candidateId: string): string | null {
  return readReasons()[candidateId] ?? null
}
