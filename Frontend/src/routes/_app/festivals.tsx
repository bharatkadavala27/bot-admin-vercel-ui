import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, CalendarDays, CalendarHeart, Gift, Sparkles,
  PartyPopper, Filter, MapPin, Loader2
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ViewToggle } from "@/components/shared/view-toggle";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/shared/form-input";
import { FormSelect } from "@/components/shared/form-select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFestivalService, type Festival as BackendFestival } from "@/services/festival-service";

import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/festivals")({
  component: FestivalsPage,
});

function FestivalsPage() {
  type FestivalType = "mandatory" | "optional" | "event";
  const TYPE_CONFIG: Record<FestivalType, any> = {
    mandatory: { icon: CalendarHeart, color: "text-primary bg-primary/10", border: "border-primary/20", label: "Mandatory Holiday" },
    optional: { icon: Sparkles, color: "text-warning-foreground bg-warning/10", border: "border-warning/30", label: "Optional Holiday" },
    event: { icon: PartyPopper, color: "text-info bg-info/10", border: "border-info/30", label: "Company Event" },
  };

  const [hasMounted, setHasMounted] = useState(false);

  const { festivals: list, isLoading, isFetching, createFestival, updateFestival, deleteFestival, isCreating, isUpdating } = useFestivalService();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendFestival | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | FestivalType>("all");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", type: "mandatory" as FestivalType, description: "" });
  const [poster, setPoster] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const getDayOfWeek = (dateString: string) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(dateString).getDay()];
  };

  if (!hasMounted) return null;

  const filtered = list
    .filter(f => filterType === "all" || f.type === filterType)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || (f.description || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const upcomingCount = list.filter(f => new Date(f.startDate) >= new Date()).length;
  const mandatoryCount = list.filter(f => f.type === "mandatory").length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      toast.error("Name, start date, and end date are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      formData.append("type", form.type);
      formData.append("description", form.description);

      if (poster) {
        formData.append("poster", poster);
      } else if (editing && editing.posterUrl && !preview) {
        formData.append("removePoster", "true");
      }

      if (editing) {
        await updateFestival({ id: editing._id, formData });
      } else {
        await createFestival(formData);
      }
      setOpen(false);
      setPoster(null);
      setPreview(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await deleteFestival(deleteId);
      setDeleteId(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (isLoading || (list.length === 0 && isFetching)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Festivals & Holidays" description="Manage the company's annual holiday calendar and upcoming events." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
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
        title="Festivals & Holidays"
        description="Manage the company's annual holiday calendar and upcoming events."
        actions={
          <Button size="sm" onClick={() => {
            setEditing(null);
            setForm({ name: "", startDate: "", endDate: "", type: "mandatory", description: "" });
            setPoster(null);
            setPreview(null);
            setOpen(true);
          }} className="h-9 text-[13px] bg-gradient-primary text-primary-foreground px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Plus className="h-4 w-4 mr-1.5" /> Add Holiday
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Holidays" value={list.length} icon={CalendarDays} accent="primary" delay={0} />
        <StatCard label="Mandatory Leaves" value={mandatoryCount} icon={CalendarHeart} accent="success" delay={0.05} />
        <StatCard label="Upcoming Events" value={upcomingCount} icon={Gift} accent="warning" delay={0.1} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <FormInput
          placeholder="Search holidays..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <ViewToggle view={view} onViewChange={setView} />
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as "all" | FestivalType)}>
              <SelectTrigger className="h-10 w-full md:w-[200px] border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl text-[13px] font-medium transition-all gap-2 px-3 shadow-none">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue placeholder="All Holiday Types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mandatory">Mandatory Holidays</SelectItem>
                <SelectItem value="optional">Optional Holidays</SelectItem>
                <SelectItem value="event">Company Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((festival, i) => {
              const config = TYPE_CONFIG[festival.type];
              const Icon = config.icon;

              // Date formatting and duration
              const start = new Date(festival.startDate);
              const end = new Date(festival.endDate);
              const month = start.toLocaleString('default', { month: 'short' });
              const day = start.getDate();

              const diffTime = Math.abs(end.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

              return (
                <motion.div
                  key={festival._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Check if holiday is in the past (using endDate) */}
                  {(() => {
                    const isPast = new Date(festival.endDate) < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <Card className={cn(
                        "relative overflow-hidden p-5 border border-border/60 bg-white rounded-xl shadow-sm transition-all duration-300 group hover:shadow-md hover:border-primary/40 h-full flex flex-col",
                        isPast && "opacity-60 grayscale-[0.6] hover:grayscale-0 transition-all bg-muted/5"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-3">
                            {/* Date Block */}
                            <div className={cn(
                              "h-14 w-12 rounded-lg bg-muted/30 border border-border/50 flex flex-col items-center justify-center shrink-0",
                              isPast && "bg-muted/50"
                            )}>
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">{month}</span>
                              <span className="text-[18px] font-bold text-foreground leading-tight">{day}</span>
                            </div>

                            {/* Small Poster Square */}
                            {festival.posterUrl && !brokenImages[festival._id] && (
                              <div className="h-14 w-14 rounded-lg overflow-hidden border border-border/50 shrink-0">
                                <img
                                  src={festival.posterUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={() => setBrokenImages(prev => ({ ...prev, [festival._id]: true }))}
                                />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[16px] font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{festival.name}</h3>
                                {isPast ? (
                                  <Badge variant="secondary" className="h-4 text-[9px] px-1.5 uppercase tracking-tighter opacity-70">Past</Badge>
                                ) : (
                                  <Badge className="h-4 text-[9px] px-1.5 uppercase tracking-tighter bg-success/10 text-success border-success/20">Upcoming</Badge>
                                )}
                              </div>
                              <div className="text-[12px] text-muted-foreground flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {festival.startDate === festival.endDate ?
                                    getDayOfWeek(festival.startDate) :
                                    `${new Date(festival.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(festival.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">
                          {festival.description}
                        </p>

                        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                          <div className="flex flex-col">
                            <Badge variant="outline" className={cn("text-[10px] font-medium px-2 py-0.5 border-transparent mb-1", config.color)}>
                              <Icon className="h-3 w-3 mr-1.5" />
                              {config.label}
                            </Badge>
                            <div className="flex items-center gap-1 font-bold text-primary/70 text-[9px] uppercase tracking-widest">
                              <Sparkles className="h-2.5 w-2.5" /> {diffDays} {diffDays === 1 ? 'Day' : 'Days'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary" onClick={() => {
                              setEditing(festival);
                              setForm({ name: festival.name, startDate: festival.startDate, endDate: festival.endDate, type: festival.type, description: festival.description || "" });
                              setPreview(festival.posterUrl || null);
                              setPoster(null);
                              setOpen(true);
                            }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(festival._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
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
            className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm"
          >
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-muted/30 border-b border-border/60">
                     <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Poster</th>
                     <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Holiday Name</th>
                     <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Type</th>
                     <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Duration</th>
                     <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Status</th>
                     <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/40">
                   {filtered.map((f) => {
                     const isPast = new Date(f.endDate) < new Date(new Date().setHours(0,0,0,0));
                     const config = TYPE_CONFIG[f.type];
                     const Icon = config.icon;
                     const diffDays = Math.ceil(Math.abs(new Date(f.endDate).getTime() - new Date(f.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

                     return (
                      <tr key={f._id} className={cn("hover:bg-muted/10 transition-colors group", isPast && "bg-muted/5 opacity-80")}>
                        <td className="px-5 py-4">
                          {f.posterUrl && !brokenImages[f._id] ? (
                            <div className="h-10 w-10 rounded-lg border border-border/60 overflow-hidden">
                              <img src={f.posterUrl} alt="" className="h-full w-full object-cover" onError={() => setBrokenImages(p => ({...p, [f._id]: true}))} />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted/40 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/40">
                              <Gift className="h-4 w-4" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[14px] text-foreground">{f.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {new Date(f.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(f.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={cn("text-[10px] font-medium px-2 py-0.5 border-transparent", config.color)}>
                            <Icon className="h-3 w-3 mr-1.5" />
                            {config.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-[12px] font-bold text-foreground">
                            <Sparkles className="h-3 w-3 text-primary" /> {diffDays} {diffDays === 1 ? 'Day' : 'Days'}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {isPast ? (
                            <Badge variant="secondary" className="h-5 text-[10px] opacity-70">Past</Badge>
                          ) : (
                            <Badge className="h-5 text-[10px] bg-success/10 text-success border-success/20">Upcoming</Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => {
                              setEditing(f);
                              setForm({ name: f.name, startDate: f.startDate, endDate: f.endDate, type: f.type, description: f.description || "" });
                              setPreview(f.posterUrl || null);
                              setPoster(null);
                              setOpen(true);
                            }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(f._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Gift className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-muted-foreground">No holidays found</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Adjust your search or add a new festival.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 text-primary grid place-items-center mb-2">
              <PartyPopper className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[16px]">{editing ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
            <DialogDescription className="text-[13px]">Add a new festival, holiday, or event to the calendar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 mt-2">
            <FormInput
              label="Holiday Name"
              placeholder="e.g. Diwali"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="h-10"
              containerClassName="space-y-1"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: form.endDate || e.target.value })}
                className="h-10 text-[13px]"
                containerClassName="space-y-1"
              />
              <FormInput
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                min={form.startDate}
                className="h-10 text-[13px]"
                containerClassName="space-y-1"
              />
            </div>

            <FormSelect
              label="Type"
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as FestivalType })}
              options={[
                { label: "Mandatory Holiday", value: "mandatory" },
                { label: "Optional Holiday", value: "optional" },
                { label: "Company Event", value: "event" },
              ]}
              containerClassName="space-y-1"
            />

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase ml-1">Holiday Poster</span>
              <div className="flex items-center gap-4">
                {preview && (
                  <div className="h-16 w-24 rounded-lg border overflow-hidden shrink-0 relative group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPreview(null); setPoster(null); }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="flex h-10 w-full rounded-xl border border-border/60 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[12px] pt-1.5"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPoster(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            <FormInput
              label="Description"
              placeholder="Brief description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="h-10"
              containerClassName="space-y-1"
            />

            <DialogFooter className="gap-2 pt-2 border-t border-border/40 mt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)} className="rounded-lg" disabled={isCreating || isUpdating}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground rounded-lg px-5" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  editing ? "Save Changes" : "Add Holiday"
                )}
              </Button>
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
            <AlertDialogTitle className="text-[16px]">Delete holiday?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">This will permanently remove the holiday from the calendar.</AlertDialogDescription>
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
