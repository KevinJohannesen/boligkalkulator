'use client'

import { useState, Fragment } from 'react'
import { formatNorwegian } from '@/lib/loan-calculations'
import type { AmortizationRow } from '@/lib/loan-calculations'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AmortizationTableProps {
  schedule: AmortizationRow[]
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())
  const currentYear = new Date().getFullYear()

  const toggleYear = (ar: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev)
      if (next.has(ar)) {
        next.delete(ar)
      } else {
        next.add(ar)
      }
      return next
    })
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Amortiseringstabell</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {isOpen ? 'Skjul' : 'Vis'}
                <ChevronDown className={cn(
                  'size-4 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="max-h-[500px] overflow-auto rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-24">Periode</TableHead>
                    <TableHead className="text-right">Terminbeløp</TableHead>
                    <TableHead className="text-right">Renter</TableHead>
                    <TableHead className="text-right">Ekstra avdrag</TableHead>
                    <TableHead className="text-right">Avdrag</TableHead>
                    <TableHead className="text-right">Restgjeld</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((row) => {
                    const year = currentYear + row.ar - 1
                    const isExpanded = expandedYears.has(row.ar)
                    const isCurrentYear = row.ar === 1
                    const yearlyTerminbelop = row.months.reduce((sum, m) => sum + m.terminbelop, 0)
                    
                    return (
                      <Fragment key={`year-${row.ar}`}>
                        {/* Year summary row */}
                        <TableRow
                          className={cn(
                            'cursor-pointer hover:bg-muted/50 font-medium',
                            isCurrentYear && 'bg-muted/30'
                          )}
                          onClick={() => toggleYear(row.ar)}
                        >
                          <TableCell>
                            År {row.ar}
                            {isCurrentYear && (
                              <span className="ml-1 text-xs text-muted-foreground">({year})</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNorwegian(yearlyTerminbelop)}
                          </TableCell>
                          <TableCell className="text-right text-amber-600">
                            {formatNorwegian(row.renter)}
                          </TableCell>
                          <TableCell className="text-right">
                            0
                          </TableCell>
                          <TableCell className="text-right text-emerald-600">
                            {formatNorwegian(row.avdrag)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNorwegian(row.utgaendeGjeld)}
                          </TableCell>
                          <TableCell className="text-center">
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-emerald-600" />
                            ) : (
                              <ChevronDown className="size-4 text-emerald-600" />
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {/* Monthly rows (expanded) */}
                        {isExpanded && row.months.map((month, monthIndex) => (
                          <TableRow 
                            key={`year-${row.ar}-month-${month.period}`}
                            className={cn(
                              monthIndex % 2 === 0 ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-background'
                            )}
                          >
                            <TableCell className="pl-8 text-muted-foreground">
                              {month.period}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNorwegian(month.terminbelop)}
                            </TableCell>
                            <TableCell className="text-right text-amber-600">
                              {formatNorwegian(month.renter)}
                            </TableCell>
                            <TableCell className="text-right">
                              {month.ekstraAvdrag}
                            </TableCell>
                            <TableCell className="text-right text-emerald-600">
                              {formatNorwegian(month.avdrag)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNorwegian(month.utgaendeGjeld)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Klikk på et år for å se månedlig nedbrytning
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
