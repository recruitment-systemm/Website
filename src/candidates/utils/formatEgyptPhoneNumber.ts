export function formatEgyptPhoneNumber(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 11)
  const groups = [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7, 11)].filter(Boolean)
  return groups.join(' ')
}
