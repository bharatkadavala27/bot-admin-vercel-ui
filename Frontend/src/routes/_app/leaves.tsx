import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, CalendarDays, CheckCircle2, XCircle, Clock, Plane, HeartPulse, MoreHorizontal, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { employees } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FormInput } from "@/components/shared/form-input";
import { ViewToggle } from "@/components/shared/view-toggle";

export const Route = createFileRoute("/_app/leaves")({
  component: LeavesPage,
});

type LeaveStatus = "pending" | "approved" | "rejected";
type LeaveType = "annual" | "sick" | "casual" | "maternity";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

const mockLeaves: LeaveRequest[] = [
  { id: "l1", employeeId: employees[0].id, employeeName: employees[0].name, type: "annual", startDate: "2025-05-10", endDate: "2025-05-15", days: 6, reason: "Family vacation to Kerala", status: "pending", appliedOn: "2025-04-20" },
  { id: "l2", employeeId: employees[2].id, employeeName: employees[2].name, type: "sick", startDate: "2025-04-24", endDate: "2025-04-25", days: 2, reason: "Viral fever", status: "approved", appliedOn: "2025-04-23" },
  { id: "l3", employeeId: employees[4].id, employeeName: employees[4].name, type: "casual", startDate: "2025-04-28", endDate: "2025-04-28", days: 1, reason: "Personal work", status: "pending", appliedOn: "2025-04-21" },
  { id: "l4", employeeId: employees[5].id, employeeName: employees[5].name, type: "annual", startDate: "2025-06-01", endDate: "2025-06-10", days: 10, reason: "Brother's wedding", status: "approved", appliedOn: "2025-04-15" },
  { id: "l5", employeeId: employees[7].id, employeeName: employees[7].name, type: "casual", startDate: "2025-04-19", endDate: "2025-04-19", days: 1, reason: "Bank work", status: "rejected", appliedOn: "2025-04-18" },
];

function getLeaveIcon(type: LeaveType) {
  switch (type) {
    case "annual": return <Plane className="h-4 w-4" />;
    case "sick": return <HeartPulse className="h-4 w-4" />;
    default: return <CalendarDays className="h-4 w-4" />;
  }
}

function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      const matchesFilter = filter === "all" || l.status === filter;
      const matchesSearch = !search || l.employeeName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [leaves, filter, search]);

  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;

  const handleStatus = (id: string, status: LeaveStatus) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast.success(`Leave request ${status}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Review and manage employee time-off requests, vacations, and sick leaves."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-9 text-[13px] rounded-lg">
              <Filter className="h-4 w-4 mr-1.5" /> Export Report
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Pending Requests" value={pendingCount} icon={Clock} accent="warning" delay={0} />
        <StatCard label="Approved Leaves" value={approvedCount} icon={CheckCircle2} accent="success" delay={0.05} />
        <StatCard label="Total Requests" value={leaves.length} icon={CalendarDays} accent="primary" delay={0.1} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <ViewToggle view={view} onViewChange={setView} />
          
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full md:w-auto">
            <TabsList className="bg-muted/40 p-1 rounded-xl h-10 border border-border/50">
              <TabsTrigger value="all" className="text-[12px] h-8 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-[12px] h-8 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-warning-foreground data-[state=active]:shadow-sm transition-all font-medium gap-1.5">
                Pending
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning-foreground border-0">{pendingCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-[12px] h-8 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-success data-[state=active]:shadow-sm transition-all font-medium">
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-[12px] h-8 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-destructive data-[state=active]:shadow-sm transition-all font-medium">
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <FormInput
          placeholder="Search employees..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((leave, i) => (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 border-border/60 bg-white hover:shadow-md transition-all relative overflow-hidden h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary text-[14px] font-bold">
                          {leave.employeeName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-[14px] font-bold text-foreground">{leave.employeeName}</div>
                        <div className="text-[11px] text-muted-foreground">{leave.appliedOn}</div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-[10px] font-bold px-2 py-0 border-transparent rounded-full",
                        leave.status === "approved" ? "bg-success/10 text-success" :
                        leave.status === "rejected" ? "bg-destructive/10 text-destructive" :
                        "bg-warning/15 text-warning-foreground"
                      )}
                    >
                      {leave.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-muted/50 flex items-center justify-center text-primary/70">
                          {getLeaveIcon(leave.type)}
                        </div>
                        <span className="text-[13px] capitalize font-semibold">{leave.type}</span>
                      </div>
                      <div className="text-[13px] font-bold text-primary">{leave.days} Day{leave.days > 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40 text-center">
                      {leave.startDate} to {leave.endDate}
                    </div>
                    <p className="text-[12px] text-muted-foreground italic line-clamp-2 leading-relaxed px-1">
                      "{leave.reason}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-center gap-2 mt-auto">
                    {leave.status === "pending" ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px] text-success hover:bg-success/10 border-success/20" onClick={() => handleStatus(leave.id, "approved")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px] text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleStatus(leave.id, "rejected")}>
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" className="w-full h-8 text-[11px] text-muted-foreground">
                        View Details
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
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
              headers={["Employee", "Type", "Duration", "Reason", "Status", "Actions"]}
              isEmpty={filtered.length === 0}
              emptyMessage={`No ${filter !== "all" ? filter : ""} leave requests found.`}
              className="rounded-none shadow-sm"
            >
              {filtered.map((leave, i) => (
                <DataTableRow key={leave.id}>
                  <DataTableCell isFirst>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary text-[12px] font-bold">
                          {leave.employeeName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-[13px] font-bold text-foreground leading-tight">{leave.employeeName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Applied {leave.appliedOn}</div>
                      </div>
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-muted/50 border border-border/40 flex items-center justify-center text-primary/70">
                        {getLeaveIcon(leave.type)}
                      </div>
                      <span className="text-[12px] capitalize font-semibold text-foreground/80">{leave.type}</span>
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="text-[13px] font-bold text-primary">{leave.days} Day{leave.days > 1 ? "s" : ""}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">{leave.startDate} to {leave.endDate}</div>
                  </DataTableCell>
                  <DataTableCell className="text-[12px] text-muted-foreground max-w-[180px] truncate italic">
                    "{leave.reason}"
                  </DataTableCell>
                  <DataTableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-[10px] font-bold px-2.5 py-0.5 border-transparent rounded-full",
                        leave.status === "approved" ? "bg-success/10 text-success" :
                        leave.status === "rejected" ? "bg-destructive/10 text-destructive" :
                        "bg-warning/15 text-warning-foreground"
                      )}
                    >
                      {leave.status}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell isLast>
                    <div className="flex justify-end items-center gap-1">
                      {leave.status === "pending" && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-success hover:bg-success/10 rounded-lg transition-colors" onClick={() => handleStatus(leave.id, "approved")}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" onClick={() => handleStatus(leave.id, "rejected")}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
