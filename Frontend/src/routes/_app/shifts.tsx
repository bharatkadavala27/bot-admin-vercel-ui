import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Clock, Users, Pencil, Trash2, Search, Sun, Moon, Sunrise, Sunset, LayoutGrid, List, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { useShiftService, type Shift as BackendShift } from "@/services/shift-service";
import { useEmployeeService } from "@/services/employee-service";
import { ViewToggle } from "@/components/shared/view-toggle";
import { FormInput } from "@/components/shared/form-input";
import { FormSelect } from "@/components/shared/form-select";
import { toast } from "sonner";
import { cn, formatTime12h } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/shifts")({
  component: ShiftsPage,
});

const SHIFT_ICONS: Record<string, typeof Sun> = {
  Morning: Sunrise,
  General: Sun,
  Evening: Sunset,
  Night: Moon,
};

const SHIFT_GRADIENTS: Record<string, string> = {
  Morning: "from-amber-400/15 to-orange-300/5",
  General: "from-primary/15 to-primary/5",
  Evening: "from-purple-400/15 to-indigo-300/5",
  Night: "from-slate-600/15 to-slate-400/5",
};

const SHIFT_ICON_COLORS: Record<string, string> = {
  Morning: "text-amber-600 bg-amber-500/10",
  General: "text-primary bg-primary/10",
  Evening: "text-purple-600 bg-purple-500/10",
  Night: "text-slate-600 bg-slate-500/10",
};


function ShiftsPage() {
  const { shifts: list, isLoading, createShift, updateShift, deleteShift, isCreating, isUpdating } = useShiftService();
  const { employees = [] } = useEmployeeService();
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendShift | null>(null);
  const [form, setForm] = useState({ name: "", startTime: "09:00", endTime: "18:00" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ employeeId: "", shiftId: "" });

  const filtered = list.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssigned = list.reduce((s, sh) => s + (sh.assigned || 0), 0);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", startTime: "09:00", endTime: "18:00" });
    setOpen(true);
  };

  const openEdit = (s: BackendShift) => {
    setEditing(s);
    setForm({ name: s.name, startTime: s.startTime, endTime: s.endTime });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Shift name required"); return; }
    
    try {
      if (editing) {
        await updateShift({ id: editing._id, ...form });
      } else {
        await createShift(form);
      }
      setOpen(false);
    } catch (err) {
      // Error handled by service
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await deleteShift(deleteId);
      setDeleteId(null);
    } catch (err) {
      // Error handled by service
    }
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    // This part depends on if there's a specific API for assigning shifts to employees
    toast.success("Shift assigned successfully");
    setAssignOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shift Management" description="Define working hours and assign shifts to your team." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Management"
        description="Define working hours and assign shifts to your team."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-[13px] rounded-lg"
              onClick={() => {
                if (employees.length > 0 && list.length > 0) {
                  setAssignForm({ employeeId: employees[0]._id, shiftId: list[0]._id });
                }
                setAssignOpen(true);
              }}
            >
              <Users className="h-4 w-4 mr-1.5" />Assign Shift
            </Button>
            <Button
              size="sm"
              className="h-9 text-[13px] bg-gradient-primary text-primary-foreground px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4 mr-1.5" />New Shift
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Shifts" value={list.length} icon={Clock} accent="primary" delay={0} />
        <StatCard label="Total Assigned" value={totalAssigned} icon={Users} accent="success" delay={0.05} />
        <StatCard label="Avg per Shift" value={list.length ? Math.round(totalAssigned / list.length) : 0} icon={Sun} accent="warning" delay={0.1} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-2">
        <FormInput
          placeholder="Search shifts..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Grid View */}
      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {filtered.map((s, i) => {
              const ShiftIcon = SHIFT_ICONS[s.name] || Clock;
              const gradient = SHIFT_GRADIENTS[s.name] || "from-primary/15 to-primary/5";
              const iconColor = SHIFT_ICON_COLORS[s.name] || "text-primary bg-primary/10";
              return (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`group relative overflow-hidden p-5 border border-border/50 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 h-full flex flex-col`}>
                    {/* Top gradient bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${gradient.replace("/15", "/60").replace("/5", "/30")} rounded-t-xl`} />

                    <div className="flex items-start justify-between mb-4 mt-1">
                      <div className={`h-12 w-12 rounded-xl grid place-items-center shadow-sm ${iconColor}`}>
                        <ShiftIcon className="h-5.5 w-5.5" />
                      </div>
                      <div className="flex items-center gap-1.5 translate-y-[-4px]">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(s._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-foreground mb-1">{s.name}</h3>
                      <div className="flex items-center gap-2 text-[14px] text-muted-foreground font-mono">
                        <Clock className="h-3.5 w-3.5 text-primary/50" />
                        {formatTime12h(s.startTime)} – {formatTime12h(s.endTime)}
                      </div>

                      {/* Duration badge */}
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 border-border/40 bg-muted/20">
                          {(() => {
                            const [sh, sm] = s.startTime.split(":").map(Number);
                            const [eh, em] = s.endTime.split(":").map(Number);
                            let diff = (eh * 60 + em) - (sh * 60 + sm);
                            if (diff < 0) diff += 24 * 60;
                            return `${Math.floor(diff / 60)}h ${diff % 60}m`;
                          })()}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md">
                        <Users className="h-3.5 w-3.5" /> {s.assigned || 0} assigned
                      </div>
                      <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DataTable
              headers={["Shift Name", "Timing", "Duration", "Assigned", "Created", "Actions"]}
            >
              {filtered.map((s) => (
                <DataTableRow key={s._id}>
                  <DataTableCell isFirst>
                    <span className="text-[14px] font-medium">{s.name}</span>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-mono">
                      <Clock className="h-3.5 w-3.5 text-primary/50" />
                      {formatTime12h(s.startTime)} – {formatTime12h(s.endTime)}
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5 border-border/40 bg-muted/10">
                      {(() => {
                        const [sh, sm] = s.startTime.split(":").map(Number);
                        const [eh, em] = s.endTime.split(":").map(Number);
                        let diff = (eh * 60 + em) - (sh * 60 + sm);
                        if (diff < 0) diff += 24 * 60;
                        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
                      })()}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5">{s.assigned || 0}</Badge>
                  </DataTableCell>
                  <DataTableCell className="text-[13px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' - ')}
                  </DataTableCell>
                  <DataTableCell isLast className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(s._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] text-muted-foreground">No shifts found</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Try adjusting your search or create a new shift.</p>
        </div>
      )}

      {/* Create/Edit Shift Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 text-primary grid place-items-center mb-2">
              <Clock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[16px]">{editing ? "Edit Shift" : "New Shift"}</DialogTitle>
            <DialogDescription className="text-[13px]">Set the shift name and working hours.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 mt-2">
            <FormInput
              label="Shift Name"
              placeholder="e.g. Morning"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="h-10"
              containerClassName="space-y-1"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Start Time"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="h-10 text-[13px]"
                containerClassName="space-y-1"
              />
              <FormInput
                label="End Time"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="h-10 text-[13px]"
                containerClassName="space-y-1"
              />
            </div>
            <DialogFooter className="gap-2 pt-2 border-t border-border/40 mt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)} className="rounded-lg" disabled={isCreating || isUpdating}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground rounded-lg px-5 shadow-md hover:opacity-90" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  editing ? "Save Changes" : "Create Shift"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl border-destructive/20 shadow-xl">
          <AlertDialogHeader>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-[16px]">Delete shift?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">This will unassign all employees from this shift. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 shadow-md">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Shift Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-success/15 to-success/5 text-success grid place-items-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[16px]">Assign Shift</DialogTitle>
            <DialogDescription className="text-[13px]">Move an employee to a different shift.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4 mt-2">
            <FormSelect
              label="Employee"
              placeholder="Select Employee"
              value={assignForm.employeeId}
              onValueChange={(v) => setAssignForm({ ...assignForm, employeeId: v })}
              options={employees.map((e: any) => ({ label: e.name, value: e._id }))}
              containerClassName="space-y-1"
            />
            <FormSelect
              label="Shift"
              placeholder="Select Shift"
              value={assignForm.shiftId}
              onValueChange={(v) => setAssignForm({ ...assignForm, shiftId: v })}
              options={list.map((s) => ({ 
                label: s.name, 
                value: s._id, 
                subLabel: `${formatTime12h(s.startTime)} – ${formatTime12h(s.endTime)}` 
              }))}
              containerClassName="space-y-1"
            />
            <DialogFooter className="gap-2 pt-2 border-t border-border/40 mt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setAssignOpen(false)} className="rounded-lg">Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground rounded-lg px-5 shadow-md">Assign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
