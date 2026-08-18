import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/shared/components/FormField'
import { createJob } from '@/jobs/api/jobsApi'
import { LocationPickerMap } from '@/jobs/components/LocationPickerMap'
import type { Job } from '@/jobs/types/job'
import { geocodeAddress } from '@/jobs/utils/geocode'
import { createJobSchema, type CreateJobFormValues } from '@/jobs/validation/createJobSchema'

interface CreateJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (job: Job) => void
}

const DEFAULT_MAP_CENTER = { latitude: 30.0444, longitude: 31.2357 } // Cairo, Egypt

type GeocodeStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'found'; label: string }
  | { state: 'not-found' }
  | { state: 'error' }

export function CreateJobModal({ open, onOpenChange, onCreated }: CreateJobModalProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [geocodeStatus, setGeocodeStatus] = useState<GeocodeStatus>({ state: 'idle' })

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
    },
  })

  const latitude = watch('latitude')
  const longitude = watch('longitude')

  async function handleAddressBlur(event: React.FocusEvent<HTMLInputElement>) {
    const address = event.target.value.trim()
    if (!address) {
      setGeocodeStatus({ state: 'idle' })
      return
    }

    setGeocodeStatus({ state: 'loading' })
    try {
      const result = await geocodeAddress(address)
      if (!result) {
        setGeocodeStatus({ state: 'not-found' })
        return
      }
      setValue('latitude', result.latitude, { shouldValidate: true })
      setValue('longitude', result.longitude, { shouldValidate: true })
      setGeocodeStatus({ state: 'found', label: result.displayName })
    } catch {
      setGeocodeStatus({ state: 'error' })
    }
  }

  function handleMapChange(nextLatitude: number, nextLongitude: number) {
    setValue('latitude', Number(nextLatitude.toFixed(6)), { shouldValidate: true })
    setValue('longitude', Number(nextLongitude.toFixed(6)), { shouldValidate: true })
  }

  async function onSubmit(values: CreateJobFormValues) {
    setFormError(null)
    try {
      const job = await createJob({
        title: values.title,
        description: values.description,
        address: values.address,
        // The backend rejects more than 6 fractional digits (@Digits on
        // CreateJobRequest) — the map picker already rounds to 6 places
        // (handleMapChange), but the raw number inputs don't, so round here
        // too rather than let a manually-typed value fail server-side.
        latitude: Number((values.latitude as number).toFixed(6)),
        longitude: Number((values.longitude as number).toFixed(6)),
      })
      onCreated(job)
      reset()
      setMapOpen(false)
      setGeocodeStatus({ state: 'idle' })
      onOpenChange(false)
    } catch {
      setFormError('Something went wrong creating this job. Please try again.')
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFormError(null)
      setMapOpen(false)
      setGeocodeStatus({ state: 'idle' })
      reset()
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create job</DialogTitle>
          <DialogDescription>
            New jobs are created as drafts — publish them from the jobs list when you're ready.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField label="Job title" htmlFor="title" error={errors.title?.message}>
            <Input
              id="title"
              placeholder="Senior Backend Engineer"
              aria-invalid={!!errors.title}
              className="h-10"
              {...register('title')}
            />
          </FormField>

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea
              id="description"
              rows={4}
              placeholder="What will this person do?"
              aria-invalid={!!errors.description}
              {...register('description')}
            />
          </FormField>

          <FormField
            label="Location"
            htmlFor="address"
            error={errors.address?.message}
            hint={
              geocodeStatus.state === 'loading'
                ? 'Locating…'
                : geocodeStatus.state === 'found'
                  ? `Found: ${geocodeStatus.label}`
                  : geocodeStatus.state === 'not-found'
                    ? "Couldn't find that location — set it on the map or enter coordinates manually."
                    : geocodeStatus.state === 'error'
                      ? "Couldn't reach the location service — set coordinates manually."
                      : !errors.address
                        ? 'Coordinates are looked up automatically when you leave this field.'
                        : undefined
            }
          >
            <div className="flex gap-2">
              <Input
                id="address"
                placeholder="Cairo, Egypt"
                aria-invalid={!!errors.address}
                className="h-10"
                {...register('address', { onBlur: handleAddressBlur })}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-pressed={mapOpen}
                aria-label={mapOpen ? 'Hide map' : 'Pick location on map'}
                onClick={() => setMapOpen((value) => !value)}
              >
                <MapPin className="size-4" />
              </Button>
            </div>
          </FormField>

          {mapOpen && (
            <LocationPickerMap
              latitude={latitude ?? DEFAULT_MAP_CENTER.latitude}
              longitude={longitude ?? DEFAULT_MAP_CENTER.longitude}
              onChange={handleMapChange}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="latitude"
              render={({ field, fieldState }) => (
                <FormField label="Latitude" htmlFor="latitude" error={fieldState.error?.message}>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="30.0444"
                    aria-invalid={!!fieldState.error}
                    className="h-10"
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="longitude"
              render={({ field, fieldState }) => (
                <FormField label="Longitude" htmlFor="longitude" error={fieldState.error?.message}>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    placeholder="31.2357"
                    aria-invalid={!!fieldState.error}
                    className="h-10"
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormField>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            {/* Blocked while geocoding is in flight — submitting mid-lookup
                fails validation on the not-yet-populated lat/lng fields. */}
            <Button type="submit" disabled={isSubmitting || geocodeStatus.state === 'loading'}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : geocodeStatus.state === 'loading' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Locating…
                </>
              ) : (
                'Create job'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
