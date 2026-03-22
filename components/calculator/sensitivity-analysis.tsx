'use client'

import { formatNorwegian, calculateSensitivity } from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface SensitivityAnalysisProps {
  principal: number
  years: number
  loanType: 'annuitet' | 'serie'
  currentRate: number
}

export function SensitivityAnalysis({ 
  principal, 
  years, 
  loanType, 
  currentRate 
}: SensitivityAnalysisProps) {
  const sensitivity = calculateSensitivity(principal, years, loanType, currentRate)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rentesensitivitet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rente</TableHead>
                <TableHead className="text-right">Månedskostnad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensitivity.map(({ rate, payment, isCurrent }) => (
                <TableRow 
                  key={rate}
                  className={cn(isCurrent && 'bg-muted/50 font-medium')}
                >
                  <TableCell>
                    {rate.toFixed(1)}%
                    {isCurrent && (
                      <span className="ml-2 rounded bg-foreground px-1.5 py-0.5 text-xs text-background">
                        Valgt
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNorwegian(payment)} kr
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
