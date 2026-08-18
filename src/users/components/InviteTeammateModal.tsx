import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { FormField } from '@/shared/components/FormField'
import { cn } from '@/lib/utils'
import { EmailAlreadyInUseError, InvalidEmployeeEmailError, inviteTeammate } from '@/users/api/usersApi'
import {
  inviteTeammateSchema,
  type InviteTeammateFormValues,
} from '@/users/validation/inviteTeammateSchema'
import type { OrgUser, UserRole } from '@/users/types/user'

/** Both roles, with what each one actually means in the product. */
const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  { value: 'HR', label: 'HR', description: 'Manages jobs, candidates and the hiring pipeline.' },
  {
    value: 'INTERVIEWER',
    label: 'Interviewer',
    description: 'Reviews assigned candidates and takes part in interviews.',
  },
]

interface InviteTeammateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (user: OrgUser) => void
}

export function InviteTeammateModal({ open, onOpenChange, onInvited }: InviteTeammateModalProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteTeammateFormValues>({
    resolver: zodResolver(inviteTeammateSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'HR',
    },
  })

  async function onSubmit(values: InviteTeammateFormValues) {
    setFormError(null)
    try {
      const user = await inviteTeammate(values)
      onInvited(user)
      reset()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof EmailAlreadyInUseError) {
        setFormError('That email already belongs to another account. Try a different one.')
      } else if (error instanceof InvalidEmployeeEmailError) {
        setFormError(error.message)
      } else {
        setFormError('Something went wrong creating this account. Please try again.')
      }
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFormError(null)
      reset()
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>
            Create an account for someone on your team. They'll sign in with the email and
            password you set here.
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
          <FormField label="Username" htmlFor="username" error={errors.username?.message}>
            <Input
              id="username"
              autoComplete="off"
              placeholder="sarah.mitchell"
              aria-invalid={!!errors.username}
              className="h-10"
              {...register('username')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="Sarah"
                aria-invalid={!!errors.firstName}
                className="h-10"
                {...register('firstName')}
              />
            </FormField>

            <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Mitchell"
                aria-invalid={!!errors.lastName}
                className="h-10"
                {...register('lastName')}
              />
            </FormField>
          </div>

          <FormField label="Work email" htmlFor="teammateEmail" error={errors.email?.message}>
            <Input
              id="teammateEmail"
              type="email"
              autoComplete="off"
              placeholder="sarah@company.com"
              aria-invalid={!!errors.email}
              className="h-10"
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Temporary password"
            htmlFor="teammatePassword"
            error={errors.password?.message}
            hint={
              !errors.password
                ? 'At least 8 characters, including a number. Share it with them directly.'
                : undefined
            }
          >
            <Input
              id="teammatePassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="h-10"
              {...register('password')}
            />
          </FormField>

          <Controller
            control={control}
            name="role"
            render={({ field, fieldState }) => (
              <FormField label="Role" htmlFor="role" error={fieldState.error?.message}>
                {/* Two roles with real consequences — a radio group states what
                    each one grants, where a bare select would just name them. */}
                <div role="radiogroup" aria-label="Role" className="flex flex-col gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const isSelected = field.value === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex flex-col gap-0.5 rounded-lg border px-3.5 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-input hover:border-primary/40'
                        )}
                      >
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </button>
                    )
                  })}
                </div>
              </FormField>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
