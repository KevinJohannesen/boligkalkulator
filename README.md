<div align="center">

# Boligkalkulator

**A Norwegian mortgage calculator — figure out what you can afford before you buy.**

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)

**[▶ Try it at boligkalkulator-eight.vercel.app](https://boligkalkulator-eight.vercel.app/)**

</div>

---

## Overview

**Boligkalkulator** is a web app built for anyone buying property in Norway. It applies real Norwegian lending rules — 5× income cap, 10% equity requirement, and the mandatory +3% stress test — and gives you a clear picture of your financial situation before you commit to a purchase.

---

## Features

- **Max loan calculator** — based on income, equity, and Norwegian regulations
- **Monthly cost breakdown** — principal, interest, fees, and total budget
- **Stress test** — simulates a +3% interest rate increase per lending regulations
- **Debt ratio (gjeldsgrad)** — visual indicator with regulatory thresholds
- **Annuity vs. serial loan** — compare repayment structures side by side
- **Amortization table** — full month-by-month schedule
- **Purchase cost estimator** — document fee, valuation, BSU tips
- **Sensitivity analysis** — see how costs change across interest rate scenarios
- **BSU helper** — guidance when equity falls below the 10% requirement
- **Charts** — donut, line, and stacked bar visualizations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| UI Components | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) |
| Styling | Tailwind CSS v4 |
| Charts | [Recharts](https://recharts.org) |
| Forms | React Hook Form + Zod |
| Animations | tw-animate-css |

---

## Installation

**Prerequisites:** Node.js 18+ and [pnpm](https://pnpm.io)

```bash
# Clone the repo
git clone https://github.com/your-username/boligkalkulator.git
cd boligkalkulator

# Install dependencies
pnpm install
```

---

## Usage

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Project Structure

```
app/          # Next.js App Router pages and layout
components/
  calculator/ # All mortgage calculator components
  ui/         # shadcn/ui base components
hooks/        # Custom React hooks
lib/          # Loan calculation logic and utilities
styles/       # Global CSS
```
