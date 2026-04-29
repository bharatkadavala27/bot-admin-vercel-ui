import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, Wallet, Filter, CalendarDays, Loader2, Sparkles, Receipt, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { ViewToggle } from "@/components/shared/view-toggle";
import { FormInput } from "@/components/shared/form-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/shared/stat-card";
import { useSalaryService, type SalaryRecord } from "@/services/salary-service";
import { toast } from "sonner";
import { cn, formatTime12h } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_app/salary")({
  component: SalaryPage,
});

function fmtINR(n: number) { return "₹" + (n || 0).toLocaleString("en-IN"); }

const MONTHS = [
  { label: "May 2025", m: 5, y: 2025 },
  { label: "April 2025", m: 4, y: 2025 },
  { label: "March 2025", m: 3, y: 2025 },
  { label: "February 2025", m: 2, y: 2025 },
  { label: "January 2025", m: 1, y: 2025 },
];

function SalaryPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("4-2025");
  const [detailsRecord, setDetailsRecord] = useState<SalaryRecord | null>(null);
  const [view, setView] = useState<"grid" | "list">("list");

  const [m, y] = selectedMonth.split("-").map(Number);
  const { salaryRecords: list, isLoading, updateSalary, generateSalaries, isGenerating } = useSalaryService(m, y);

  const filtered = useMemo(() => list.filter((s) => {
    const name = s.employeeId?.name || "";
    const okSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    const okStatus = status === "all" || s.status === status;
    return okSearch && okStatus;
  }), [search, status, list]);

  const total = filtered.reduce((s, r) => s + r.totalSalary, 0);
  const paid = filtered.filter((r) => r.status === "paid").reduce((s, r) => s + r.totalSalary, 0);
  const pending = filtered.filter((r) => r.status === "pending").reduce((s, r) => s + r.totalSalary, 0);

  const handlePay = async (id: string) => {
    try {
      await updateSalary({ id, status: "paid" });
    } catch (err) { }
  };

  const handleGenerate = async () => {
    try {
      await generateSalaries({ month: m, year: y });
    } catch (err) { }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Management"
        description="View and manage payroll for the organization."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-9 text-[13px] bg-gradient-primary text-primary-foreground hover:shadow-md rounded-xl transition-all font-bold gap-2"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Payroll
            </Button>
            <Button size="sm" variant="outline" className="h-9 text-[13px] rounded-lg" onClick={() => toast.success("Exported as CSV")}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <StatCard label="Total Payroll" value={fmtINR(total)} icon={Wallet} accent="primary" />
            <StatCard label="Paid" value={fmtINR(paid)} icon={Wallet} accent="success" />
            <StatCard label="Pending" value={fmtINR(pending)} icon={Wallet} accent="warning" />
          </>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <FormInput
          placeholder="Search employee..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <ViewToggle view={view} onViewChange={setView} />
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-10 w-full md:w-[160px] border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl text-[13px] font-medium transition-all gap-2 px-3 shadow-none">
                <CalendarDays className="h-3.5 w-3.5" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                {MONTHS.map((item) => (
                  <SelectItem key={`${item.m}-${item.y}`} value={`${item.m}-${item.y}`}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-full md:w-[140px] border border-success/20 bg-success/5 text-success hover:bg-success/10 rounded-xl text-[13px] font-medium transition-all gap-2 px-3 shadow-none">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </motion.div>
        ) : view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((r) => (
              <Card key={r._id} className="p-5 border-border/60 bg-white hover:shadow-md transition-all relative overflow-hidden flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-foreground">{r.employeeId?.name || "—"}</span>
                    <span className="text-[11px] text-muted-foreground">{MONTHS.find(m => m.m === r.month)?.label || r.month}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-bold px-2 py-0.5",
                      r.status === "paid" ? "border-success/40 text-success bg-success/8" : "border-warning/40 text-warning-foreground bg-warning/8"
                    )}
                  >{r.status.toUpperCase()}</Badge>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg border border-border/40">
                    <span className="text-[11px] text-muted-foreground font-medium">Net Payable</span>
                    <span className="text-[16px] font-black text-primary">{fmtINR(r.totalSalary)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="p-2 rounded-lg bg-success/5 border border-success/10">
                      <p className="text-[9px] text-success font-bold uppercase tracking-tighter">Earnings</p>
                      <p className="text-[13px] font-bold">{fmtINR(r.baseSalary + (r.breakdown?.earnings || []).reduce((s, e) => s + (e.name !== "Basic Salary" ? e.amount : 0), 0))}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                      <p className="text-[9px] text-destructive font-bold uppercase tracking-tighter">Deductions</p>
                      <p className="text-[13px] font-bold">-{fmtINR(r.deductions)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[11px] font-bold text-muted-foreground hover:bg-muted"
                    onClick={() => setDetailsRecord(r)}
                  >
                    View Slip
                  </Button>
                  <Button
                    size="sm"
                    variant={r.status === "paid" ? "ghost" : "outline"}
                    disabled={r.status === "paid"}
                    className="h-8 text-[11px] px-4 font-bold rounded-lg"
                    onClick={() => handlePay(r._id)}
                  >
                    {r.status === "paid" ? "Paid" : "Pay now"}
                  </Button>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DataTable
              className="rounded-none shadow-sm"
              headers={[
                "Employee", "Month", 
                <div key="base" className="text-right w-full">CTC</div>,
                <div key="bonus" className="text-right w-full">Allowance</div>,
                <div key="ded" className="text-right w-full">Deductions</div>,
                <div key="net" className="text-right w-full">Net Pay</div>,
                "Status", 
                <div key="action" className="text-right w-full">Actions</div>
              ]}
              isEmpty={filtered.length === 0}
              emptyMessage="No payroll records found for this month."
            >
              {filtered.map((r) => (
                <DataTableRow key={r._id}>
                  <DataTableCell isFirst className="font-medium text-[13px]">{r.employeeId?.name || "—"}</DataTableCell>
                  <DataTableCell className="text-[12px] text-muted-foreground">{MONTHS.find(m => m.m === r.month)?.label || r.month}</DataTableCell>
                  <DataTableCell className="text-[13px] text-right font-mono text-muted-foreground">{fmtINR(r.baseSalary)}</DataTableCell>
                  <DataTableCell className="text-[13px] text-right text-success font-medium">+{fmtINR((r.breakdown?.earnings || []).reduce((s, e) => s + (e.name !== "Basic Salary" ? e.amount : 0), 0))}</DataTableCell>
                  <DataTableCell className="text-[13px] text-right text-destructive font-medium">-{fmtINR(r.deductions)}</DataTableCell>
                  <DataTableCell className="text-[13px] text-right font-bold text-foreground">{fmtINR(r.totalSalary)}</DataTableCell>
                  <DataTableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5",
                        r.status === "paid" ? "border-success/40 text-success bg-success/8" : "border-warning/40 text-warning-foreground bg-warning/8"
                      )}
                    >{r.status.toUpperCase()}</Badge>
                  </DataTableCell>
                  <DataTableCell isLast>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg hover:bg-muted"
                        onClick={() => setDetailsRecord(r)}
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={r.status === "paid"}
                        className="h-8 text-[12px] px-3 font-semibold hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded-lg"
                        onClick={() => handlePay(r._id)}
                      >
                        {r.status === "paid" ? "Paid" : "Pay now"}
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakdown Dialog */}
      <Dialog open={!!detailsRecord} onOpenChange={(o) => !o && setDetailsRecord(null)}>
        <DialogContent className="max-w-md rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
          <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
            <DialogHeader>
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-primary/10 grid place-items-center mb-3">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-[18px] font-bold">{detailsRecord?.employeeId?.name}</DialogTitle>
              <DialogDescription className="text-[13px] font-medium text-muted-foreground">
                Salary Slip — {MONTHS.find(m => m.m === detailsRecord?.month)?.label}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 bg-white">
            {/* Earnings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-success uppercase tracking-widest">
                <ArrowUpRight className="h-3.5 w-3.5" /> Earnings
              </div>
              <div className="space-y-2.5">
                {(detailsRecord?.breakdown?.earnings || []).map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[13px]">
                    <span className="text-muted-foreground font-medium">{e.name}</span>
                    <span className="font-bold text-foreground">{fmtINR(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/40" />

            {/* Deductions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-destructive uppercase tracking-widest">
                <ArrowDownRight className="h-3.5 w-3.5" /> Deductions
              </div>
              <div className="space-y-2.5">
                {(detailsRecord?.breakdown?.deductions || []).map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[13px]">
                    <span className="text-muted-foreground font-medium">{e.name}</span>
                    <span className="font-bold text-destructive">-{fmtINR(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer */}
            <div className="mt-8 p-4 rounded-2xl bg-muted/30 border border-border/40 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Payable</p>
                <p className="text-[20px] font-black text-primary">{fmtINR(detailsRecord?.totalSalary)}</p>
              </div>
              <Badge variant="outline" className={cn(
                "px-3 py-1 rounded-full text-[11px] font-bold",
                detailsRecord?.status === "paid" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning-foreground border-warning/20"
              )}>
                {detailsRecord?.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
