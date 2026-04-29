import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  IndianRupee,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  Percent,
  Clock,
  LayoutGrid,
  VenetianMask,
  Users2,
  Building2,
  MapPin,
  Banknote,
  Timer,
  CalendarCheck
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEmployeeService } from "@/services/employee-service";
import { useDepartmentService } from "@/services/department-service";
import { useBranchService } from "@/services/branch-service";
import { useShiftService } from "@/services/shift-service";
import { FormInput } from "@/components/shared/form-input";
import { FormSelect } from "@/components/shared/form-select";
import { cn, formatTime12h } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type AddEmployeeSearch = {
  employeeId?: string;
};

export const Route = createFileRoute("/_app/employees/create")({
  validateSearch: (search: Record<string, unknown>): AddEmployeeSearch => {
    return {
      employeeId: search.employeeId as string | undefined,
    };
  },
  component: AddEmployeePage,
});

const DAYS_OF_WEEK = [
  { label: "Mon", key: "mon" },
  { label: "Tue", key: "tue" },
  { label: "Wed", key: "wed" },
  { label: "Thu", key: "thu" },
  { label: "Fri", key: "fri" },
  { label: "Sat", key: "sat" },
  { label: "Sun", key: "sun" },
];

function SectionTitle({ title, icon: Icon, className }: { title: string; icon: any; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 mb-6", className)}>
      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-[14px] font-bold text-foreground tracking-tight">{title}</h3>
    </div>
  );
}

function AddEmployeePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { employeeId } = Route.useSearch();
  const navigate = useNavigate();
  const { createEmployee, updateEmployee, employees } = useEmployeeService();
  const { departments } = useDepartmentService();
  const { branches } = useBranchService();
  const { shifts } = useShiftService();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!employeeId;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "male",
    dob: "",
    salary: "",
    joiningDate: "",
    departmentId: "",
    branchId: "",
    employmentType: "monthly",
    shiftId: "",
    weeklyHolidays: [] as { day: string; weeks: number[] }[],
    address: "",
    bloodGroup: "",
    contactPersonName: "",
    contactPersonMobile: "",
    aadhaarNo: "",
    panNo: "",
    experience: "",
    residentialAddress: "",
    residentialPhone: "",
    education: "",
    bankDetails: {
      accountNumber: "",
      bankName: "",
      ifsc: "",
      branchName: "",
      nameAsPerBank: "",
    },
    leadDeletionPermission: false,
    salaryComponents: {
      tds: { enabled: false, percentage: 0 },
      tdsCategory: "",
      basic: { enabled: true, percentage: 50 },
      da: { enabled: false, percentage: 0 },
      hra: { enabled: true, percentage: 40 },
      ca: { enabled: false, percentage: 0 },
      pf: { enabled: false, percentage: 12 },
      esic: { enabled: false, percentage: 0.75 },
      epf: { enabled: false, percentage: 0 },
      tdsOnProfession: { enabled: false, percentage: 0 },
      retention: { enabled: false, percentage: 0 },
      pt: { enabled: false, percentage: 0 },
      adminCharge: { enabled: false, percentage: 0 },
      bonus: { enabled: false, percentage: 0 },
    }
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const WEEKS = [1, 2, 3, 4, 5];

  const formatDateForInput = (dateVal?: string | Date) => {
    if (!dateVal) return "";
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (employeeId && employees.length > 0) {
      const emp = employees.find(e => e._id === employeeId);
      if (emp) {
        setForm({
          fullName: emp.name,
          phone: emp.phone,
          email: emp.email || "",
          gender: (emp as any).gender || "male",
          dob: formatDateForInput((emp as any).dob),
          salary: emp.salary?.toString() || "0",
          joiningDate: formatDateForInput((emp as any).joiningDate || emp.createdAt),
          departmentId: (emp.departmentId as any)?._id || emp.departmentId || "",
          branchId: (emp.branchId as any)?._id || emp.branchId || "",
          employmentType: (emp as any).employmentType || "monthly",
          shiftId: (emp.shiftId as any)?._id || emp.shiftId || "",
          weeklyHolidays: emp.weeklyHolidays || [],
          address: (emp as any).address || "",
          bloodGroup: (emp as any).bloodGroup || "",
          contactPersonName: (emp as any).contactPersonName || "",
          contactPersonMobile: (emp as any).contactPersonMobile || "",
          aadhaarNo: (emp as any).aadhaarNo || "",
          panNo: (emp as any).panNo || "",
          experience: (emp as any).experience || "",
          residentialAddress: (emp as any).residentialAddress || "",
          residentialPhone: (emp as any).residentialPhone || "",
          education: (emp as any).education || "",
          bankDetails: (emp as any).bankDetails || {
            accountNumber: "",
            bankName: "",
            ifsc: "",
            branchName: "",
            nameAsPerBank: "",
          },
          leadDeletionPermission: (emp as any).leadDeletionPermission || false,
          salaryComponents: {
            ...form.salaryComponents,
            ...emp.salaryComponents
          }
        });
      }
    }
  }, [employeeId, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.fullName,
        salary: Number(form.salary) || 0,
      };

      if (isEditing && employeeId) {
        await updateEmployee({ id: employeeId, data: payload as any });
      } else {
        await createEmployee({ ...payload, role: 'employee' } as any);
      }
      navigate({ to: "/employees" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHoliday = (day: string) => {
    setForm(prev => {
      const exists = prev.weeklyHolidays.find(h => h.day === day);
      if (exists) {
        return { ...prev, weeklyHolidays: prev.weeklyHolidays.filter(h => h.day !== day) };
      }
      return { ...prev, weeklyHolidays: [...prev.weeklyHolidays, { day, weeks: [] }] };
    });
  };

  const toggleWeek = (day: string, week: number) => {
    setForm(prev => ({
      ...prev,
      weeklyHolidays: prev.weeklyHolidays.map(h => {
        if (h.day !== day) return h;
        const weeks = h.weeks.includes(week)
          ? h.weeks.filter(w => w !== week)
          : [...h.weeks, week].sort();
        return { ...h, weeks };
      })
    }));
  };

  const updateSalaryComp = (key: string, field: 'enabled' | 'percentage', value: any) => {
    setForm(prev => ({
      ...prev,
      salaryComponents: {
        ...prev.salaryComponents,
        [key]: {
          ...(prev.salaryComponents as any)[key],
          [field]: value
        }
      }
    }));
  };

  if (!hasMounted) return null;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: "/employees" })}
          className="h-8 w-8 rounded-lg border-border/60 hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={isEditing ? "Edit Profile" : "Add Employee"}
          description={isEditing ? `Managing details for ${form.fullName}` : "Register a new member to the organization"}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">

          <Card className="p-8 border border-border/60 bg-white rounded-xl shadow-sm">
            <SectionTitle title="General Details" icon={User} className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">

              <FormInput
                label="Full Name"
                icon={User}
                placeholder="Enter full name"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                required
              />

              <FormInput
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />

              <FormInput
                label="Phone Number"
                icon={Phone}
                placeholder="00000 00000"
                value={form.phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, phone: val });
                }}
                required
              />

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-[12px] font-bold text-muted-foreground tracking-wider">Gender Selection</Label>
                <div className="flex bg-white border border-primary p-0 rounded-full h-12 overflow-hidden shadow-sm mt-2">
                  {[
                    { id: 'male', label: 'Male' },
                    { id: 'female', label: 'Female' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g.id })}
                      className={cn(
                        "flex-1 h-full font-bold text-[14px] transition-all duration-300",
                        form.gender === g.id
                          ? "bg-primary text-white"
                          : "bg-white text-foreground hover:bg-muted/10"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <FormInput
                label="Date of Birth"
                type="date"
                icon={Calendar}
                value={form.dob}
                onChange={e => setForm({ ...form, dob: e.target.value })}
                required
              />

            </div>
          </Card>

          <Card className="p-6 border border-border/60 bg-white rounded-xl shadow-sm">
            <SectionTitle title="Employment Terms" icon={Briefcase} className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">

              {/* Employment Type */}
              <div className="col-span-1 md:col-span-2 space-y-2 pb-6 border-b border-border/40 mb-2">
                <Label className="text-[12px] font-bold text-muted-foreground tracking-wider">Employment & Pay Type</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {[
                    { id: 'monthly', label: 'Monthly', icon: CalendarCheck, desc: 'Fixed monthly' },
                    { id: 'daily', label: 'Daily', icon: Banknote, desc: 'Daily wage' },
                    { id: 'hourly', label: 'Hourly', icon: Timer, desc: 'Pay per hour' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setForm({ ...form, employmentType: type.id })}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border transition-all duration-300 shadow-sm",
                        form.employmentType === type.id
                          ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                          : "bg-white border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/5"
                      )}
                    >
                      <type.icon className={cn("h-6 w-6", form.employmentType === type.id ? "text-primary" : "text-muted-foreground")} />
                      <div className="text-center">
                        <div className={cn("text-[13px] font-bold", form.employmentType === type.id ? "text-primary" : "text-foreground")}>{type.label}</div>
                        <div className="text-[10px] opacity-60 font-medium">{type.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <FormInput
                label="Salary Amount (₹)"
                icon={IndianRupee}
                placeholder="Enter amount"
                value={form.salary}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, salary: val });
                }}
                required
              />

              <FormInput
                label="Joining Date"
                type="date"
                icon={Calendar}
                value={form.joiningDate}
                onChange={e => setForm({ ...form, joiningDate: e.target.value })}
                required
              />

              <FormSelect
                label="Branch Location"
                icon={MapPin}
                placeholder="Select Branch"
                value={form.branchId}
                onValueChange={(v) => setForm({ ...form, branchId: v })}
                options={branches.map((b: any) => ({ label: b.branchName, value: b._id }))}
              />

              <FormSelect
                label="Department"
                icon={Building2}
                placeholder="Select Department"
                value={form.departmentId}
                onValueChange={(v) => setForm({ ...form, departmentId: v })}
                options={departments.map((d: any) => ({ label: d.name, value: d._id }))}
              />

              <FormSelect
                label="Work Shift"
                icon={Clock}
                placeholder="Select Shift"
                value={form.shiftId}
                onValueChange={(v) => setForm({ ...form, shiftId: v })}
                options={shifts.map((s: any) => ({ label: s.name, value: s._id }))}
              />

              {/* Weekly Holidays */}
              <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] font-bold text-foreground">Weekly Holiday Settings</Label>
                  <span className="text-[11px] text-muted-foreground italic">* Leave weeks empty for all weeks</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {DAYS.map((day) => {
                    const holiday = form.weeklyHolidays.find(h => h.day === day);
                    return (
                      <div key={day} className="flex flex-col gap-2 p-3 rounded-xl border border-border/50 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={!!holiday}
                              onCheckedChange={() => toggleHoliday(day)}
                              className="scale-90"
                            />
                            <span className={cn("text-[13px] font-semibold", !!holiday ? "text-primary" : "text-muted-foreground")}>{day}</span>
                          </div>
                          {holiday && (
                            <div className="flex items-center gap-1.5 bg-white/60 p-1 rounded-lg border border-border/40">
                              <span className="text-[10px] font-bold text-muted-foreground px-2">WEEKS:</span>
                              {WEEKS.map(w => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => toggleWeek(day, w)}
                                  className={cn(
                                    "h-6 w-6 rounded-md text-[10px] font-bold transition-all",
                                    holiday.weeks.includes(w) ? "bg-primary text-white" : "hover:bg-primary/10 text-muted-foreground"
                                  )}
                                >
                                  {w}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setForm(prev => ({
                                  ...prev,
                                  weeklyHolidays: prev.weeklyHolidays.map(h => h.day === day ? { ...h, weeks: [] } : h)
                                }))}
                                className={cn(
                                  "px-2 h-6 rounded-md text-[10px] font-bold transition-all",
                                  holiday.weeks.length === 0 ? "bg-primary/20 text-primary" : "text-muted-foreground"
                                )}
                              >
                                ALL
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-8 border border-border/60 bg-white rounded-xl shadow-sm">
            <SectionTitle title="Personal Details" icon={User} className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <FormInput
                label="Blood Group"
                placeholder="e.g. A+"
                value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
              />
              <FormInput
                label="Education"
                placeholder="Highest qualification"
                value={form.education}
                onChange={e => setForm({ ...form, education: e.target.value })}
              />
              <FormInput
                label="Aadhaar Number"
                placeholder="0000 0000 0000"
                value={form.aadhaarNo}
                onChange={e => setForm({ ...form, aadhaarNo: e.target.value })}
              />
              <FormInput
                label="PAN Number"
                placeholder="ABCDE1234F"
                value={form.panNo}
                onChange={e => setForm({ ...form, panNo: e.target.value })}
              />
              <FormInput
                label="Total Experience"
                placeholder="e.g. 2 years"
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
              />
            </div>
          </Card>

          <Card className="p-8 border border-border/60 bg-white rounded-xl shadow-sm">
            <SectionTitle title="Contact Information" icon={MapPin} className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <div className="col-span-1 md:col-span-2">
                <FormInput
                  label="Current Address"
                  placeholder="Enter full address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <FormInput
                  label="Residential Address"
                  placeholder="Enter permanent address"
                  value={form.residentialAddress}
                  onChange={e => setForm({ ...form, residentialAddress: e.target.value })}
                />
              </div>
              <FormInput
                label="Residential Phone"
                placeholder="Landline or mobile"
                value={form.residentialPhone}
                onChange={e => setForm({ ...form, residentialPhone: e.target.value })}
              />
              <div className="col-span-1 md:col-span-2 pt-4 border-t border-border/40">
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Emergency Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput
                    label="Contact Person Name"
                    placeholder="Name"
                    value={form.contactPersonName}
                    onChange={e => setForm({ ...form, contactPersonName: e.target.value })}
                  />
                  <FormInput
                    label="Contact Person Mobile"
                    placeholder="Mobile number"
                    value={form.contactPersonMobile}
                    onChange={e => setForm({ ...form, contactPersonMobile: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border border-border/60 bg-white rounded-xl shadow-sm">
            <SectionTitle title="Bank Information" icon={Banknote} className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <FormInput
                label="Account Number"
                placeholder="Enter account number"
                value={form.bankDetails.accountNumber}
                onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: e.target.value } })}
              />
              <FormInput
                label="Bank Name"
                placeholder="e.g. HDFC Bank"
                value={form.bankDetails.bankName}
                onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: e.target.value } })}
              />
              <FormInput
                label="IFSC Code"
                placeholder="HDFC0000001"
                value={form.bankDetails.ifsc}
                onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, ifsc: e.target.value } })}
              />
              <FormInput
                label="Bank Branch"
                placeholder="Branch name"
                value={form.bankDetails.branchName}
                onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, branchName: e.target.value } })}
              />
              <div className="col-span-1 md:col-span-2">
                <FormInput
                  label="Name as per Bank"
                  placeholder="Full name as in passbook"
                  value={form.bankDetails.nameAsPerBank}
                  onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, nameAsPerBank: e.target.value } })}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border border-border/60 bg-white rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-[14px] font-bold tracking-tight">Permissions</h3>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
              <div className="space-y-0.5">
                <p className="text-[13px] font-semibold">Lead Deletion</p>
                <p className="text-[11px] text-muted-foreground">Allow record removal</p>
              </div>
              <Switch
                checked={form.leadDeletionPermission}
                onCheckedChange={checked => setForm({ ...form, leadDeletionPermission: checked })}
              />
            </div>
          </Card>

          <Card className="p-5 border border-border/60 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-[14px] font-bold tracking-tight">Salary Configuration</h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* TDS */}
              <div className="space-y-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.salaryComponents.tds.enabled}
                      onCheckedChange={(v) => updateSalaryComp('tds', 'enabled', v)}
                      className="scale-75"
                    />
                    <span className="text-[12px] font-bold">TDS Settings</span>
                  </div>
                  {form.salaryComponents.tds.enabled && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        className="h-7 w-16 text-[11px] font-normal px-2 rounded-md border-primary/20"
                        value={form.salaryComponents.tds.percentage}
                        onChange={(e) => updateSalaryComp('tds', 'percentage', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-[11px] font-bold text-primary">%</span>
                    </div>
                  )}
                </div>
                {form.salaryComponents.tds.enabled && (
                  <Input
                    placeholder="Category (e.g. 92B)"
                    className="h-8 text-[11px] font-normal rounded-lg bg-white mt-2"
                    value={form.salaryComponents.tdsCategory}
                    onChange={(e) => setForm({ ...form, salaryComponents: { ...form.salaryComponents, tdsCategory: e.target.value } })}
                  />
                )}
              </div>

              {/* Salary components grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(form.salaryComponents)
                  .filter(([key]) => key !== 'tds' && key !== 'tdsCategory')
                  .map(([key, value]: [string, any]) => (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                        value.enabled ? "bg-white border-primary/30 shadow-sm" : "bg-muted/10 border-transparent opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Switch
                          checked={value.enabled}
                          onCheckedChange={(v) => updateSalaryComp(key, 'enabled', v)}
                          className="scale-75"
                        />
                        <span className="text-[12px] font-bold text-foreground/80">{key.toUpperCase()}</span>
                      </div>
                      {value.enabled && (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            className="h-7 w-16 text-[11px] font-normal px-2 rounded-md border-border/60"
                            value={value.percentage}
                            onChange={(e) => updateSalaryComp(key, 'percentage', parseFloat(e.target.value) || 0)}
                          />
                          <Percent className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-primary text-white hover:opacity-95 shadow-md font-bold text-[14px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isEditing ? "Update Employee" : "Onboard Employee"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/employees" })}
              className="h-10 w-full rounded-xl text-muted-foreground font-semibold text-[13px] hover:bg-muted"
            >
              Discard Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}