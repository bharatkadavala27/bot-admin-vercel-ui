import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Filter, Mail, Phone, Building2, UserCheck, Trash2, Pencil, MoreVertical, Loader2, LayoutGrid, List, Users, Clock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/form-input";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { ViewToggle } from "@/components/shared/view-toggle";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLeadService, type Lead } from "@/services/lead-service";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

export const Route = createFileRoute("/_app/leads")({
  component: LeadsPage,
});

const PAGE_SIZE = 8;

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  contacted: { label: "Contacted", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  qualified: { label: "Qualified", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  lost: { label: "Lost", color: "bg-destructive/10 text-destructive border-destructive/20" },
  won: { label: "Won", color: "bg-success/10 text-success border-success/20" },
};

function LeadsPage() {
  const { leads, isLoading, createLead, updateLead, deleteLead } = useLeadService();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [view, setView] = useState<"grid" | "list">("list");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Direct",
    status: "new" as Lead["status"],
    assignedTo: "Unassigned",
  });

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateLead({ id: editing._id, data: form });
      } else {
        await createLead(form);
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
  };

  const handleEdit = (lead: Lead) => {
    setEditing(lead);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management"
        description={`${leads.length} total leads tracked from various sources`}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setForm({ name: "", email: "", phone: "", company: "", source: "Direct", status: "new", assignedTo: "Unassigned" });
              setOpen(true);
            }}
            className="h-9 text-[13px] bg-gradient-primary text-primary-foreground hover:opacity-95 px-4 rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add New Lead
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Leads" value={leads.length} icon={Users} accent="primary" delay={0} />
        <StatCard label="Pending" value={leads.filter(l => l.status === 'pending').length} icon={Clock} accent="warning" delay={0.05} />
        <StatCard label="Converted" value={leads.filter(l => l.status === 'converted').length} icon={CheckCircle2} accent="success" delay={0.1} />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        <FormInput
          placeholder="Search by name, email or company..."
          icon={Search}
          className="h-10 w-full md:w-[300px] shadow-none"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={PAGE_SIZE} />
      ) : (
        <AnimatePresence mode="wait">
          {view === "grid" ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {pageData.map((l) => (
                <Card key={l._id} className="p-4 border-border/60 bg-card hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <Badge variant="outline" className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shadow-none", STATUS_CONFIG[l.status]?.color)}>
                      {STATUS_CONFIG[l.status]?.label || l.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {l.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[14px] truncate">{l.name}</h3>
                      <p className="text-[11px] text-muted-foreground truncate">{l.company}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 opacity-60" /> <span className="truncate">{l.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 opacity-60" /> {l.phone}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground/60">{new Date(l.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary" onClick={() => handleEdit(l)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => handleDelete(l._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
                headers={[
                  "Lead Details", "Company & Source", "Status", "Assigned To", "Date Added", "Actions"
                ]}
                isEmpty={pageData.length === 0}
                pagination={{
                  page,
                  totalPages,
                  onPageChange: setPage,
                  totalRecords: filtered.length
                }}
              >
                {pageData.map((l) => (
                  <DataTableRow key={l._id} className="group hover:bg-primary/1 transition-colors">
                    <DataTableCell isFirst>
                      <div className="flex flex-col">
                        <span className="text-[13.5px] font-semibold text-foreground group-hover:text-primary transition-colors">{l.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3" /> {l.email}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Phone className="h-3 w-3" /> {l.phone}
                          </div>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground/80">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {l.company}
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-0.5 ml-5">Source: {l.source}</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-none", STATUS_CONFIG[l.status]?.color)}>
                        {STATUS_CONFIG[l.status]?.label || l.status}
                      </Badge>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-2 text-[13px] font-medium text-foreground/70">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                          {l.assignedTo.split(" ").map(n => n[0]).join("")}
                        </div>
                        {l.assignedTo}
                      </div>
                    </DataTableCell>
                    <DataTableCell className="text-[12.5px] text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </DataTableCell>
                    <DataTableCell isLast>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={() => handleEdit(l)} className="text-[13px] gap-2 py-2 cursor-pointer rounded-lg">
                              <Pencil className="h-3.5 w-3.5" /> Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateLead({ id: l._id, data: { status: 'qualified' } })} className="text-[13px] gap-2 py-2 cursor-pointer rounded-lg">
                              <UserCheck className="h-3.5 w-3.5" /> Mark Qualified
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[13px] gap-2 py-2 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/5" onClick={() => handleDelete(l._id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTable>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">{editing ? "Edit Lead" : "Add New Lead"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <FormInput
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Lead name"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
              <FormInput
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                required
              />
            </div>
            <FormInput
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company name"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Source"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="e.g. Website"
              />
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-muted-foreground ml-1">Status</label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-10 rounded-xl border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-border/40">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="bg-gradient-primary text-white rounded-xl px-6">
                {editing ? "Save Changes" : "Create Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
