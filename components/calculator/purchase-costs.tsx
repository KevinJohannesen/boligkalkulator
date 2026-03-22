'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NumberInput } from './number-input'
import { formatNorwegian, calculatePurchaseCosts } from '@/lib/loan-calculations'
import { AlertTriangle, Info } from 'lucide-react'

interface PurchaseCostsProps {
  boligpris: number
  egenkapital: number
}

export function PurchaseCosts({ boligpris, egenkapital }: PurchaseCostsProps) {
  const [eiendomstype, setEiendomstype] = useState<'selveier' | 'borettslag'>('selveier')
  const [takst, setTakst] = useState(10000)
  const [boligkjoperforsikring, setBoligkjoperforsikring] = useState(8000)
  const [andreCostnader, setAndreCostnader] = useState(0)

  const costs = useMemo(() => 
    calculatePurchaseCosts(boligpris, egenkapital, eiendomstype, takst, boligkjoperforsikring, andreCostnader),
    [boligpris, egenkapital, eiendomstype, takst, boligkjoperforsikring, andreCostnader]
  )

  return (
    <Card className="border-muted-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="size-4 text-muted-foreground" />
          Omkostninger ved kjøp
        </CardTitle>
        <CardDescription>
          Engangskostnader — ikke en del av lånet
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Eiendomstype</Label>
          <Tabs 
            value={eiendomstype} 
            onValueChange={(v) => setEiendomstype(v as 'selveier' | 'borettslag')}
          >
            <TabsList className="w-full">
              <TabsTrigger value="selveier" className="flex-1">
                Selveier
              </TabsTrigger>
              <TabsTrigger value="borettslag" className="flex-1">
                Borettslag/Aksje
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">
              Dokumentavgift {eiendomstype === 'selveier' ? '(2.5%)' : ''}:
            </span>
            <span className="font-medium">
              {formatNorwegian(costs.dokumentavgift)} kr
            </span>
          </div>
        </div>

        <NumberInput
          label="Takst/tilstandsrapport"
          value={takst}
          onChange={setTakst}
        />

        <NumberInput
          label="Boligkjøperforsikring"
          value={boligkjoperforsikring}
          onChange={setBoligkjoperforsikring}
        />

        <NumberInput
          label="Andre kostnader (valgfritt)"
          value={andreCostnader}
          onChange={setAndreCostnader}
        />

        <div className="mt-2 rounded-lg bg-muted p-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Sum omkostninger</span>
              <span className="font-semibold">{formatNorwegian(costs.sumOmkostninger)} kr</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Egenkapital etter omkostninger</span>
              <span className={`font-medium ${costs.egenkapitalEtterOmkostninger < 0 ? 'text-red-600' : ''}`}>
                {formatNorwegian(costs.egenkapitalEtterOmkostninger)} kr
              </span>
            </div>

            <div className="flex justify-between border-t pt-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Du trenger totalt på kjøpsdagen
              </span>
              <span className="font-semibold">
                {formatNorwegian(egenkapital + costs.sumOmkostninger)} kr
              </span>
            </div>
          </div>
        </div>

        {costs.underKravEtterOmkostninger && (
          <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-red-700">
            <AlertTriangle className="size-5 mt-0.5 shrink-0" />
            <p className="text-sm">
              Omkostningene spiser av egenkapitalen din — du er under 10%-kravet etter fratrekk
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
