'use client'

import { formatNorwegian } from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface BSUHelperProps {
  boligpris: number
  egenkapital: number
  egenkapitalProsent: number
}

export function BSUHelper({ boligpris, egenkapital, egenkapitalProsent }: BSUHelperProps) {
  // Only show if under 10% (legal minimum per boliglånsforskriften)
  if (egenkapitalProsent >= 10) {
    return null
  }

  const targetEgenkapital = boligpris * 0.10
  const mangler = targetEgenkapital - egenkapital
  const maxBSUPerYear = 27500
  const monthsNeeded = Math.ceil(mangler / (maxBSUPerYear / 12))
  const yearsNeeded = Math.floor(monthsNeeded / 12)
  const remainingMonths = monthsNeeded % 12

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-5 text-red-600" />
          BSU-hjelper
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-red-700">
            Du har under 10% egenkapital, som er lovpålagt minstekrav (boliglånsforskriften).
            Banken kan ikke innvilge lånet uten dispensasjon.
          </p>
          
          <div className="rounded-md bg-background/80 p-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Du mangler for å nå 10%:</span>
                <span className="font-semibold text-foreground">
                  {formatNorwegian(Math.max(0, mangler))} kr
                </span>
              </div>
              {mangler > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Med maks BSU-sparing:</span>
                  <span className="font-medium text-foreground">
                    {yearsNeeded > 0 && `${yearsNeeded} år `}
                    {remainingMonths > 0 && `${remainingMonths} mnd`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Maks BSU-sparing er {formatNorwegian(maxBSUPerYear)} kr per år. 
            Total BSU-grense er 300 000 kr.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
