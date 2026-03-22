'use client'

import { useState } from 'react'
import { formatNorwegian, calculateLoan, calculateComparisonCost, generateAmortizationSchedule } from '@/lib/loan-calculations'
import type { LoanInputs, LoanResult } from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { NumberInput, PercentInput } from './number-input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { X, ArrowRight, ArrowLeft, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComparisonSectionProps {
  primaryInputs: LoanInputs
  primaryResult: LoanResult
}

export function ComparisonSection({ primaryInputs, primaryResult }: ComparisonSectionProps) {
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonPeriod, setComparisonPeriod] = useState<'5' | '10' | '20' | 'full'>('full')
  
  const [bolig2, setBolig2] = useState({
    boligpris: primaryInputs.boligpris,
    egenkapital: primaryInputs.egenkapital,
    fellesgjeld: 0,
    nominellRente: primaryInputs.nominellRente,
    nedbetalingstid: primaryInputs.nedbetalingstid
  })

  if (!isComparing) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsComparing(true)}
        className="w-full"
      >
        Sammenlign med annen bolig
      </Button>
    )
  }

  const secondaryInputs: LoanInputs = {
    ...primaryInputs,
    ...bolig2
  }
  
  const secondaryResult = calculateLoan(secondaryInputs)
  const lanebelop1 = primaryInputs.boligpris - primaryInputs.egenkapital + primaryInputs.fellesgjeld
  const lanebelop2 = bolig2.boligpris - bolig2.egenkapital + bolig2.fellesgjeld

  const periodYears = comparisonPeriod === 'full' 
    ? Math.max(primaryInputs.nedbetalingstid, bolig2.nedbetalingstid)
    : parseInt(comparisonPeriod)

  const cost1 = comparisonPeriod === 'full'
    ? primaryResult.totalKostnad
    : calculateComparisonCost(lanebelop1, primaryInputs.nominellRente, primaryInputs.nedbetalingstid, primaryInputs.loanType, periodYears)

  const cost2 = comparisonPeriod === 'full'
    ? secondaryResult.totalKostnad
    : calculateComparisonCost(lanebelop2, bolig2.nominellRente, bolig2.nedbetalingstid, secondaryInputs.loanType, periodYears)

  const costDiff = cost2 - cost1
  const monthlyDiff = secondaryResult.manedskostnad - primaryResult.manedskostnad
  const cheaperLabel = costDiff > 0 ? 'Bolig 1' : costDiff < 0 ? 'Bolig 2' : 'Likt'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sammenligning</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsComparing(false)}
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Bolig 2 inputs */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-3 font-medium">Bolig 2</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Boligpris"
                value={bolig2.boligpris}
                onChange={(v) => setBolig2(prev => ({ ...prev, boligpris: v }))}
              />
              <NumberInput
                label="Egenkapital"
                value={bolig2.egenkapital}
                onChange={(v) => setBolig2(prev => ({ ...prev, egenkapital: v }))}
              />
              <NumberInput
                label="Fellesgjeld"
                value={bolig2.fellesgjeld}
                onChange={(v) => setBolig2(prev => ({ ...prev, fellesgjeld: v }))}
              />
              <PercentInput
                label="Nominell rente"
                value={bolig2.nominellRente}
                onChange={(v) => setBolig2(prev => ({ ...prev, nominellRente: v }))}
              />
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label className="text-sm font-medium">
                  Nedbetalingstid: {bolig2.nedbetalingstid} år
                </Label>
                <Slider
                  value={[bolig2.nedbetalingstid]}
                  onValueChange={([v]) => setBolig2(prev => ({ ...prev, nedbetalingstid: v }))}
                  min={5}
                  max={30}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Sammenlign over</Label>
            <Tabs value={comparisonPeriod} onValueChange={(v) => setComparisonPeriod(v as typeof comparisonPeriod)}>
              <TabsList className="w-full">
                <TabsTrigger value="5" className="flex-1">5 år</TabsTrigger>
                <TabsTrigger value="10" className="flex-1">10 år</TabsTrigger>
                <TabsTrigger value="20" className="flex-1">20 år</TabsTrigger>
                <TabsTrigger value="full" className="flex-1">Hele</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Comparison results */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <span className="text-xs text-muted-foreground">Bolig 1</span>
              <div className="mt-1 text-lg font-semibold">
                {formatNorwegian(primaryResult.manedskostnad)} kr/mnd
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total over {periodYears} år: {formatNorwegian(cost1)} kr
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <span className="text-xs text-muted-foreground">Bolig 2</span>
              <div className="mt-1 text-lg font-semibold">
                {formatNorwegian(secondaryResult.manedskostnad)} kr/mnd
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total over {periodYears} år: {formatNorwegian(cost2)} kr
              </div>
            </div>
          </div>

          {/* Difference summary */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Månedlig differanse</span>
                <span className={cn(
                  'flex items-center gap-1 font-medium',
                  monthlyDiff > 0 ? 'text-red-600' : monthlyDiff < 0 ? 'text-emerald-600' : ''
                )}>
                  {monthlyDiff > 0 && <ArrowRight className="size-3" />}
                  {monthlyDiff < 0 && <ArrowLeft className="size-3" />}
                  {monthlyDiff === 0 && <Minus className="size-3" />}
                  {formatNorwegian(Math.abs(monthlyDiff))} kr
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total differanse over {periodYears} år
                </span>
                <span className={cn(
                  'font-semibold',
                  costDiff > 0 ? 'text-emerald-600' : costDiff < 0 ? 'text-red-600' : ''
                )}>
                  {costDiff !== 0 && (costDiff > 0 ? '+' : '-')}
                  {formatNorwegian(Math.abs(costDiff))} kr
                </span>
              </div>
              <div className="mt-2 pt-2 border-t text-center">
                <span className="text-sm">
                  <span className="font-semibold">{cheaperLabel}</span>
                  {costDiff !== 0 && ' er billigst over perioden'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
