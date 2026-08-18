import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { UploadCloud } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { formatTaxRegistrationNumber } from '@/organizations/utils/formatTaxRegistrationNumber'

interface TaxVerificationFieldsProps<T extends FieldValues> {
  control: Control<T>
  /** Field name for the tax registration number — typed as a plain string since the two forms that use this (register + LinkedIn signup) share the field name but not the same generic form-values type. */
  taxNumberName: Path<T>
  taxDocumentName: Path<T>
}

/**
 * The tax-verification pair (`taxRegistrationNumber` input + document
 * upload) shared by `RegisterOrganizationForm` and the LinkedIn signup
 * completion form — same fields, same backend validation
 * (`CreateOrganizationRequest`/`CompleteLinkedInSignupRequest` both require
 * the identical `EG-###-###-###` pattern and PDF/DOCX document), so the
 * markup shouldn't be duplicated between the two entry points.
 */
export function TaxVerificationFields<T extends FieldValues>({
  control,
  taxNumberName,
  taxDocumentName,
}: TaxVerificationFieldsProps<T>) {
  return (
    <>
      <Controller
        control={control}
        name={taxNumberName}
        render={({ field, fieldState }) => (
          <FormField
            label="Tax registration number"
            htmlFor={taxNumberName}
            error={fieldState.error?.message}
            hint={!fieldState.error ? 'A 9-digit numeric code, e.g. EG-123-456-789.' : undefined}
          >
            <Input
              id={taxNumberName}
              inputMode="numeric"
              autoComplete="off"
              placeholder="EG-123-456-789"
              maxLength={14}
              aria-invalid={!!fieldState.error}
              className="h-10"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(formatTaxRegistrationNumber(event.target.value))}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name={taxDocumentName}
        render={({ field, fieldState }) => (
          <FormField
            label="Tax registration document"
            htmlFor={taxDocumentName}
            error={fieldState.error?.message}
            hint={!fieldState.error ? 'PDF or DOCX — up to 10MB.' : undefined}
          >
            <label
              htmlFor={taxDocumentName}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <UploadCloud className="size-4 shrink-0" />
              <span className="truncate">
                {(field.value as File | undefined)?.name ?? 'Choose a file to upload'}
              </span>
            </label>
            <input
              ref={field.ref}
              id={taxDocumentName}
              name={field.name}
              type="file"
              accept=".pdf,.docx"
              className="sr-only"
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.files?.[0])}
            />
          </FormField>
        )}
      />
    </>
  )
}
