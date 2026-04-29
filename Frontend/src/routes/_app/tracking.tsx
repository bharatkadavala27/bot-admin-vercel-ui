import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Wifi, WifiOff, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ViewToggle } from "@/components/shared/view-toggle";
import { FormInput } from "@/components/shared/form-input";
import { DataTable, DataTableCell, DataTableRow } from "@/components/shared/data-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTrackingService } from "@/services/tracking-service";
import { useEmployeeService } from "@/services/employee-service";
import { useAttendanceService } from "@/services/attendance-service";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_app/tracking")({
  component: TrackingPage,
});

function TrackingPage() {
  const { employees, isLoading: loadingEmployees } = useEmployeeService();
  const { locations, isLoading: loadingLocations } = useTrackingService();
  const { records: attendanceList } = useAttendanceService();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid"); // grid = map, list = table

  const attendanceMap = useMemo(() => {
    const map: Record<string, any> = {};
    attendanceList.forEach(r => {
      map[r.employeeId?._id || r.employeeId] = r;
    });
    return map;
  }, [attendanceList]);

  const locationMap = useMemo(() => {
    const map: Record<string, any> = {};
    locations.forEach(l => {
      map[l.employeeId] = l;
    });
    return map;
  }, [locations]);

  const filtered = employees.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()));
  const selected = employees.find((e) => e._id === selectedId) ?? filtered[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Employee Tracking" description="Live location and status of field employees." />

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-1">
        <FormInput
          placeholder="Search employee..."
          icon={Search}
          className="h-10 w-full md:w-[260px] shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} labels={{ grid: "Map View", list: "List View" }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
        {/* Employee List */}
        <Card className="p-4 border border-border/60 bg-white rounded-xl shadow-sm lg:col-span-1 flex flex-col h-[560px] transition-all hover:border-primary/40">

          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
            {filtered.map((e) => {
              const att = attendanceMap[e._id];
              const loc = locationMap[e._id];
              const isOnline = att && att.punchIn && !att.punchOut;
              return (
                <motion.button
                  key={e._id}
                  onClick={() => setSelectedId(e._id)}
                  whileHover={{ x: 2 }}
                  className={cn(
                    "w-full text-left flex items-center gap-3 p-2.5 rounded-lg border transition-all",
                    selectedId === e._id
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border/50 hover:bg-muted/30 hover:border-border",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                        {e.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                        isOnline ? "bg-success" : "bg-muted-foreground/50",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{e.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {loc ? `Lat: ${loc.latitude.toFixed(2)}, Lng: ${loc.longitude.toFixed(2)}` : "No location data"}
                    </div>
                  </div>
                  <Badge
                    variant={isOnline ? "default" : "secondary"}
                    className="capitalize text-[10px] px-1.5 py-0 shrink-0"
                  >
                    {isOnline ? "Online" : "Away"}
                  </Badge>
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Map */}
        <Card className="p-0 border border-border/60 bg-white rounded-xl shadow-sm lg:col-span-2 overflow-hidden h-[560px] relative">
          {/* Mock map background */}
          <div className="absolute inset-0 bg-gradient-soft">
            <svg className="h-full w-full opacity-25" viewBox="0 0 800 600" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.42 0.20 340)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path d="M0,300 Q200,200 400,280 T800,250" stroke="oklch(0.42 0.20 340)" strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M0,400 Q300,350 500,420 T800,380" stroke="oklch(0.62 0.24 340)" strokeWidth="2" fill="none" opacity="0.5" />
            </svg>
          </div>

          {/* Floating pins */}
          {filtered.map((e, i) => {
            const loc = locationMap[e._id];
            // If no real loc, use deterministic mock based on index so map isn't empty
            const x = loc ? (loc.longitude % 100) : (10 + ((i * 17) % 80));
            const y = loc ? (loc.latitude % 100) : (15 + ((i * 23) % 70));
            const isSel = selected?._id === e._id;
            const att = attendanceMap[e._id];
            const isOnline = att && att.punchIn && !att.punchOut;

            return (
              <motion.button
                key={e._id}
                onClick={() => setSelectedId(e._id)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="relative flex flex-col items-center">
                  {isSel && (
                    <span className="absolute -top-1 h-10 w-10 rounded-full bg-primary/25 animate-ping" />
                  )}
                  <div className={cn(
                    "relative h-8 w-8 rounded-full grid place-items-center text-white shadow-md",
                    isOnline ? "bg-gradient-primary" : "bg-muted-foreground/60"
                  )}>
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  {isSel && (
                    <div className="mt-1 px-2 py-0.5 rounded-md bg-card text-foreground text-[11px] font-medium shadow-sm border border-border whitespace-nowrap">
                      {e.name}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}

          {/* Info card */}
          {selected && (
            <motion.div
              key={selected._id}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs glass rounded-xl p-3.5 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/25 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                    {selected.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{selected.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    {attendanceMap[selected._id] && attendanceMap[selected._id].punchIn && !attendanceMap[selected._id].punchOut
                      ? <Wifi className="h-3 w-3 text-success shrink-0" />
                      : <WifiOff className="h-3 w-3 shrink-0" />
                    }
                    {attendanceMap[selected._id] && attendanceMap[selected._id].punchIn && !attendanceMap[selected._id].punchOut ? "Online now" : "Last seen N/A"}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {locationMap[selected._id] ? `Last updated: ${new Date(locationMap[selected._id].timestamp).toLocaleTimeString()}` : "No coordinates available"}
                </div>
                {locationMap[selected._id] && (
                  <div className="text-[10px] font-mono text-muted-foreground/70">
                    {locationMap[selected._id].latitude.toFixed(4)}°N · {locationMap[selected._id].longitude.toFixed(4)}°E
                  </div>
                )}
              </div>
            </motion.div>
          )}
          </Card>
        </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm"
          >

            <DataTable
              headers={["Employee", "Status", "Connectivity", "Last Location", "Last Updated"]}
              isEmpty={filtered.length === 0}
              className="rounded-none border-none"
            >
              {filtered.map((e) => {
                const att = attendanceMap[e._id];
                const loc = locationMap[e._id];
                const isOnline = att && att.punchIn && !att.punchOut;
                return (
                  <DataTableRow key={e._id}>
                    <DataTableCell isFirst>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {e.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-[13px] text-foreground">{e.name}</span>
                          <span className="text-[11px] text-muted-foreground">{e.phone}</span>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <Badge variant={isOnline ? "default" : "secondary"} className="text-[10px] px-2 py-0">
                        {isOnline ? "Online" : "Away"}
                      </Badge>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-1.5 text-[12px]">
                        {isOnline ? <Wifi className="h-3.5 w-3.5 text-success" /> : <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className={isOnline ? "text-success font-medium" : "text-muted-foreground"}>{isOnline ? "Active" : "Disconnected"}</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="text-[12px] text-muted-foreground italic">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : "No data"}
                      </div>
                    </DataTableCell>
                    <DataTableCell isLast className="text-[12px] text-muted-foreground">
                      {loc ? new Date(loc.timestamp).toLocaleString() : "—"}
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTable>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
