'use client'

import { formatNorwegian } from '@/lib/loan-calculations'
import type { LoanResult } from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CostBreakdownProps {
  result: LoanResult
  lanebelop: number
}

export function CostBreakdown({ result, lanebelop }: CostBreakdownProps) {
  const currentYear = new Date().getFullYear()
  const payoffYear = currentYear + result.nedbetalingsAr

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Kostnadssammendrag</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Lånebeløp</span>
            <span className="font-medium">{formatNorwegian(lanebelop)} kr</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Total rentekostnad</span>
            <span className="font-medium text-amber-600">
              {formatNorwegian(result.totalRentekostnad)} kr
            </span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Totalt betalt</span>
            <span className="font-semibold">{formatNorwegian(result.totalKostnad)} kr</span>
          </div>

          <div className="border-b pb-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nominell rente</span>
              <span className="font-medium">{result.nominellRente.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Effektiv rente</span>
              <span className="font-medium">{result.effektivRente.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Differanse gebyrer</span>
              <span className="text-xs text-muted-foreground">
                +{result.effektivRenteDifferanse.toFixed(2)} prosentpoeng
              </span>
            </div>
          </div>

          <div className="border-b pb-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sum termingebyrer</span>
              <span className="font-medium">{formatNorwegian(result.sumTermingebyrer)} kr</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Etableringsgebyr</span>
              <span className="font-medium">{formatNorwegian(result.fees.etableringsgebyr)} kr</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Tinglysningsgebyr</span>
              <span className="font-medium">{formatNorwegian(result.fees.tinglysningsgebyr)} kr</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nedbetalt</span>
            <span className="font-medium text-emerald-600">
              {payoffYear} ({result.nedbetalingsAr} år)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
