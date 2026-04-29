import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, Calendar, HeartPulse, User, Baby, Heart, Info,
  Settings2, Hash, Type, Loader2
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/form-input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeaveTypeService, type LeaveType as BackendLeaveType } from "@/services/leave-type-service";
import { ViewToggle } from "@/components/shared/view-toggle";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/leave-types")({
  component: LeaveTypesPage,
});

function LeaveTypesPage() {
  const ICON_MAP: Record<string, any> = {
    Calendar,
    HeartPulse,
    User,
    Baby,
    Heart,
  };
  const [hasMounted, setHasMounted] = useState(false);
  const { leaveTypes: types, isLoading, isFetching, createLeaveType, updateLeaveType, deleteLeaveType, isCreating, isUpdating, isDeleting } = useLeaveTypeService();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendLeaveType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [form, setForm] = useState({
    leaveName: "",
    code: "",
    totalDays: 0,
    description: "",
    iconStyle: "Calendar",
    colorCode: "#3b82f6",
  });

  if (!hasMounted) return null;

  const filtered = types.filter(t =>
    t.leaveName.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (editing) {
        await updateLeaveType({ id: editing._id, ...form });
      } else {
        await createLeaveType(form);
      }
      setOpen(false);
      setEditing(null);
      setForm({ leaveName: "", code: "", totalDays: 0, description: "", iconStyle: "Calendar", colorCode: "#3b82f6" });
    } catch (error) {
      // Handled by service
    }
  };

  const openEdit = (t: BackendLeaveType) => {
    setEditing(t);
    setForm({
      leaveName: t.leaveName,
      code: t.code,
      totalDays: t.totalDays,
      description: t.description || "",
      iconStyle: t.iconStyle,
      colorCode: t.colorCode || "#3b82f6",
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteLeaveType(deleteId);
        setDeleteId(null);
      } catch (error) {
        // Handled by service
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Leave Types"
        description="Configure and manage different categories of employee leaves."
        actions={
          <Button
            className="bg-primary hover:bg-primary/90 text-white shadow-sm gap-2 px-5 rounded-xl h-11"
            onClick={() => { setEditing(null); setForm({ leaveName: "", code: "", totalDays: 0, description: "", iconStyle: "Calendar", colorCode: "#3b82f6" }); setOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Add Leave Type
          </Button>
        }
      />

      {(isLoading || (types.length === 0 && isFetching)) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 border border-border/60 bg-white rounded-xl shadow-sm h-48 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-full mt-4" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
            <FormInput
              placeholder="Search by name or code..."
              icon={Search}
              className="h-10 w-full md:w-[260px] shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {filtered.map((t, i) => {
                  const Icon = ICON_MAP[t.iconStyle] || Calendar;
                  return (
                    <motion.div
                      key={t._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="h-full"
                    >
                      <Card className="group relative overflow-hidden p-5 border border-border/60 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="h-12 w-12 rounded-xl grid place-items-center shadow-sm border"
                            style={{
                              backgroundColor: `${t.colorCode}15`,
                              borderColor: `${t.colorCode}40`,
                              color: t.colorCode
                            }}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(t)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(t._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1 mb-4 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[16px] font-bold text-foreground">{t.leaveName}</h3>
                            <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-border/60 bg-muted/30 uppercase">{t.code}</Badge>
                          </div>
                          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground/80">
                            <Settings2 className="h-3.5 w-3.5 text-primary/60" />
                            Max Allowable: <span className="text-primary">{t.totalDays} Days</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DataTable
                  headers={["Icon", "Leave Name", "Code", "Max Days", "Actions"]}
                >
                  {filtered.map((t) => {
                    const Icon = ICON_MAP[t.iconStyle] || Calendar;
                    return (
                      <DataTableRow key={t._id}>
                        <DataTableCell isFirst>
                          <div 
                            className="h-8 w-8 rounded-lg grid place-items-center border"
                            style={{ 
                              backgroundColor: `${t.colorCode}15`,
                              borderColor: `${t.colorCode}30`,
                              color: t.colorCode 
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                        </DataTableCell>
                        <DataTableCell className="font-medium text-[14px]">{t.leaveName}</DataTableCell>
                        <DataTableCell>
                          <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 border-border/60 bg-muted/30 uppercase">{t.code}</Badge>
                        </DataTableCell>
                        <DataTableCell className="text-[14px] font-semibold text-primary">{t.totalDays} Days</DataTableCell>
                        <DataTableCell isLast>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(t)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(t._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  })}
                </DataTable>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold">{editing ? "Edit Leave Type" : "Create New Leave Type"}</DialogTitle>
            <DialogDescription>
              Define the leave policy and description for employees.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <FormInput
              label="Leave Name"
              icon={Type}
              value={form.leaveName}
              onChange={e => setForm({ ...form, leaveName: e.target.value })}
              placeholder="e.g. Annual Leave"
              containerClassName="space-y-1"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Code"
                icon={Hash}
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. AL"
                className="uppercase"
                containerClassName="space-y-1"
              />
              <FormInput
                label="Total Days"
                type="number"
                min="0"
                icon={Calendar}
                value={form.totalDays}
                onChange={e => setForm({ ...form, totalDays: Math.max(0, parseInt(e.target.value) || 0) })}
                containerClassName="space-y-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon" className="text-[13px] font-semibold flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5 text-primary" /> Icon & Color
              </Label>
              <div className="flex gap-3">
                <select
                  id="icon"
                  className="flex-1 h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={form.iconStyle}
                  onChange={e => setForm({ ...form, iconStyle: e.target.value })}
                >
                  {Object.keys(ICON_MAP).map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/60 shrink-0">
                  <FormInput
                    type="color"
                    value={form.colorCode}
                    onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer rounded-lg overflow-hidden shadow-none"
                    containerClassName="shrink-0"
                  />
                  <FormInput
                    type="text"
                    value={form.colorCode}
                    onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    className="w-20 h-8 text-[11px] font-mono border-none bg-transparent p-0 uppercase shadow-none"
                    containerClassName="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-[13px] font-semibold flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-primary" /> Description
              </Label>
              <Textarea id="desc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the leave eligibility..." className="rounded-xl min-h-[100px]" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl" disabled={isCreating || isUpdating}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editing ? "Update Policy" : "Create Type"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Leave Type?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this leave type? This action cannot be undone and may affect employee balance tracking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-xl" disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl px-8" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
