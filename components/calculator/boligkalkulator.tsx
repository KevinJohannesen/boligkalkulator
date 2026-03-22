'use client'

import { useState, useMemo } from 'react'
import { 
  calculateLoan, 
  generateAmortizationSchedule,
  getEquityStatus,
  defaultFees,
  type LoanInputs,
  type LoanFees
} from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NumberInput, PercentInput } from './number-input'
import { HeroSection } from './hero-section'
import { LoanVisualizations } from './loan-visualizations'
import { CostBreakdown } from './cost-breakdown'
import { MonthlyBudget } from './monthly-budget'
import { AmortizationTable } from './amortization-table'
import { SensitivityAnalysis } from './sensitivity-analysis'
import { BSUHelper } from './bsu-helper'
import { DebtRatio } from './debt-ratio'
import { ComparisonSection } from './comparison-section'
import { FeesSection } from './fees-section'
import { PurchaseCosts } from './purchase-costs'
import { formatNorwegian } from '@/lib/loan-calculations'

export function Boligkalkulator() {
  // Bolig inputs
  const [boligpris, setBoligpris] = useState(4000000)
  const [egenkapital, setEgenkapital] = useState(400000)
  const [fellesgjeld, setFellesgjeld] = useState(0)

  // Lån inputs
  const [nominellRente, setNominellRente] = useState(5.5)
  const [nedbetalingstid, setNedbetalingstid] = useState(25)
  const [loanType, setLoanType] = useState<'annuitet' | 'serie'>('annuitet')

  // Fees
  const [fees, setFees] = useState<LoanFees>(defaultFees)

  // Økonomi inputs
  const [bruttoinntekt, setBruttoinntekt] = useState(650000)
  const [andreLan, setAndreLan] = useState(0)
  const [antallSokere, setAntallSokere] = useState<1 | 2>(1)
  const [samboerInntekt, setSamboerInntekt] = useState(550000)

  // Calculate all results
  const inputs: LoanInputs = {
    boligpris,
    egenkapital,
    fellesgjeld,
    nominellRente,
    nedbetalingstid,
    loanType,
    bruttoinntekt,
    andreLan,
    antallSokere,
    samboerInntekt,
    fees
  }

  const result = useMemo(() => calculateLoan(inputs), [
    boligpris, egenkapital, fellesgjeld, nominellRente, 
    nedbetalingstid, loanType, bruttoinntekt, andreLan, 
    antallSokere, samboerInntekt, fees
  ])

  const schedule = useMemo(() => 
    generateAmortizationSchedule(result.lanebelop, nominellRente, nedbetalingstid, loanType),
    [result.lanebelop, nominellRente, nedbetalingstid, loanType]
  )

  // Egenkapital hints based on Norwegian regulations
  const equityStatus = getEquityStatus(result.egenkapitalProsent)
  
  const getEgenkapitalHint = () => {
    const statusColorMap = {
      red: 'red' as const,
      yellow: 'yellow' as const,
      blue: 'blue' as const,
      green: 'green' as const
    }
    return { 
      text: `${result.egenkapitalProsent.toFixed(1)}% — ${equityStatus.message}`, 
      color: statusColorMap[equityStatus.status]
    }
  }

  const egenkapitalHint = getEgenkapitalHint()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Boligkalkulator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Beregn hva du kan låne til bolig i Norge
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Left Panel - Inputs */}
          <div className="flex flex-col gap-6">
            {/* Bolig Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Bolig</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <NumberInput
                  label="Boligpris"
                  value={boligpris}
                  onChange={setBoligpris}
                />
                <NumberInput
                  label="Egenkapital"
                  value={egenkapital}
                  onChange={setEgenkapital}
                  hint={egenkapitalHint.text}
                  hintColor={egenkapitalHint.color}
                />
                <NumberInput
                  label="Fellesgjeld"
                  value={fellesgjeld}
                  onChange={setFellesgjeld}
                  hint={fellesgjeld > 0 ? `Totalt lånebeløp inkl. fellesgjeld: ${formatNorwegian(result.lanebelop)} kr` : undefined}
                />
              </CardContent>
            </Card>

            {/* Lån Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lån</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <PercentInput
                  label="Nominell rente"
                  value={nominellRente}
                  onChange={setNominellRente}
                  step={0.1}
                  min={0}
                  max={15}
                />
                
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">
                    Nedbetalingstid: {nedbetalingstid} år
                  </Label>
                  <Slider
                    value={[nedbetalingstid]}
                    onValueChange={([v]) => setNedbetalingstid(v)}
                    min={5}
                    max={30}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 år</span>
                    <span>30 år</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">Lånetype</Label>
                  <Tabs 
                    value={loanType} 
                    onValueChange={(v) => setLoanType(v as 'annuitet' | 'serie')}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="annuitet" className="flex-1">
                        Annuitetslån
                      </TabsTrigger>
                      <TabsTrigger value="serie" className="flex-1">
                        Serielån
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground">
                    {loanType === 'annuitet' 
                      ? 'Lik månedlig betaling hele perioden'
                      : 'Synkende månedlig betaling over tid'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gebyrer og lånekostnader Section */}
            <FeesSection fees={fees} onFeesChange={setFees} />

            {/* Din økonomi Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Din økonomi</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <NumberInput
                  label="Bruttoinntekt per år"
                  value={bruttoinntekt}
                  onChange={setBruttoinntekt}
                />

                <NumberInput
                  label="Andre lån (bil, studielån, forbrukslån)"
                  value={andreLan}
                  onChange={setAndreLan}
                />

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">Antall søkere</Label>
                  <Tabs 
                    value={antallSokere.toString()} 
                    onValueChange={(v) => setAntallSokere(parseInt(v) as 1 | 2)}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="1" className="flex-1">
                        1 søker
                      </TabsTrigger>
                      <TabsTrigger value="2" className="flex-1">
                        2 søkere
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {antallSokere === 2 && (
                  <NumberInput
                    label="Samboers bruttoinntekt per år"
                    value={samboerInntekt}
                    onChange={setSamboerInntekt}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="flex flex-col gap-6">
            <HeroSection result={result} lanebelop={result.lanebelop} />
            
            <LoanVisualizations 
              schedule={schedule} 
              totalLoan={result.lanebelop} 
              totalInterest={result.totalRentekostnad}
            />
            
            <div className="grid gap-6 md:grid-cols-2">
              <CostBreakdown result={result} lanebelop={result.lanebelop} />
              <DebtRatio gjeldsgrad={result.gjeldsgrad} />
            </div>

            <MonthlyBudget 
              terminbelop={result.manedskostnad}
              termingebyr={fees.termingebyrPerManed}
              bruttoinntekt={bruttoinntekt}
              samboerInntekt={samboerInntekt}
              antallSokere={antallSokere}
            />

            <BSUHelper 
              boligpris={boligpris}
              egenkapital={egenkapital}
              egenkapitalProsent={result.egenkapitalProsent}
            />

            <SensitivityAnalysis
              principal={result.lanebelop}
              years={nedbetalingstid}
              loanType={loanType}
              currentRate={nominellRente}
            />

            <AmortizationTable schedule={schedule} />

            <PurchaseCosts 
              boligpris={boligpris}
              egenkapital={egenkapital}
            />

            <ComparisonSection 
              primaryInputs={inputs}
              primaryResult={result}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
