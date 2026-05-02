import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Megaphone, BellRing, Pin, Pencil, Trash2, Search, Info, AlertTriangle, CalendarDays, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormInput } from "@/components/shared/form-input";
import { ViewToggle } from "@/components/shared/view-toggle";
import { FormSelect } from "@/components/shared/form-select";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAnnouncementService, type Announcement } from "@/services/announcement-service";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

export const Route = createFileRoute("/_app/announcements")({
  component: AnnouncementsPage,
});

const TYPE_CONFIG = {
  general: { icon: Megaphone, color: "text-primary bg-primary/10", border: "border-primary/20", badge: "bg-primary/10 text-primary" },
  urgent: { icon: AlertTriangle, color: "text-destructive bg-destructive/10", border: "border-destructive/30", badge: "bg-destructive/10 text-destructive" },
  event: { icon: CalendarDays, color: "text-success bg-success/10", border: "border-success/30", badge: "bg-success/10 text-success" },
  policy: { icon: Info, color: "text-info bg-info/10", border: "border-info/30", badge: "bg-info/10 text-info" },
};

function AnnouncementsPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { announcements, isLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin } = useAnnouncementService();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | Announcement["type"]>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [form, setForm] = useState({ title: "", content: "", type: "general" as Announcement["type"], pinned: false });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const filtered = announcements
    .filter(a => filterType === "all" || a.type === filterType)
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      if (editing) {
        await updateAnnouncement({ id: editing._id, data: form });
      } else {
        await createAnnouncement(form);
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    await deleteAnnouncement(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notice Board"
        description="Broadcast important updates, events, and policies to the organization."
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setForm({ title: "", content: "", type: "general", pinned: false }); setOpen(true); }} className="h-9 text-[13px] bg-gradient-primary text-primary-foreground px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Plus className="h-4 w-4 mr-1.5" /> Post Announcement
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <ViewToggle view={view} onViewChange={setView} />
          
          <Select value={filterType} onValueChange={(v) => setFilterType(v as "all" | any)}>
            <SelectTrigger className="h-10 w-full md:w-[180px] border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl text-[13px] font-medium transition-all gap-2 px-3 shadow-none">
              <Filter className="h-3.5 w-3.5" />
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FormInput
          placeholder="Search notices..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <SkeletonLoader key="loading" type={view === "grid" ? "card" : "table"} count={6} />
        ) : view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filtered.map((announcement, i) => {
              const config = TYPE_CONFIG[announcement.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={announcement._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn(
                    "relative p-5 h-full border bg-white rounded-xl shadow-sm transition-all duration-300 group hover:shadow-md hover:border-primary/40",
                    announcement.pinned ? `border-l-4 ${config.border}` : "border-border/50"
                  )}>
                    {announcement.pinned && (
                      <div className="absolute top-4 right-4 text-primary">
                        <Pin className="h-4 w-4 fill-primary/20 rotate-45" />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className={cn("h-10 w-10 shrink-0 rounded-xl grid place-items-center mt-1", config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0 border-transparent uppercase", config.badge)}>
                            {announcement.type}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            • {announcement.date}
                          </span>
                        </div>

                        <h3 className="text-[16px] font-semibold text-foreground mb-1.5 pr-2">
                          {announcement.title}
                        </h3>
                        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                          {announcement.content}
                        </p>

                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                          <div className="text-[11px] font-medium text-foreground/70 flex items-center gap-1.5">
                            <BellRing className="h-3 w-3 text-muted-foreground" />
                            Posted by {announcement.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-muted" onClick={() => togglePin(announcement._id)}>
                              <Pin className={cn("h-3.5 w-3.5", announcement.pinned ? "fill-primary text-primary" : "")} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary" onClick={() => { setEditing(announcement); setForm(announcement); setOpen(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(announcement._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
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
              headers={["Type", "Announcement Details", "Posted By", "Date", "Actions"]}
            >
              {filtered.map((a) => (
                <DataTableRow key={a._id}>
                  <DataTableCell isFirst>
                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", TYPE_CONFIG[a.type]?.badge)}>
                      {a.type}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        {a.pinned && <Pin className="h-3 w-3 text-primary fill-primary/20 rotate-45" />}
                        <span className="text-[14px] font-semibold">{a.title}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground line-clamp-1">{a.content}</p>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-[13px] font-medium">{a.author}</DataTableCell>
                  <DataTableCell className="text-[13px] text-muted-foreground">{a.date}</DataTableCell>
                  <DataTableCell isLast>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => { setEditing(a); setForm(a); setOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteId(a._id)}>
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
        <div className="text-center py-16">
          <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-muted-foreground">No announcements found</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Adjust your search or create a new post.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 text-primary grid place-items-center mb-2">
              <Megaphone className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[16px]">{editing ? "Edit Announcement" : "Post Announcement"}</DialogTitle>
            <DialogDescription className="text-[13px]">This will be visible to all employees on their dashboard.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 mt-2">
            <FormInput
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Company Offsite"
              className="h-10"
              containerClassName="space-y-1"
            />

            <FormSelect
              label="Category"
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as AnnouncementType })}
              options={[
                { label: "General", value: "general" },
                { label: "Urgent", value: "urgent" },
                { label: "Event", value: "event" },
                { label: "Policy Update", value: "policy" },
              ]}
              containerClassName="space-y-1"
            />

            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Message Details</Label>
              <Textarea
                className="min-h-[120px] text-[14px] rounded-lg resize-none"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write the full announcement here..."
              />
            </div>

            <div className="flex items-center gap-2 pt-1 pb-2">
              <input
                type="checkbox"
                id="pin"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="rounded border-border/60 text-primary focus:ring-primary h-4 w-4"
              />
              <Label htmlFor="pin" className="text-[13px] cursor-pointer">Pin to top of the board</Label>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-border/40">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)} className="rounded-lg">Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground rounded-lg px-5">{editing ? "Save Changes" : "Post Announcement"}</Button>
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
            <AlertDialogTitle className="text-[16px]">Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">This will permanently remove the notice from the board. This cannot be undone.</AlertDialogDescription>
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
