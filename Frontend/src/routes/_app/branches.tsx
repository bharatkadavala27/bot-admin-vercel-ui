import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MapPin, Search, LayoutGrid, List, Users, Globe, Filter, Crosshair, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { ViewToggle } from "@/components/shared/view-toggle";
import { FormInput } from "@/components/shared/form-input";
  import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBranchService, type Branch as BackendBranch } from "@/services/branch-service";

import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/branches")({
  component: BranchesPage,
});

function BranchesPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { branches: list, isLoading, createBranch, updateBranch, deleteBranch } = useBranchService();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendBranch | null>(null);
  const [form, setForm] = useState({
    branchName: "",
    branchLocation: "",
    latitude: 0,
    longitude: 0
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [fetchingLoc, setFetchingLoc] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setFetchingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(2)),
          longitude: parseFloat(pos.coords.longitude.toFixed(2))
        }));
        setFetchingLoc(false);
        toast.success("Location fetched and simplified");
      },
      (err) => {
        setFetchingLoc(false);
        toast.error("Failed to fetch location: " + err.message);
      }
    );
  };

  const filtered = list.filter((b) => {
    const matchSearch = b.branchName.toLowerCase().includes(search.toLowerCase()) ||
      b.branchLocation.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const totalEmployees = list.reduce((s, b) => s + (b.employees || 0), 0);
  const uniqueCities = new Set(list.map((b) => b.branchLocation)).size;

  const openAdd = () => {
    setEditing(null);
    setForm({
      branchName: "",
      branchLocation: "",
      latitude: 0,
      longitude: 0
    });
    setOpen(true);
  };

  const openEdit = (b: BackendBranch) => {
    setEditing(b);
    setForm({
      branchName: b.branchName,
      branchLocation: b.branchLocation,
      latitude: b.latitude,
      longitude: b.longitude
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.branchName.trim()) { toast.error("Branch name is required"); return; }

    // Validation: Require at least a reasonable value
    if (form.latitude === 0 || form.longitude === 0) {
      toast.error("Please provide valid coordinates");
      return;
    }

    try {
      if (editing) {
        await updateBranch({ id: editing._id, ...form });
      } else {
        await createBranch(form);
      }
      setOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await deleteBranch(deleteId);
      setDeleteId(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Branches" description="All office locations in one place." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
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
        title="Branches"
        description="All office locations in one place."
        actions={
          <Button size="sm" onClick={openAdd} className="h-9 text-[13px] bg-gradient-primary text-primary-foreground px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Plus className="h-4 w-4 mr-1.5" />Add Branch
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Branches" value={list.length} icon={MapPin} accent="primary" delay={0} />
        <StatCard label="Total Staff" value={totalEmployees} icon={Users} accent="success" delay={0.05} />
        <StatCard label="Cities Covered" value={uniqueCities} icon={Globe} accent="info" delay={0.1} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <FormInput
          placeholder="Search branches..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Grid / List View */}
      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="h-full">
                <Card className="group relative overflow-hidden p-5 border border-border/60 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent-foreground grid place-items-center shadow-sm">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5 translate-y-[-4px]">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(b._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold text-foreground mb-1">{b.branchName}</h3>
                    <p className="text-[13px] text-muted-foreground line-clamp-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" /> {b.branchLocation}
                    </p>

                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex flex-col gap-2 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md">
                        <Users className="h-3.5 w-3.5" /> {b.employees} staff
                      </div>
                      <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 border-border/40 bg-muted/20">
                        {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DataTable
              headers={["Branch", "Location", "Coordinates", "Created At", "Actions"]}
            >
              {filtered.map((b) => (
                <DataTableRow key={b._id}>
                  <DataTableCell isFirst>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent-foreground grid place-items-center shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="text-[14px] font-medium">{b.branchName}</span>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-[14px] text-muted-foreground max-w-[200px] truncate">{b.branchLocation}</DataTableCell>
                  <DataTableCell className="text-[13px] text-muted-foreground">
                    {b.latitude.toFixed(2)}, {b.longitude.toFixed(2)}
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell isLast>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(b)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(b._id)}>
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
          <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] text-muted-foreground">No branches found</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Try adjusting your filters or add a new branch.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-accent/20 to-accent/5 text-accent-foreground grid place-items-center mb-2">
              <MapPin className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[16px]">{editing ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription className="text-[13px]">Provide the branch's basic information and manager.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 mt-2">
            <FormInput
              label="Branch Name"
              placeholder="e.g. Gurugram"
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              required
              className="h-10"
              containerClassName="space-y-1"
            />
            <FormInput
              label="Branch Location"
              placeholder="e.g. Sector 47, Gurugram"
              value={form.branchLocation}
              onChange={(e) => setForm({ ...form, branchLocation: e.target.value })}
              required
              className="h-10"
              containerClassName="space-y-1"
            />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase ml-1">Coordinates</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] text-primary hover:bg-primary/5 gap-1.5 px-2 rounded-lg"
                  onClick={fetchLocation}
                  disabled={fetchingLoc}
                >
                  {fetchingLoc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
                  {fetchingLoc ? "Fetching..." : "Auto-detect Location"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                  className="h-10 text-[13px]"
                  containerClassName="space-y-1"
                />
                <FormInput
                  label="Longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                  className="h-10 text-[13px]"
                  containerClassName="space-y-1"
                />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[11px] text-muted-foreground/60 italic">* Coordinates are simplified to 2 decimal places for a cleaner look.</p>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)} className="rounded-lg">Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground rounded-lg px-5">{editing ? "Save Changes" : "Add Branch"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-[16px]">Delete branch?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground rounded-lg">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
