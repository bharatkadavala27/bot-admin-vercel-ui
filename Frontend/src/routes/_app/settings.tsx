import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LogOut, Bell, Lock, Building2, Palette } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { setSession, clearSession } from "@/lib/auth";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="text-[14px] font-semibold text-foreground">{label}</h3>
    </div>
  );
}

function SettingsPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [notif, setNotif] = useState({ email: true, push: true, weekly: false });
  const [company, setCompany] = useState({
    name: "",
    logo: "",
    address: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    setHasMounted(true);
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const { data } = await apiClient.get("/users/profile");
        const logoUrl = data.companyLogo 
          ? (data.companyLogo.startsWith("http") ? data.companyLogo : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${data.companyLogo.startsWith("/") ? "" : "/"}${data.companyLogo}`)
          : `https://api.dicebear.com/7.x/initials/svg?seed=${data.companyName || "BOT"}`;

        setCompany({
          name: data.companyName || "",
          logo: logoUrl,
          address: data.address || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        // Update session
        if (session) {
          setSession({
            ...session,
            companyName: data.companyName,
            companyLogo: logoUrl,
            address: data.address,
            email: data.email,
            phone: data.phone
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (!hasMounted) return null;

  const logout = () => {
    clearSession();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-5 max-w-3xl">
        <PageHeader title="Settings" description="Loading your preferences..." />
        <SkeletonLoader type="card" count={1} className="h-[400px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader type="card" count={2} className="h-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="Settings" description="Manage your organization's workspace and account preferences." />

      {/* Company Profile */}
      <Card className="p-6 border border-border/60 bg-white rounded-2xl shadow-sm">
        <SectionHeader icon={Building2} label="Company Profile" />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const formData = new FormData();
              formData.append("companyName", company.name);
              formData.append("address", company.address);
              formData.append("email", company.email);
              formData.append("phone", company.phone);
              
              const logoFile = (document.getElementById("logo-upload") as HTMLInputElement)?.files?.[0];
              if (logoFile) {
                formData.append("logo", logoFile);
              }

              const { data } = await apiClient.put("/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
              });
              
              const logoUrl = data.companyLogo 
                ? (data.companyLogo.startsWith("http") ? data.companyLogo : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${data.companyLogo.startsWith("/") ? "" : "/"}${data.companyLogo}`)
                : prev.logo;

              setCompany(prev => ({
                ...prev,
                logo: logoUrl
              }));

              // Update session
              if (session) {
                setSession({
                  ...session,
                  name: data.name,
                  phone: data.phone,
                  companyName: data.companyName,
                  companyLogo: logoUrl,
                  address: data.address,
                  email: data.email
                });
              }
              
              toast.success("Settings updated successfully");
            } catch (error: any) {
              toast.error(error.response?.data?.message || "Update failed");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-6"
        >
          {/* Logo Upload Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-2">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl bg-muted grid place-items-center overflow-hidden border-2 border-dashed border-border group-hover:border-primary/40 transition-colors">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt="Company Logo" 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${company.name || "BOT"}`;
                    }}
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground/20 animate-pulse" />
                )}
              </div>
              <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full shadow-md border border-border">
                <Palette className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-[14px] font-semibold">Company Logo</div>
              <div className="text-[12px] text-muted-foreground max-w-xs">
                Update your organization's identity. Recommended size is 256x256px.
              </div>
                <div className="pt-2">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCompany({ ...company, logo: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[12px] border-primary/20 text-primary bg-primary/5 hover:bg-primary/10"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    Upload New Logo
                  </Button>
                </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[12px] font-medium ml-1">Organization Name</Label>
              <Input 
                className="h-10 text-[13px] bg-white border border-border/80 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all rounded-xl shadow-sm" 
                value={company.name} 
                onChange={(e) => setCompany({ ...company, name: e.target.value })} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium ml-1">Support Email</Label>
              <Input 
                type="email"
                className="h-10 text-[13px] bg-white border border-border/80 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all rounded-xl shadow-sm" 
                value={company.email} 
                onChange={(e) => setCompany({ ...company, email: e.target.value })} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium ml-1">Contact Phone</Label>
              <Input 
                className="h-10 text-[13px] bg-white border border-border/80 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all rounded-xl shadow-sm" 
                value={company.phone} 
                onChange={(e) => setCompany({ ...company, phone: e.target.value })} 
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[12px] font-medium ml-1">Headquarters Address</Label>
              <Input 
                className="h-10 text-[13px] bg-white border border-border/80 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all rounded-xl shadow-sm" 
                value={company.address} 
                onChange={(e) => setCompany({ ...company, address: e.target.value })} 
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={loading} size="sm" className="h-9 px-6 bg-gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-all rounded-xl font-medium">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Company Profile
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notifications */}
        <Card className="p-5 border border-border/60 bg-white rounded-2xl shadow-sm h-full">
          <SectionHeader icon={Bell} label="Notifications" />
          <div className="space-y-0 mt-2">
            {[
              { key: "email" as const, title: "Email alerts", desc: "Daily summary." },
              { key: "push" as const, title: "Push", desc: "Real-time alerts." },
              { key: "weekly" as const, title: "Weekly digest", desc: "Performance summary." },
            ].map(({ key, title, desc }, i, arr) => (
              <div key={key}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                  <Switch
                    checked={notif[key]}
                    onCheckedChange={(v) => setNotif({ ...notif, [key]: v })}
                    className="shrink-0"
                  />
                </div>
                {i < arr.length - 1 && <Separator className="bg-border/30" />}
              </div>
            ))}
          </div>
        </Card>

        {/* Security / Logout */}
        <Card className="p-5 border border-destructive/20 bg-white rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <SectionHeader icon={Lock} label="Security & Account" />
            <div className="mt-2 space-y-1.5">
              <div className="text-[13px] font-medium text-foreground">Active Session</div>
              <div className="text-[12px] text-muted-foreground">
                Logged in as <span className="font-semibold text-foreground">{session?.name}</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              size="sm"
              variant="destructive"
              className="w-full h-10 text-[13px] rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 transition-all"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
