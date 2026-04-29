import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Building2, Search, LayoutGrid, List, Users, Crown, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { ViewToggle } from "@/components/shared/view-toggle";
import { GridCard } from "@/components/shared/grid-card";
import { FormInput } from "@/components/shared/form-input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDepartmentService, type Department as BackendDept } from "@/services/department-service";

import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/departments")({
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { departments: list, isLoading, createDepartment, updateDepartment, deleteDepartment } = useDepartmentService();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendDept | null>(null);
  const [form, setForm] = useState({ name: "", colorCode: "#6366f1" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const filtered = list.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalEmployees = list.reduce((s, d) => s + (d.employees || 0), 0);

  const openAdd = () => { setEditing(null); setForm({ name: "", colorCode: "#6366f1" }); setOpen(true); };
  const openEdit = (d: BackendDept) => { setEditing(d); setForm({ name: d.name, colorCode: d.colorCode }); setOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }

    try {
      if (editing) {
        await updateDepartment({ id: editing._id, ...form });
      } else {
        await createDepartment(form);
      }
      setOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await deleteDepartment(deleteId);
      setDeleteId(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Departments" description="Organise teams and manage department branding colors." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organise teams and manage department branding colors."
        actions={
          <Button size="sm" onClick={openAdd} className="h-9 text-[13px] bg-gradient-primary text-primary-foreground px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Plus className="h-4 w-4 mr-1.5" /> Add Department
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard label="Total Departments" value={list.length} icon={Building2} accent="primary" delay={0} />
        <StatCard label="Total Employees" value={totalEmployees} icon={Users} accent="success" delay={0.05} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-2">
        <FormInput
          placeholder="Search departments..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <ViewToggle 
            view={view} 
            onViewChange={(v) => setView(v)} 
          />
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((d, i) => (
              <GridCard
                key={d._id}
                title={d.name}
                subtitle={d.colorCode}
                icon={<Building2 className="h-5 w-5" />}
                iconBgColor={d.colorCode}
                onEdit={() => openEdit(d)}
                onDelete={() => setDeleteId(d._id)}
                delay={i * 0.04}
                metaLeft={{ icon: Users, label: `${d.employees} members` }}
                metaRight={{ 
                  icon: Calendar, 
                  label: new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') 
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DataTable
              headers={["Color", "Department Name", "Employees", "Created", "Actions"]}
            >
              {filtered.map((d) => (
                <DataTableRow key={d._id}>
                  <DataTableCell isFirst>
                    <div className="h-6 w-6 rounded-md border border-border/40 shadow-sm" style={{ backgroundColor: d.colorCode }} />
                  </DataTableCell>
                  <DataTableCell>
                    <span className="text-[14px] font-medium">{d.name}</span>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5">{d.employees}</Badge>
                  </DataTableCell>
                  <DataTableCell className="text-[14px] text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' - ')}
                  </DataTableCell>
                  <DataTableCell isLast>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(d)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(d._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] text-muted-foreground">No departments found</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Try adjusting your search or add a new department.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 text-primary grid place-items-center mb-2">
              <Building2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[16px]">{editing ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription className="text-[13px]">Manage your team structure and branding.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 mt-2">
            <FormInput
              label="Department Name"
              placeholder="e.g. Engineering"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="h-10"
              containerClassName="space-y-1"
            />
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase ml-1">Theme Color</span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FormInput
                    label=""
                    className="h-11 pl-12 text-[14px] rounded-xl border-border/80 font-mono uppercase focus-visible:ring-4 focus-visible:ring-primary/5"
                    value={form.colorCode}
                    onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    placeholder="#000000"
                    containerClassName="space-y-0"
                  />
                  <div
                    className="absolute left-3 top-[10px] h-6 w-6 rounded-lg border border-border/40 shadow-sm transition-transform active:scale-95 cursor-pointer overflow-hidden z-10"
                    style={{ backgroundColor: form.colorCode }}
                  >
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                      value={form.colorCode}
                      onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground ml-1">Click the square to pick a color or type the HEX code.</p>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)} className="rounded-xl px-4">Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground rounded-xl px-6 shadow-md hover:opacity-90">
                {editing ? "Update Department" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-xl">
          <AlertDialogHeader>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-[16px]">Delete department?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">This action cannot be undone. All employee associations will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 shadow-md">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
