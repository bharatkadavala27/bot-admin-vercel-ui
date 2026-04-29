import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Monitor, Search, MoreVertical, Trash2, Pencil, Calendar, Hash, Info, Smartphone, Laptop, Speaker, User, Landmark, LayoutGrid, List, MoreHorizontal, CheckCircle2, AlertCircle, IndianRupee, MousePointer2, Keyboard, Tablet, Image as ImageIcon, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/form-input";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { ViewToggle } from "@/components/shared/view-toggle";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { useAssetService } from "@/services/asset-service";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/assets/")({
  component: AssetsPage,
});

type ViewMode = "list" | "employee";

const DEVICE_TYPES = [
  { label: "Laptop", value: "Laptop", icon: Laptop },
  { label: "Mobile", value: "Mobile", icon: Smartphone },
  { label: "Mouse", value: "Mouse", icon: MousePointer2 },
  { label: "Keyboard", value: "Keyboard", icon: Keyboard },
  { label: "Monitor", value: "Monitor", icon: Monitor },
  { label: "Headset", value: "Headset", icon: Speaker },
  { label: "Tablet", value: "Tablet", icon: Tablet },
];

function AssetsPage() {
  const navigate = useNavigate();
  const { assets, deleteAsset, isLoading } = useAssetService();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("employee");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = assets.filter((a) =>
    a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    a.deviceName.toLowerCase().includes(search.toLowerCase()) ||
    a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.brand.toLowerCase().includes(search.toLowerCase()) ||
    a.model.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = assets.reduce((sum, a) => sum + (a.amount || 0), 0);

  const groupedByEmployee = useMemo(() => {
    const groups: Record<string, { employeeName: string; assets: any[] }> = {};
    filtered.forEach(a => {
      if (!groups[a.employeeId]) {
        groups[a.employeeId] = { employeeName: a.employeeName, assets: [] };
      }
      groups[a.employeeId].assets.push(a);
    });
    return Object.entries(groups).map(([id, data]) => ({ employeeId: id, ...data }));
  }, [filtered]);

  const remove = async () => {
    if (!deleteId) return;
    await deleteAsset(deleteId);
    setDeleteId(null);
  };

  const getDeviceIcon = (type: string) => {
    return DEVICE_TYPES.find(t => t.value === type)?.icon || Monitor;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets Allocation"
        description="Manage hardware and devices assigned to employees."
        actions={
          <Button
            size="sm"
            onClick={() => navigate({ to: "/assets/allocate" })}
            className="bg-gradient-primary text-primary-foreground gap-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all h-9 text-[13px] font-bold"
          >
            <Plus className="h-4 w-4" /> Allocate Device
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Allocated" value={assets.length} icon={Monitor} accent="primary" delay={0} />
        <StatCard label="Total Value" value={`₹${totalValue.toLocaleString()}`} icon={IndianRupee} accent="info" delay={0.05} />
        <StatCard label="Active Devices" value={assets.filter(a => a.status === 'active').length} icon={CheckCircle2} accent="success" delay={0.1} />
        <StatCard label="Issues/Damaged" value={assets.filter(a => a.status === 'damaged').length} icon={AlertCircle} accent="destructive" delay={0.15} />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-2">
        <FormInput
          placeholder="Search assets..."
          icon={Search}
          className="h-10 w-full md:w-[320px] shadow-none bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <ViewToggle 
            view={view} 
            onViewChange={(v) => setView(v)}
            options={[
              { value: "employee", label: "By Employee", icon: User },
              { value: "list", label: "All Devices", icon: List },
            ]}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
        ) : view === "employee" ? (
          <motion.div
            key="employee"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {groupedByEmployee.map((group) => (
              <Card key={group.employeeId} className="p-5 rounded-2xl border-border/60 bg-card shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {group.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px]">{group.employeeName}</h3>
                      <p className="text-[11px] text-muted-foreground">{group.assets.length} devices allocated</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate({ to: "/assets/allocate", search: { employeeId: group.employeeId } })}
                    className="h-8 rounded-xl border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 font-bold text-[11px] gap-1.5 px-3 shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Device
                  </Button>
                </div>

                <div className="space-y-2">
                  {group.assets.map(asset => {
                    const Icon = getDeviceIcon(asset.deviceType);
                    return (
                      <div key={asset._id} className="group relative flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-card transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-card border border-border/50 flex items-center justify-center text-primary/60 group-hover:text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-[12px] font-semibold">{asset.deviceName}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span className="font-mono">{asset.serialNumber}</span>
                              <span>•</span>
                              <span className="text-primary/70 font-medium">₹{asset.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary" onClick={() => navigate({ to: "/assets/allocate", search: { assetId: asset._id } })}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(asset._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm"
          >
            <DataTable
              headers={["Employee", "Device Type", "Model", "Amount", "Serial Number", "Status", "Actions"]}
              isEmpty={filtered.length === 0}
              emptyMessage="No device allocations found."
            >
              {filtered.map((asset) => {
                const Icon = getDeviceIcon(asset.deviceType);
                return (
                  <DataTableRow key={asset._id}>
                    <DataTableCell isFirst className="font-medium">{asset.employeeName}</DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[13px] font-medium">{asset.deviceType}</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="text-[13px] font-semibold">{asset.deviceName}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">{asset.brand}</div>
                    </DataTableCell>
                    <DataTableCell className="font-bold text-foreground">₹{asset.amount.toLocaleString()}</DataTableCell>
                    <DataTableCell className="font-mono text-[12px] text-muted-foreground">{asset.serialNumber}</DataTableCell>
                    <DataTableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[10px] font-bold px-2 py-0.5 rounded-full",
                          asset.status === "active" ? "bg-success/10 text-success border-success/20" :
                            asset.status === "returned" ? "bg-muted text-muted-foreground border-border" :
                              "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {asset.status}
                      </Badge>
                    </DataTableCell>
                    <DataTableCell isLast>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={() => navigate({ to: "/assets/allocate", search: { assetId: asset._id } })} className="gap-2 cursor-pointer">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteId(asset._id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5">
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-xl">
          <AlertDialogHeader>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-[16px]">Remove allocation?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">This will remove the device from the employee's assigned assets. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 shadow-md">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

