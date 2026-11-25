"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Wallet, Clock3, Banknote } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { WalletTransactions } from "./WalletTransactions";
import { EarningsEstimator } from "./EarningsEstimator";
import {
  EarningsSummaryCard,
  type EarningsSummaryCardProps,
} from "./EarningsSummaryCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const pesos = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

/*TAKE_NOTE: MOCK UP */
const daily = [
  16000, 19000, 0, 25000, 14000, 12000, 24000, 16000, 27000, 0, 8000, 0, 0, 0,
].map((amount, i) => ({ date: i === 0 ? "30 Sep" : `${i} Oct`, amount }));

/*TAKE_NOTE: MOCK UP */
const summaryCards: EarningsSummaryCardProps[] = [
  {
    title: "Wallet balance",
    value: pesos(51000),
    description: "Available to use or cash out",
    icon: Wallet,
    footer: (
      <Link
        href="/business/settings"
        className="inline-flex items-center gap-1.5 text-xs font-medium underline-offset-4 hover:underline"
      >
        Manage payout method
        <ArrowUpRight className="size-3.5" />
      </Link>
    ),
  },
  {
    title: "Awaiting confirmation",
    value: pesos(2000),
    description: "1 wallet top-up under review",
    icon: Clock3,
    footer: <Badge variant="outline">Pending verification</Badge>,
  },
  {
    title: "Earned in 30 days",
    value: pesos(197580),
    description: "Full fares from completed trips",
    icon: ArrowUpRight,
    footer: (
      <span className="text-muted-foreground">
        You keep 100% of every fare.
      </span>
    ),
  },
  {
    title: "Cash collected this week",
    value: pesos(6390),
    description: "Collected by drivers on 1 cash trip",
    icon: Banknote,
    footer: (
      <span className="text-muted-foreground">
        To be remitted to your office
      </span>
    ),
  },
];

export function EarningsDashboard() {
  const [period, setPeriod] = useState("14");
  const chartData = period === "7" ? daily.slice(-7) : daily;
  const total = chartData.reduce((sum, day) => sum + day.amount, 0);
  return (
    <div className="@container flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Earnings & payouts
          </h1>
          <p className="text-sm text-muted-foreground">
            Your wallet, trip earnings and payouts in one place.
          </p>
        </div>
      </header>
      <section
        aria-label="Balance overview and earnings estimator"
        className="grid items-stretch gap-4 @3xl:grid-cols-2"
      >
        <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2">
          {summaryCards.map((card) => (
            <EarningsSummaryCard key={card.title} {...card} />
          ))}
        </div>
        <EarningsEstimator />
      </section>

      {/* ------ Bar graph ------*/}
      <Card>
        <CardHeader className="flex flex-wrap flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Trip earnings</CardTitle>
            <CardDescription>
              Full fares, before operating expenses.
            </CardDescription>
          </div>
          <Select
            value={period}
            onValueChange={(value) => value && setPeriod(value)}
            items={[
              { value: "14", label: "Last 14 days" },
              { value: "7", label: "Last 7 days" },
            ]}
          >
            <SelectTrigger aria-label="Earnings period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {pesos(total)}
            </span>
            <span className="text-xs text-muted-foreground">
              {period === "14" ? "30 Sep" : "7 Oct"} – 13 Oct 2026 · sample
              period
            </span>
          </div>
          <figure className="h-56 w-full">
            <figcaption className="sr-only">
              Daily trip earnings for the sample period. Total {pesos(total)}.
              Use the arrow keys when the chart is focused to inspect each day.
            </figcaption>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                accessibilityLayer
                margin={{ left: -18, right: 4, top: 8 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickMargin={10}
                  minTickGap={14}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    value === 0 ? "₱0" : `₱${value / 1000}k`
                  }
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--foreground)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [pesos(Number(value)), "Trip earnings"]}
                />
                <Bar
                  dataKey="amount"
                  fill="var(--chart-2)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </figure>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t text-muted-foreground">
          <span>
            No commission. Your only FastMet cost is your vehicle subscription.
          </span>
          <Link
            href="/business/subscriptions"
            className="flex shrink-0 items-center gap-1 font-medium text-foreground hover:underline"
          >
            Subscriptions
            <ArrowUpRight className="size-3.5" />
          </Link>
        </CardFooter>
      </Card>
      <WalletTransactions />
    </div>
  );
}
