'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NumberInput } from './number-input'
import type { LoanFees } from '@/lib/loan-calculations'

interface FeesSectionProps {
  fees: LoanFees
  onFeesChange: (fees: LoanFees) => void
}

export function FeesSection({ fees, onFeesChange }: FeesSectionProps) {
  const updateFee = <K extends keyof LoanFees>(key: K, value: LoanFees[K]) => {
    onFeesChange({ ...fees, [key]: value })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Gebyrer og lånekostnader</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <NumberInput
          label="Termingebyr per måned"
          value={fees.termingebyrPerManed}
          onChange={(v) => updateFee('termingebyrPerManed', v)}
          hint="Legges til hver månedlig betaling"
        />

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Antall terminer per år</Label>
          <Select 
            value={fees.antallTerminerPerAr.toString()} 
            onValueChange={(v) => updateFee('antallTerminerPerAr', parseInt(v) as 12 | 24)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 (månedlig)</SelectItem>
              <SelectItem value="24">24 (halvmånedlig)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <NumberInput
          label="Etableringsgebyr"
          value={fees.etableringsgebyr}
          onChange={(v) => updateFee('etableringsgebyr', v)}
          hint="Engangsgebyr ved opprettelse av lånet"
        />

        <NumberInput
          label="Tinglysningsgebyr"
          value={fees.tinglysningsgebyr}
          onChange={(v) => updateFee('tinglysningsgebyr', v)}
          hint="Fast gebyr for pantedokument til staten"
        />
      </CardContent>
    </Card>
  )
}
