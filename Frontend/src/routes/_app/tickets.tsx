import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Clock as ClockIcon, MessageSquare, Pencil, CalendarDays, Ticket, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { ViewToggle } from "@/components/shared/view-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FormInput } from "@/components/shared/form-input";
import { FormSelect } from "@/components/shared/form-select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAttendanceService, type AttendanceRecord } from "@/services/attendance-service";
import { employees } from "@/lib/mock-data"; // Still needed for employee list in form
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/shared/stat-card";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

export const Route = createFileRoute("/_app/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const { records: list, isLoading, updateAttendance } = useAttendanceService();
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [remarkOpenId, setRemarkOpenId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");

  const [modifyOpen, setModifyOpen] = useState(false);
  const [modifyForm, setModifyForm] = useState({ 
    id: "", 
    punchIn: "", 
    punchOut: "", 
    status: "present" as any 
  });

  const filtered = useMemo(() => {
    return list.filter((t) => {
      const name = t.employeeId?.name || "";
      const matchesTab = tab === "all" || t.status === tab;
      const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [list, tab, search]);

  const updateStatus = async (id: string, status: any) => {
    try {
      await updateAttendance({ id, data: { status } });
    } catch (err) {}
  };

  const saveRemark = async () => {
    if (!remarkOpenId) return;
    try {
      await updateAttendance({ id: remarkOpenId, data: { remarks: remarkText } });
      setRemarkOpenId(null); 
      setRemarkText("");
    } catch (err) {}
  };

  const counts = {
    all: list.length,
    present: list.filter((t) => t.status === "present").length,
    late: list.filter((t) => t.status === "late").length,
    absent: list.filter((t) => t.status === "absent").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attendance & Logs" description="Monitor daily punch logs and modify login times." />
        <SkeletonLoader type="stats" count={3} />
        <SkeletonLoader type="table" count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance & Logs"
        description="Monitor daily punch logs and modify login times."
        actions={
          <Button
            size="sm"
            onClick={() => setModifyOpen(true)}
            className="h-9 text-[13px] bg-gradient-primary text-primary-foreground hover:shadow-md px-4 rounded-xl shadow-sm gap-2 transition-all font-bold"
          >
            <Pencil className="h-3.5 w-3.5" /> Modify Punch
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Present Today" value={counts.present} icon={Check} accent="success" delay={0} />
        <StatCard label="Late Arrivals" value={counts.late} icon={ClockIcon} accent="warning" delay={0.05} />
        <StatCard label="Total Records" value={counts.all} icon={Ticket} accent="primary" delay={0.1} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <ViewToggle view={view} onViewChange={setView} />

          <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
            <TabsList className="bg-muted/40 p-1 rounded-xl h-10 border border-border/50">
              <TabsTrigger value="all" className="text-[12px] h-8 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium gap-1.5">
                All Logs
              </TabsTrigger>
              <TabsTrigger value="present" className="text-[12px] h-8 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-success data-[state=active]:shadow-sm transition-all font-medium gap-1.5">
                Present
              </TabsTrigger>
              <TabsTrigger value="late" className="text-[12px] h-8 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-warning-foreground data-[state=active]:shadow-sm transition-all font-medium gap-1.5">
                Late
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <FormInput
          placeholder="Search employee..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4"
          >
            {filtered.map((t) => (
              <Card key={t._id} className="p-4 border-border/60 bg-white hover:shadow-md transition-all relative overflow-hidden flex flex-col group">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/5">
                    <AvatarFallback className="bg-primary/10 text-primary text-[12px] font-bold">
                      {t.employeeId?.name?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] text-foreground truncate">{t.employeeId?.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize text-[9px] font-bold px-1.5 py-0 border-transparent shrink-0",
                      t.status === "present" ? "bg-success/10 text-success" :
                        t.status === "late" ? "bg-warning/15 text-warning-foreground" :
                          "bg-destructive/10 text-destructive"
                    )}
                  >{t.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 flex items-center gap-1">
                      <ClockIcon className="h-2.5 w-2.5" /> Punch In
                    </p>
                    <p className="text-[12px] font-mono font-bold text-foreground">
                      {t.punchIn ? new Date(t.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 flex items-center gap-1">
                      <ClockIcon className="h-2.5 w-2.5" /> Punch Out
                    </p>
                    <p className="text-[12px] font-mono font-bold text-foreground">
                      {t.punchOut ? new Date(t.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground mb-4 line-clamp-1 italic px-1">
                  <MapPin className="h-2.5 w-2.5 inline mr-1" /> 
                  {typeof t.punchInLocation === 'object' 
                    ? `${t.punchInLocation.lat.toFixed(4)}, ${t.punchInLocation.lng.toFixed(4)}` 
                    : (t.punchInLocation || "No location data")}
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 hover:bg-primary/10 hover:text-primary" 
                    onClick={() => {
                      setModifyForm({
                        id: t._id,
                        punchIn: t.punchIn ? new Date(t.punchIn).toISOString().slice(0, 16) : "",
                        punchOut: t.punchOut ? new Date(t.punchOut).toISOString().slice(0, 16) : "",
                        status: t.status
                      });
                      setModifyOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => { setRemarkOpenId(t._id); setRemarkText(""); }}>
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <DataTable
              headers={["Employee", "Date", "Punch In", "Punch Out", "Location", "Status", "Actions"]}
              isEmpty={filtered.length === 0}
              emptyMessage={`No logs found.`}
              className="rounded-none shadow-sm"
            >
              {filtered.map((t) => (
                <DataTableRow key={t._id}>
                  <DataTableCell isFirst>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary text-[12px] font-bold">
                          {t.employeeId?.name?.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-[13px] text-foreground leading-tight">{t.employeeId?.name}</span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">{t.employeeId?.phone}</span>
                      </div>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-[13px] text-muted-foreground">{new Date(t.date).toLocaleDateString()}</DataTableCell>
                  <DataTableCell className="text-[13px] font-mono font-bold text-foreground/80">
                    {t.punchIn ? new Date(t.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                  </DataTableCell>
                  <DataTableCell className="text-[13px] font-mono font-bold text-foreground/80">
                    {t.punchOut ? new Date(t.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                  </DataTableCell>
                  <DataTableCell className="text-[12px] text-muted-foreground max-w-[150px] truncate italic">
                    {typeof t.punchInLocation === 'object' 
                      ? `${t.punchInLocation.lat.toFixed(2)}, ${t.punchInLocation.lng.toFixed(2)}` 
                      : (t.punchInLocation || "N/A")}
                  </DataTableCell>
                  <DataTableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-[10px] font-bold px-2 py-0.5 border-transparent",
                        t.status === "present" ? "bg-success/10 text-success" :
                          t.status === "late" ? "bg-warning/15 text-warning-foreground" :
                            "bg-destructive/10 text-destructive"
                      )}
                    >{t.status}</Badge>
                  </DataTableCell>
                  <DataTableCell isLast>
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 hover:bg-primary/10 hover:text-primary" 
                        onClick={() => {
                          setModifyForm({
                            id: t._id,
                            punchIn: t.punchIn ? new Date(t.punchIn).toISOString().slice(0, 16) : "",
                            punchOut: t.punchOut ? new Date(t.punchOut).toISOString().slice(0, 16) : "",
                            status: t.status
                          });
                          setModifyOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => { setRemarkOpenId(t._id); setRemarkText(""); }}>
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remark Dialog */}
      <Dialog open={!!remarkOpenId} onOpenChange={(o) => { if (!o) { setRemarkOpenId(null); setRemarkText(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add admin remark</DialogTitle>
            <DialogDescription className="text-[12px]">This note will be visible to the employee.</DialogDescription>
          </DialogHeader>
          <Textarea value={remarkText} onChange={(e) => setRemarkText(e.target.value)} placeholder="Verified with team lead…" rows={4} className="text-[13px]" />
          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => { setRemarkOpenId(null); setRemarkText(""); }}>Cancel</Button>
            <Button size="sm" onClick={saveRemark} className="bg-gradient-primary text-primary-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Login Time Dialog */}
      <Dialog open={modifyOpen} onOpenChange={setModifyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Modify Punch Time</DialogTitle>
            <DialogDescription className="text-[12px]">Adjust punch in / out and status for this record.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => { 
              e.preventDefault(); 
              await updateAttendance({ 
                id: modifyForm.id, 
                data: { 
                  punchIn: modifyForm.punchIn, 
                  punchOut: modifyForm.punchOut, 
                  status: modifyForm.status 
                } 
              }); 
              setModifyOpen(false); 
            }}
            className="space-y-3"
          >
            <FormInput
              label="Punch In"
              type="datetime-local"
              value={modifyForm.punchIn}
              onChange={(e) => setModifyForm({ ...modifyForm, punchIn: e.target.value })}
              className="h-9"
              containerClassName="space-y-1"
            />
            <FormInput
              label="Punch Out"
              type="datetime-local"
              value={modifyForm.punchOut}
              onChange={(e) => setModifyForm({ ...modifyForm, punchOut: e.target.value })}
              className="h-9"
              containerClassName="space-y-1"
            />
            <FormSelect
              label="Status"
              value={modifyForm.status}
              onValueChange={(v) => setModifyForm({ ...modifyForm, status: v })}
              options={[
                { label: "Present", value: "present" },
                { label: "Late", value: "late" },
                { label: "Half Day", value: "half-day" },
                { label: "Absent", value: "absent" },
              ]}
              containerClassName="space-y-1"
            />
            <DialogFooter className="gap-2 pt-1">
              <Button type="button" size="sm" variant="outline" onClick={() => setModifyOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
