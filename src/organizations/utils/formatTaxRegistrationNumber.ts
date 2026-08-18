/**
 * Formats to the backend's required `EG-XXX-XXX-XXX` shape (see
 * `CreateOrganizationRequest`'s tax registration number pattern) as the user
 * types digits — the `EG-` prefix is fixed, not something the user enters.
 */
export function formatTaxRegistrationNumber(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 9)
  const groups = []
  for (let i = 0; i < digits.length; i += 3) {
    groups.push(digits.slice(i, i + 3))
  }
  return groups.length > 0 ? `EG-${groups.join('-')}` : ''
}
