import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Filter, LayoutGrid, List, MoreVertical, Phone, Mail, MapPin, Building2, UserCircle2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { ViewToggle } from "@/components/shared/view-toggle";
import { GridCard } from "@/components/shared/grid-card";
import { FormInput } from "@/components/shared/form-input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Employee, useEmployeeService, type Employee as BackendEmployee } from "@/services/employee-service";
import { useDepartmentService } from "@/services/department-service";
import { useBranchService } from "@/services/branch-service";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/employees/")({
  component: EmployeesPage,
});

const PAGE_SIZE = 8;

function EmployeesPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { employees: list, isLoading, isFetching, deleteEmployee, updateEmployee } = useEmployeeService();
  const { departments } = useDepartmentService();
  const { branches } = useBranchService();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("list");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return list.filter((e) => {
      const matchesSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.email && e.email.toLowerCase().includes(search.toLowerCase())) ||
        e.phone.includes(search);
      const matchesDept = deptFilter === "all" || e.departmentId === deptFilter;
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [list, search, deptFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!hasMounted) return null;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEmployee(deleteId);
      setDeleteId(null);
    } catch (error) { }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateEmployee({
        id,
        data: { status: currentStatus === "active" ? "inactive" : "active" }
      });
    } catch (error) { }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employee Directory"
        description={`${list.length} total staff members · ${list.filter((e) => e.status === "active").length} active`}
        actions={
          <Button
            asChild
            size="sm"
            className="h-9 text-[13px] bg-gradient-primary text-primary-foreground hover:opacity-95 px-4 rounded-xl shadow-sm transition-all hover:shadow-md"
          >
            <Link to="/employees/create">
              <Plus className="h-4 w-4 mr-2" /> Add New Employee
            </Link>
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <FormInput
          placeholder="Search employees..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none bg-background"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <ViewToggle view={view} onViewChange={setView} />
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px] h-10 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl text-[13px] font-medium transition-all gap-2 px-3 shadow-none">
                <Building2 className="h-3.5 w-3.5" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[130px] h-10 border border-success/20 bg-success/5 text-success hover:bg-success/10 rounded-xl text-[13px] font-medium transition-all gap-2 px-3 shadow-none">
                <div className={cn("h-2 w-2 rounded-full", statusFilter === 'active' ? "bg-success" : statusFilter === 'inactive' ? "bg-muted-foreground" : "bg-primary")} />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(isLoading || (list.length === 0 && isFetching)) ? (
          <motion.div key="loading" className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full rounded-xl bg-white border border-border/40 flex items-center px-4 gap-4 animate-pulse">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </motion.div>
        ) : view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {pageData.map((e, idx) => (
              <GridCard
                key={e._id}
                title={e.name}
                subtitle={e.phone}
                icon={
                  e.profileImage ? (
                    <img src={e.profileImage} alt={e.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="bg-linear-to-br from-primary/10 to-primary/5 text-primary text-[14px] font-black h-full w-full grid place-items-center uppercase">
                      {e.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                  )
                }
                iconBgColor={(e.departmentId as any)?.colorCode || "#6366f1"}
                onEdit={() => {}} // We'll handle edit via the links below or refine GridCard
                onDelete={() => setDeleteId(e._id)}
                delay={idx * 0.05}
                statusNode={
                  <Switch
                    checked={e.status === "active"}
                    onCheckedChange={() => toggleStatus(e._id, e.status)}
                    className="data-[state=checked]:bg-success scale-75 shadow-sm"
                  />
                }
                metaLeft={{ icon: Building2, label: (e.departmentId as any)?.name || "Not Assigned" }}
                metaRight={{ 
                  icon: Calendar, 
                  label: new Date(e.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') 
                }}
              >
                <div className="mt-4 grid grid-cols-2 gap-2">
                   <Button asChild variant="outline" className="h-8 text-[11px] font-bold rounded-lg border-primary/20 text-primary hover:bg-primary/5">
                      <Link to="/employees/$employeeId" params={{ employeeId: e._id }}>Profile</Link>
                   </Button>
                   <Button asChild className="h-8 text-[11px] font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white shadow-none">
                      <Link to="/employees/create" search={{ employeeId: e._id }}>Edit</Link>
                   </Button>
                </div>
              </GridCard>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-sm"
          >
            <DataTable
              className="rounded-none border-none"
              headers={[
                <div key="emp" className="w-[280px]">Employee Details</div>,
                "Department", "Branch / Location", "Status", <div key="act" className="text-right">Actions</div>
              ]}
              isEmpty={pageData.length === 0}
              emptyMessage={
                <div className="flex flex-col items-center justify-center text-muted-foreground py-12 gap-2">
                  <UserCircle2 className="h-10 w-10 opacity-20" />
                  <p className="text-[14px] font-bold">No employees found</p>
                  <p className="text-[12px] opacity-60 max-w-[240px] text-center">Try adjusting your filters or search terms to find who you're looking for.</p>
                </div>
              }
              pagination={{
                page,
                totalPages,
                onPageChange: setPage,
                totalRecords: filtered.length
              }}
            >
              {pageData.map((e) => (
                <DataTableRow
                  key={e._id}
                  className="group hover:bg-primary/1.5 transition-colors border-b border-border/30 last:border-0"
                >
                  <DataTableCell isFirst>
                    <div className="flex items-center gap-3.5 py-1">
                      <Avatar className="h-10 w-10 shrink-0 shadow-sm border border-border/50 ring-2 ring-primary/5 group-hover:scale-105 transition-transform">
                        {e.profileImage ? (
                          <img src={e.profileImage} alt={e.name} className="h-full w-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-linear-to-br from-primary/10 to-primary/5 text-primary text-[13px] font-black">
                            {e.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-[13px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight truncate">{e.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {e.email || "no-email@bot.com"}
                          </div>
                          <span className="text-border/60">•</span>
                          <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {e.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant="outline" className="text-[10px] font-black bg-primary/5 border-primary/20 px-2 py-0.5 text-primary uppercase tracking-wider">
                      {(e.departmentId as any)?.name || "Unassigned"}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell className="text-[13px] font-semibold text-muted-foreground/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary/40" />
                      {(e.branchId as any)?.branchName || "Main Headquarters"}
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={e.status === "active"}
                        onCheckedChange={() => toggleStatus(e._id, e.status)}
                        className="data-[state=checked]:bg-success scale-90"
                      />
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[10px] font-black px-2 py-0 border-transparent rounded-full",
                          e.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {e.status}
                      </Badge>
                    </div>
                  </DataTableCell>
                  <DataTableCell isLast>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                        <Link to="/employees/$employeeId" params={{ employeeId: e._id }}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                        <Link to="/employees/create" search={{ employeeId: e._id }}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-destructive/10 text-destructive transition-all" onClick={() => setDeleteId(e._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-2xl">
          <AlertDialogHeader>
             <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mb-2">
                <Trash2 className="h-6 w-6" />
             </div>
            <AlertDialogTitle className="text-[18px] font-black tracking-tight">Delete employee?</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-muted-foreground">
              This will permanently remove the employee from the system and archive their records. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl border-border/60">Keep Employee</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 shadow-lg shadow-destructive/20 px-6">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
