'use client'

import { useState, useMemo } from 'react'
import { formatNorwegian } from '@/lib/loan-calculations'
import type { AmortizationRow } from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LoanVisualizationsProps {
  schedule: AmortizationRow[]
  totalLoan: number
  totalInterest: number
}

// Color palette
const COLORS = {
  loan: '#3B82F6',      // Blue - lånebeløp/gjeld
  interest: '#F97316',  // Orange - renter
  principal: '#22C55E', // Green - avdrag/nedbetalt
}

// Donut Chart Component
function DonutChart({ 
  totalLoan, 
  totalInterest 
}: { 
  totalLoan: number
  totalInterest: number 
}) {
  const totalCost = totalLoan + totalInterest
  const loanPercent = (totalLoan / totalCost) * 100
  const interestPercent = (totalInterest / totalCost) * 100
  
  // SVG donut parameters
  const size = 200
  const strokeWidth = 40
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  
  // Calculate stroke dash offsets
  const loanDash = (loanPercent / 100) * circumference
  const interestDash = (interestPercent / 100) * circumference
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Total kostnad</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Interest segment (orange) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={COLORS.interest}
              strokeWidth={strokeWidth}
              strokeDasharray={`${interestDash} ${circumference}`}
              strokeDashoffset={0}
              className="transition-all duration-500"
            />
            {/* Loan segment (blue) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={COLORS.loan}
              strokeWidth={strokeWidth}
              strokeDasharray={`${loanDash} ${circumference}`}
              strokeDashoffset={-interestDash}
              className="transition-all duration-500"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total kostnad</span>
            <span className="text-lg font-bold">{formatNorwegian(totalCost)} kr</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full" style={{ backgroundColor: COLORS.loan }} />
              <span className="text-sm">Lånebeløp</span>
            </div>
            <span className="text-sm font-medium">{formatNorwegian(totalLoan)} kr</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full" style={{ backgroundColor: COLORS.interest }} />
              <span className="text-sm">Rentekostnad</span>
            </div>
            <span className="text-sm font-medium">{formatNorwegian(totalInterest)} kr</span>
          </div>
        </div>
        
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Du betaler {((totalInterest / totalLoan) * 100).toFixed(0)}% av lånet i renter
        </p>
      </CardContent>
    </Card>
  )
}

// Debt Over Time Line Chart
function DebtLineChart({ 
  schedule, 
  totalLoan 
}: { 
  schedule: AmortizationRow[]
  totalLoan: number 
}) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)
  
  const currentYear = new Date().getFullYear()
  const years = schedule.length
  
  // Chart dimensions
  const width = 400
  const height = 200
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // Generate path data
  const pathData = useMemo(() => {
    const points = schedule.map((row, index) => {
      const x = padding.left + (index / (years - 1 || 1)) * chartWidth
      const y = padding.top + (1 - row.inngaendeGjeld / totalLoan) * chartHeight
      return { x, y, row, index }
    })
    
    // Add final point at end of loan
    points.push({
      x: padding.left + chartWidth,
      y: padding.top + chartHeight,
      row: schedule[schedule.length - 1],
      index: years
    })
    
    return points
  }, [schedule, years, totalLoan, chartWidth, chartHeight, padding])
  
  const linePath = pathData.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')
  
  const areaPath = `${linePath} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`
  
  // Y-axis labels
  const yLabels = [0, totalLoan * 0.25, totalLoan * 0.5, totalLoan * 0.75, totalLoan]
  
  // X-axis labels (every 5 years)
  const xLabels = schedule.filter((_, i) => i % 5 === 0 || i === years - 1).map((row, _, arr) => ({
    year: row.ar,
    label: `${currentYear + row.ar - 1}`
  }))
  
  // Hover data
  const hoveredData = hoveredYear !== null ? schedule[hoveredYear - 1] : null
  const paidSoFar = hoveredData 
    ? totalLoan - hoveredData.utgaendeGjeld 
    : 0
  const interestSoFar = hoveredData
    ? schedule.slice(0, hoveredYear).reduce((sum, row) => sum + row.renter, 0)
    : 0
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Gjeld over tid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-auto"
            onMouseLeave={() => setHoveredYear(null)}
          >
            {/* Y-axis labels */}
            {yLabels.map((val, i) => (
              <text
                key={i}
                x={padding.left - 8}
                y={padding.top + chartHeight - (i / 4) * chartHeight}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
                dominantBaseline="middle"
              >
                {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`}
              </text>
            ))}
            
            {/* X-axis labels */}
            {xLabels.map(({ year, label }) => (
              <text
                key={year}
                x={padding.left + ((year - 1) / (years - 1 || 1)) * chartWidth}
                y={height - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {label}
              </text>
            ))}
            
            {/* Grid lines */}
            {yLabels.map((_, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={padding.top + chartHeight - (i / 4) * chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight - (i / 4) * chartHeight}
                stroke="currentColor"
                strokeOpacity={0.1}
              />
            ))}
            
            {/* Area fill */}
            <path
              d={areaPath}
              fill={COLORS.loan}
              fillOpacity={0.15}
              className="transition-all duration-500"
            />
            
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={COLORS.loan}
              strokeWidth={2.5}
              className="transition-all duration-500"
            />
            
            {/* Hover detection areas */}
            {schedule.map((row, index) => (
              <rect
                key={row.ar}
                x={padding.left + (index / years) * chartWidth}
                y={padding.top}
                width={chartWidth / years}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredYear(row.ar)}
              />
            ))}
            
            {/* Hover line */}
            {hoveredYear !== null && (
              <line
                x1={padding.left + ((hoveredYear - 1) / (years - 1 || 1)) * chartWidth}
                y1={padding.top}
                x2={padding.left + ((hoveredYear - 1) / (years - 1 || 1)) * chartWidth}
                y2={padding.top + chartHeight}
                stroke={COLORS.loan}
                strokeWidth={1}
                strokeDasharray="4 2"
              />
            )}
            
            {/* Hover point */}
            {hoveredData && (
              <circle
                cx={padding.left + ((hoveredYear! - 1) / (years - 1 || 1)) * chartWidth}
                cy={padding.top + (1 - hoveredData.inngaendeGjeld / totalLoan) * chartHeight}
                r={5}
                fill={COLORS.loan}
              />
            )}
          </svg>
          
          {/* Tooltip */}
          {hoveredData && (
            <div 
              className="absolute bg-popover border rounded-lg p-3 shadow-lg text-sm z-10 pointer-events-none"
              style={{
                left: `${((hoveredYear! - 1) / (years - 1 || 1)) * 100}%`,
                top: '10px',
                transform: hoveredYear! > years / 2 ? 'translateX(-100%)' : 'translateX(0)'
              }}
            >
              <div className="font-medium mb-1">År {hoveredYear} ({currentYear + hoveredYear! - 1})</div>
              <div className="text-muted-foreground space-y-0.5">
                <div>Gjenstående: <span className="text-foreground font-medium">{formatNorwegian(hoveredData.utgaendeGjeld)} kr</span></div>
                <div>Nedbetalt: <span className="text-foreground font-medium">{formatNorwegian(paidSoFar)} kr</span></div>
                <div>Renter betalt: <span className="text-foreground font-medium">{formatNorwegian(interestSoFar)} kr</span></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Stacked Bar Chart - Interest vs Principal per Year
function InterestVsPrincipalChart({ 
  schedule 
}: { 
  schedule: AmortizationRow[] 
}) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)
  
  const years = schedule.length
  
  // Chart dimensions
  const width = 800
  const height = 180
  const padding = { top: 30, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // Calculate max terminbeløp for y-axis scale
  const maxTerminbelop = Math.max(...schedule.map(row => row.renter + row.avdrag))
  
  // Bar width with gap
  const barWidth = Math.min(30, (chartWidth / years) * 0.8)
  const barGap = (chartWidth - barWidth * years) / (years + 1)
  
  // Y-axis labels
  const yMax = Math.ceil(maxTerminbelop / 50000) * 50000
  const yLabels = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax]
  
  // Hovered data
  const hoveredData = hoveredYear !== null ? schedule[hoveredYear - 1] : null
  const hoveredTotal = hoveredData ? hoveredData.renter + hoveredData.avdrag : 0
  const hoveredInterestPct = hoveredData ? (hoveredData.renter / hoveredTotal * 100).toFixed(0) : 0
  const hoveredPrincipalPct = hoveredData ? (hoveredData.avdrag / hoveredTotal * 100).toFixed(0) : 0
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Renter vs avdrag per år</CardTitle>
        <p className="text-xs text-muted-foreground">
          De første årene går mesteparten til renter — ikke nedbetaling av gjelden
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-auto"
            onMouseLeave={() => setHoveredYear(null)}
          >
            {/* Y-axis labels */}
            {yLabels.map((val, i) => (
              <text
                key={i}
                x={padding.left - 8}
                y={padding.top + chartHeight - (i / 4) * chartHeight}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
                dominantBaseline="middle"
              >
                {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            ))}
            
            {/* Grid lines */}
            {yLabels.map((_, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={padding.top + chartHeight - (i / 4) * chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight - (i / 4) * chartHeight}
                stroke="currentColor"
                strokeOpacity={0.1}
              />
            ))}
            
            {/* Stacked bars */}
            {schedule.map((row, index) => {
              const x = padding.left + barGap + index * (barWidth + barGap)
              const interestHeight = (row.renter / yMax) * chartHeight
              const principalHeight = (row.avdrag / yMax) * chartHeight
              const isHovered = hoveredYear === row.ar
              
              return (
                <g 
                  key={row.ar}
                  onMouseEnter={() => setHoveredYear(row.ar)}
                >
                  {/* Interest bar (bottom - orange) */}
                  <rect
                    x={x}
                    y={padding.top + chartHeight - interestHeight}
                    width={barWidth}
                    height={interestHeight}
                    fill={COLORS.interest}
                    opacity={isHovered ? 1 : 0.8}
                    className="transition-opacity duration-150"
                  />
                  {/* Principal bar (top - green) */}
                  <rect
                    x={x}
                    y={padding.top + chartHeight - interestHeight - principalHeight}
                    width={barWidth}
                    height={principalHeight}
                    fill={COLORS.principal}
                    opacity={isHovered ? 1 : 0.8}
                    className="transition-opacity duration-150"
                  />
                  {/* Hover detection area */}
                  <rect
                    x={x - barGap / 2}
                    y={padding.top}
                    width={barWidth + barGap}
                    height={chartHeight}
                    fill="transparent"
                  />
                </g>
              )
            })}
            
            {/* X-axis labels (every 5 years for large datasets) */}
            {schedule.map((row, index) => {
              const showLabel = years <= 10 || index % 5 === 0 || index === years - 1
              if (!showLabel) return null
              
              const x = padding.left + barGap + index * (barWidth + barGap) + barWidth / 2
              return (
                <text
                  key={row.ar}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {row.ar}
                </text>
              )
            })}
          </svg>
          
          {/* Tooltip */}
          {hoveredData && (
            <div 
              className="absolute bg-popover border rounded-lg p-3 shadow-lg text-sm z-10 pointer-events-none"
              style={{
                left: `${((hoveredYear! - 0.5) / years) * 100}%`,
                top: '10px',
                transform: hoveredYear! > years / 2 ? 'translateX(-100%)' : 'translateX(0)'
              }}
            >
              <div className="font-medium mb-1">År {hoveredYear}</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: COLORS.interest }} />
                  <span className="text-muted-foreground">Renter:</span>
                  <span className="font-medium">{formatNorwegian(hoveredData.renter)} kr ({hoveredInterestPct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: COLORS.principal }} />
                  <span className="text-muted-foreground">Avdrag:</span>
                  <span className="font-medium">{formatNorwegian(hoveredData.avdrag)} kr ({hoveredPrincipalPct}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded" style={{ backgroundColor: COLORS.interest }} />
            <span className="text-sm text-muted-foreground">Renter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded" style={{ backgroundColor: COLORS.principal }} />
            <span className="text-sm text-muted-foreground">Avdrag</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main visualization component
export function LoanVisualizations({ 
  schedule, 
  totalLoan, 
  totalInterest 
}: LoanVisualizationsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top row: Donut + Line chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <DonutChart totalLoan={totalLoan} totalInterest={totalInterest} />
        <DebtLineChart schedule={schedule} totalLoan={totalLoan} />
      </div>
      
      {/* Bottom: Stacked bar chart (full width) */}
      <InterestVsPrincipalChart schedule={schedule} />
    </div>
  )
}
