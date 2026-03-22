// Norwegian loan calculation utilities

export interface LoanFees {
  termingebyrPerManed: number
  antallTerminerPerAr: 12 | 24
  etableringsgebyr: number
  tinglysningsgebyr: number
}

export interface LoanInputs {
  boligpris: number
  egenkapital: number
  fellesgjeld: number
  nominellRente: number
  nedbetalingstid: number
  loanType: 'annuitet' | 'serie'
  bruttoinntekt: number
  andreLan: number
  antallSokere: 1 | 2
  samboerInntekt: number
  fees: LoanFees
}

export interface LoanResult {
  lanebelop: number
  maksLan: number
  egenkapitalProsent: number
  manedskostnad: number
  totalKostnad: number
  totalRentekostnad: number
  nominellRente: number
  effektivRente: number
  effektivRenteDifferanse: number
  sumTermingebyrer: number
  gjeldsgrad: number
  stresstestRente: number
  stresstestManedskostnad: number
  godkjent: boolean
  stresstestGodkjent: boolean
  nedbetalingsAr: number
  nedbetalingsManed: number
  fees: LoanFees
}

export interface MonthlyAmortizationRow {
  period: number
  terminbelop: number
  renter: number
  ekstraAvdrag: number
  avdrag: number
  utgaendeGjeld: number
}

export interface AmortizationRow {
  ar: number
  inngaendeGjeld: number
  renter: number
  avdrag: number
  utgaendeGjeld: number
  terminbelop: number
  months: MonthlyAmortizationRow[]
}

export interface PurchaseCosts {
  eiendomstype: 'selveier' | 'borettslag'
  dokumentavgift: number
  takst: number
  boligkjoperforsikring: number
  andreCostnader: number
  sumOmkostninger: number
  egenkapitalEtterOmkostninger: number
  totalBelop: number
  underKravEtterOmkostninger: boolean
}

// Default fees
export const defaultFees: LoanFees = {
  termingebyrPerManed: 45,
  antallTerminerPerAr: 12,
  etableringsgebyr: 2000,
  tinglysningsgebyr: 585
}

// Format number with Norwegian thousand separators
export function formatNorwegian(num: number): string {
  return Math.round(num).toLocaleString('nb-NO')
}

// Parse Norwegian formatted number
export function parseNorwegian(str: string): number {
  if (!str) return 0
  return parseInt(str.replace(/\s/g, '').replace(/,/g, ''), 10) || 0
}

// Calculate monthly payment for annuity loan
export function calculateAnnuityPayment(
  principal: number,
  yearlyRate: number,
  years: number
): number {
  const monthlyRate = yearlyRate / 100 / 12
  const numPayments = years * 12
  
  if (monthlyRate === 0) return principal / numPayments
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  return payment
}

// Calculate first month payment for serial loan
export function calculateSerialFirstPayment(
  principal: number,
  yearlyRate: number,
  years: number
): number {
  const monthlyRate = yearlyRate / 100 / 12
  const numPayments = years * 12
  const avdrag = principal / numPayments
  const rente = principal * monthlyRate
  return avdrag + rente
}

// Calculate last month payment for serial loan
export function calculateSerialLastPayment(
  principal: number,
  yearlyRate: number,
  years: number
): number {
  const monthlyRate = yearlyRate / 100 / 12
  const numPayments = years * 12
  const avdrag = principal / numPayments
  const rente = avdrag * monthlyRate
  return avdrag + rente
}

// Calculate average monthly payment for serial loan
export function calculateSerialAveragePayment(
  principal: number,
  yearlyRate: number,
  years: number
): number {
  const first = calculateSerialFirstPayment(principal, yearlyRate, years)
  const last = calculateSerialLastPayment(principal, yearlyRate, years)
  return (first + last) / 2
}

// Generate amortization schedule with monthly breakdown
export function generateAmortizationSchedule(
  principal: number,
  yearlyRate: number,
  years: number,
  loanType: 'annuitet' | 'serie'
): AmortizationRow[] {
  const schedule: AmortizationRow[] = []
  const monthlyRate = yearlyRate / 100 / 12
  const numPayments = years * 12
  
  let gjeld = principal
  
  if (loanType === 'annuitet') {
    const terminbelop = calculateAnnuityPayment(principal, yearlyRate, years)
    
    for (let ar = 1; ar <= years; ar++) {
      const inngaendeGjeld = gjeld
      let arsRenter = 0
      let arsAvdrag = 0
      const months: MonthlyAmortizationRow[] = []
      
      for (let maned = 1; maned <= 12; maned++) {
        const rente = gjeld * monthlyRate
        const avdrag = terminbelop - rente
        arsRenter += rente
        arsAvdrag += avdrag
        gjeld -= avdrag
        
        months.push({
          period: maned,
          terminbelop: Math.round(terminbelop),
          renter: Math.round(rente),
          ekstraAvdrag: 0,
          avdrag: Math.round(avdrag),
          utgaendeGjeld: Math.max(0, Math.round(gjeld))
        })
      }
      
      schedule.push({
        ar,
        inngaendeGjeld,
        renter: arsRenter,
        avdrag: arsAvdrag,
        utgaendeGjeld: Math.max(0, gjeld),
        terminbelop,
        months
      })
    }
  } else {
    const maanedligAvdrag = principal / numPayments
    
    for (let ar = 1; ar <= years; ar++) {
      const inngaendeGjeld = gjeld
      let arsRenter = 0
      let arsAvdrag = 0
      const months: MonthlyAmortizationRow[] = []
      
      for (let maned = 1; maned <= 12; maned++) {
        const rente = gjeld * monthlyRate
        const terminbelop = maanedligAvdrag + rente
        arsRenter += rente
        arsAvdrag += maanedligAvdrag
        gjeld -= maanedligAvdrag
        
        months.push({
          period: maned,
          terminbelop: Math.round(terminbelop),
          renter: Math.round(rente),
          ekstraAvdrag: 0,
          avdrag: Math.round(maanedligAvdrag),
          utgaendeGjeld: Math.max(0, Math.round(gjeld))
        })
      }
      
      schedule.push({
        ar,
        inngaendeGjeld,
        renter: arsRenter,
        avdrag: arsAvdrag,
        utgaendeGjeld: Math.max(0, gjeld),
        terminbelop: inngaendeGjeld / 12 * monthlyRate + maanedligAvdrag,
        months
      })
    }
  }
  
  return schedule
}

// Calculate total cost over loan lifetime
export function calculateTotalCost(
  principal: number,
  yearlyRate: number,
  years: number,
  loanType: 'annuitet' | 'serie',
  fees: LoanFees
): { totalCost: number; totalInterest: number; sumTermingebyrer: number } {
  const schedule = generateAmortizationSchedule(principal, yearlyRate, years, loanType)
  const totalInterest = schedule.reduce((sum, row) => sum + row.renter, 0)
  const numPayments = years * fees.antallTerminerPerAr
  const sumTermingebyrer = fees.termingebyrPerManed * numPayments
  const totalCost = principal + totalInterest + sumTermingebyrer + fees.etableringsgebyr + fees.tinglysningsgebyr
  
  return { totalCost, totalInterest, sumTermingebyrer }
}

// Calculate effective interest rate using Newton-Raphson iteration
// Based on APRC (Annual Percentage Rate of Charge) per EU directive
export function calculateEffectiveRate(
  principal: number,
  yearlyRate: number,
  years: number,
  loanType: 'annuitet' | 'serie',
  fees: LoanFees
): number {
  // Net disbursed = principal - establishment fee - registration fee
  const nettoUtbetalt = principal - fees.etableringsgebyr - fees.tinglysningsgebyr
  
  // Monthly payment (excluding fee)
  const terminbelop = loanType === 'annuitet'
    ? calculateAnnuityPayment(principal, yearlyRate, years)
    : calculateSerialFirstPayment(principal, yearlyRate, years)
  
  // Total monthly payment including fee
  const totalTerminbelop = terminbelop + fees.termingebyrPerManed
  
  const numPayments = years * 12
  const tolerance = 0.0000001
  const maxIterations = 1000
  
  // Initial guess: nominal rate / 12
  let r = yearlyRate / 100 / 12
  
  for (let i = 0; i < maxIterations; i++) {
    // For annuity: NPV = Σ payment / (1+r)^t - nettoUtbetalt = 0
    let npv = 0
    let npvDerivative = 0
    
    if (loanType === 'annuitet') {
      // All payments are the same for annuity
      for (let t = 1; t <= numPayments; t++) {
        const discountFactor = Math.pow(1 + r, t)
        npv += totalTerminbelop / discountFactor
        npvDerivative -= t * totalTerminbelop / Math.pow(1 + r, t + 1)
      }
    } else {
      // For serial loan, calculate each payment
      const monthlyRate = yearlyRate / 100 / 12
      const maanedligAvdrag = principal / numPayments
      let gjeld = principal
      
      for (let t = 1; t <= numPayments; t++) {
        const rente = gjeld * monthlyRate
        const payment = maanedligAvdrag + rente + fees.termingebyrPerManed
        const discountFactor = Math.pow(1 + r, t)
        npv += payment / discountFactor
        npvDerivative -= t * payment / Math.pow(1 + r, t + 1)
        gjeld -= maanedligAvdrag
      }
    }
    
    npv -= nettoUtbetalt
    
    // Newton-Raphson step
    const rNew = r - npv / npvDerivative
    
    if (Math.abs(rNew - r) < tolerance) {
      // Convert to annual effective rate
      const effectiveRate = (Math.pow(1 + rNew, 12) - 1) * 100
      return effectiveRate
    }
    
    r = rNew
    
    // Ensure r stays positive and reasonable
    if (r < 0) r = 0.0001
    if (r > 1) r = 0.5
  }
  
  // Fallback if convergence fails
  const effectiveRate = (Math.pow(1 + r, 12) - 1) * 100
  return effectiveRate
}

// Main calculation function
export function calculateLoan(inputs: LoanInputs): LoanResult {
  const {
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
  } = inputs
  
  const totalInntekt = antallSokere === 2 ? bruttoinntekt + samboerInntekt : bruttoinntekt
  const lanebelop = boligpris - egenkapital + fellesgjeld
  const maksLan = totalInntekt * 5
  const egenkapitalProsent = boligpris > 0 ? (egenkapital / boligpris) * 100 : 0
  
  // Monthly payment
  let manedskostnad: number
  if (loanType === 'annuitet') {
    manedskostnad = calculateAnnuityPayment(lanebelop, nominellRente, nedbetalingstid)
  } else {
    manedskostnad = calculateSerialFirstPayment(lanebelop, nominellRente, nedbetalingstid)
  }
  
  // Total cost
  const { totalCost, totalInterest, sumTermingebyrer } = calculateTotalCost(
    lanebelop, nominellRente, nedbetalingstid, loanType, fees
  )
  
  // Effective rate using Newton-Raphson
  const effektivRente = calculateEffectiveRate(lanebelop, nominellRente, nedbetalingstid, loanType, fees)
  const effektivRenteDifferanse = effektivRente - nominellRente
  
  // Debt ratio (gjeldsgrad)
  const totalGjeld = lanebelop + andreLan
  const gjeldsgrad = totalInntekt > 0 ? (totalGjeld / totalInntekt) * 100 : 0
  
  // Stress test (3% higher interest)
  const stresstestRente = nominellRente + 3
  let stresstestManedskostnad: number
  if (loanType === 'annuitet') {
    stresstestManedskostnad = calculateAnnuityPayment(lanebelop, stresstestRente, nedbetalingstid)
  } else {
    stresstestManedskostnad = calculateSerialFirstPayment(lanebelop, stresstestRente, nedbetalingstid)
  }
  
  // Approval checks - 10% is the legal minimum per boliglånsforskriften
  const godkjent = lanebelop <= maksLan && egenkapitalProsent >= 10
  
  // Stress test approval: can afford if payment is less than 50% of monthly net income
  const monthlyNetIncome = totalInntekt / 12 * 0.7 // Approximate net after tax
  const stresstestGodkjent = stresstestManedskostnad < monthlyNetIncome * 0.5
  
  return {
    lanebelop,
    maksLan,
    egenkapitalProsent,
    manedskostnad,
    totalKostnad: totalCost,
    totalRentekostnad: totalInterest,
    nominellRente,
    effektivRente,
    effektivRenteDifferanse,
    sumTermingebyrer,
    gjeldsgrad,
    stresstestRente,
    stresstestManedskostnad,
    godkjent,
    stresstestGodkjent,
    nedbetalingsAr: nedbetalingstid,
    nedbetalingsManed: 0,
    fees
  }
}

// Calculate sensitivity table
export function calculateSensitivity(
  principal: number,
  years: number,
  loanType: 'annuitet' | 'serie',
  currentRate: number
): { rate: number; payment: number; isCurrent: boolean }[] {
  const rates = [4, 5, 6, 7, 8]
  
  // Add current rate if not in list
  if (!rates.includes(currentRate)) {
    rates.push(currentRate)
    rates.sort((a, b) => a - b)
  }
  
  return rates.map(rate => ({
    rate,
    payment: loanType === 'annuitet' 
      ? calculateAnnuityPayment(principal, rate, years)
      : calculateSerialFirstPayment(principal, rate, years),
    isCurrent: rate === currentRate
  }))
}

// Calculate comparison over different time periods
export function calculateComparisonCost(
  principal: number,
  yearlyRate: number,
  years: number,
  loanType: 'annuitet' | 'serie',
  periodYears: number
): number {
  const monthlyRate = yearlyRate / 100 / 12
  const numPayments = years * 12
  let totalPaid = 0
  let gjeld = principal
  
  if (loanType === 'annuitet') {
    const terminbelop = calculateAnnuityPayment(principal, yearlyRate, years)
    const periodsToCalculate = Math.min(periodYears * 12, numPayments)
    totalPaid = terminbelop * periodsToCalculate
  } else {
    const maanedligAvdrag = principal / numPayments
    const periodsToCalculate = Math.min(periodYears * 12, numPayments)
    
    for (let i = 0; i < periodsToCalculate; i++) {
      const rente = gjeld * monthlyRate
      totalPaid += maanedligAvdrag + rente
      gjeld -= maanedligAvdrag
    }
  }
  
  return totalPaid
}

// Calculate purchase costs
export function calculatePurchaseCosts(
  boligpris: number,
  egenkapital: number,
  eiendomstype: 'selveier' | 'borettslag',
  takst: number,
  boligkjoperforsikring: number,
  andreCostnader: number
): PurchaseCosts {
  const dokumentavgift = eiendomstype === 'selveier' ? boligpris * 0.025 : 0
  const sumOmkostninger = dokumentavgift + takst + boligkjoperforsikring + andreCostnader
  const egenkapitalEtterOmkostninger = egenkapital - sumOmkostninger
  const totalBelop = egenkapital + sumOmkostninger
  const underKravEtterOmkostninger = boligpris > 0 && (egenkapitalEtterOmkostninger / boligpris) < 0.10
  
  return {
    eiendomstype,
    dokumentavgift,
    takst,
    boligkjoperforsikring,
    andreCostnader,
    sumOmkostninger,
    egenkapitalEtterOmkostninger,
    totalBelop,
    underKravEtterOmkostninger
  }
}

// Get equity status based on Norwegian regulations
export function getEquityStatus(egenkapitalProsent: number): {
  status: 'red' | 'yellow' | 'blue' | 'green'
  message: string
} {
  if (egenkapitalProsent < 10) {
    return {
      status: 'red',
      message: 'Under lovpålagt egenkapitalkrav — banken kan ikke innvilge lånet'
    }
  }
  if (egenkapitalProsent < 15) {
    return {
      status: 'yellow',
      message: 'Godkjent, men mange banker krever tilleggssikkerhet eller kausjonist'
    }
  }
  if (egenkapitalProsent < 25) {
    return {
      status: 'blue',
      message: 'Godkjent egenkapital'
    }
  }
  return {
    status: 'green',
    message: 'God egenkapital — ingen tilleggssikkerhet nødvendig'
  }
}
