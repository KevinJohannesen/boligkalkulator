'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatNorwegian, parseNorwegian } from '@/lib/loan-calculations'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  suffix?: string
  hint?: string
  hintColor?: 'green' | 'yellow' | 'red' | 'blue' | 'default'
  className?: string
}

export function NumberInput({
  label,
  value,
  onChange,
  suffix = 'kr',
  hint,
  hintColor = 'default',
  className
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNorwegian(e.target.value)
    onChange(parsed)
  }

  const hintColorClass = {
    green: 'text-emerald-600',
    yellow: 'text-amber-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    default: 'text-muted-foreground'
  }[hintColor]

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="text"
          value={formatNorwegian(value)}
          onChange={handleChange}
          className="pr-10"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className={cn('text-xs', hintColorClass)}>{hint}</p>
      )}
    </div>
  )
}

interface PercentInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  className?: string
}

export function PercentInput({
  label,
  value,
  onChange,
  step = 0.1,
  min = 0,
  max = 20,
  className
}: PercentInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value) || 0
    onChange(parsed)
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          className="pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          %
        </span>
      </div>
    </div>
  )
}
