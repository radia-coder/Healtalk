"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Shield, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import SupabaseLinkCard from "@/components/settings/SupabaseLinkCard";

const splitName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const lastName = parts.pop() || "";
  return { firstName: parts.join(" "), lastName };
};

const getInitials = (firstName: string, lastName: string) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();
  return initials ? initials.toUpperCase() : "AD";
};

export default function AdminSettingsPage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    image: "",
  });

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadProfile = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setMessage({
            type: "error",
            text: data?.error || "Failed to load admin profile details.",
          });
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        const { firstName, lastName } = splitName(data.name || "");
        setProfile({
          firstName,
          lastName,
          email: data.email || "",
          role: data.role || "",
          image: data.image || "",
        });
      } catch {
        setMessage({ type: "error", text: "Failed to load admin profile details." });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [status]);

  const handleSaveProfile = async () => {
    if (isSaving) return;

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    if (!fullName) {
      setMessage({ type: "error", text: "Name is required." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage({
          type: "error",
          text: data?.error || "Failed to update profile.",
        });
        setIsSaving(false);
        return;
      }

      const data = await res.json();
      const { firstName, lastName } = splitName(data.name || "");
      setProfile((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: data.email || prev.email,
        role: data.role || prev.role,
        image: data.image || prev.image,
      }));
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Settings</h1>
          <p className="text-gray-500">Manage platform administration preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
           {/* Sidebar Tabs */}
           <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
              <button 
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                  activeTab === "profile" ? "bg-white text-[#5B6CFF] shadow-sm border border-[#E6EAF2]" : "text-gray-500 hover:bg-white/50"
                )}
              >
                <User size={18} /> Profile Details
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                  activeTab === "notifications" ? "bg-white text-[#5B6CFF] shadow-sm border border-[#E6EAF2]" : "text-gray-500 hover:bg-white/50"
                )}
              >
                <Bell size={18} /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                  activeTab === "security" ? "bg-white text-[#5B6CFF] shadow-sm border border-[#E6EAF2]" : "text-gray-500 hover:bg-white/50"
                )}
              >
                <Shield size={18} /> Security & Auth
              </button>
           </div>

           {/* Content Area */}
           <div className="flex-1 w-full bg-white rounded-[16px] border border-[#E6EAF2] shadow-sm px-6 pt-1 pb-6 -mt-10 lg:mt-0">
              
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   
                   <AvatarUploader
                     imageUrl={profile.image}
                     fallback={getInitials(profile.firstName, profile.lastName)}
                     onUploaded={(url) => {
                       setProfile((prev) => ({ ...prev, image: url }));
                       setMessage({
                         type: "success",
                         text: "Profile photo updated successfully.",
                       });
                     }}
                     onError={(text) =>
                       setMessage({ type: "error", text })
                     }
                   />

                   {message && (
                     <div
                       className={`w-full p-4 rounded-xl text-center text-sm border ${
                         message.type === "success"
                           ? "bg-green-50 text-green-700 border-green-100"
                           : "bg-red-50 text-red-700 border-red-100"
                       }`}
                     >
                       {message.text}
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">First Name</label>
                         <Input
                           value={profile.firstName}
                           onChange={(event) =>
                             setProfile((prev) => ({ ...prev, firstName: event.target.value }))
                           }
                           disabled={isLoading}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Last Name</label>
                         <Input
                           value={profile.lastName}
                           onChange={(event) =>
                             setProfile((prev) => ({ ...prev, lastName: event.target.value }))
                           }
                           disabled={isLoading}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Email Address</label>
                         <Input value={profile.email} disabled className="bg-gray-50 text-gray-500" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Role</label>
                         <Input
                           value={profile.role || "ADMIN"}
                           disabled
                           className="bg-gray-50 text-gray-500"
                         />
                      </div>
                   </div>

                   <div className="pt-4 flex justify-end">
                      <Button
                        className="bg-[#5B6CFF] hover:bg-[#4a5ae0]"
                        onClick={handleSaveProfile}
                        disabled={isSaving || isLoading}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                   </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                   <div className="space-y-4 mt-8">
                      <div className="flex items-center justify-between p-4 border border-[#E6EAF2] rounded-xl">
                         <div>
                            <h4 className="font-medium text-gray-900">System Alerts</h4>
                            <p className="text-xs text-gray-500">Receive critical system health notifications.</p>
                         </div>
                         <div className="h-6 w-11 bg-[#5B6CFF] rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-[#E6EAF2] rounded-xl">
                         <div>
                            <h4 className="font-medium text-gray-900">New User Registrations</h4>
                            <p className="text-xs text-gray-500">Get notified when new psychologists sign up.</p>
                         </div>
                         <div className="h-6 w-11 bg-[#5B6CFF] rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-[#E6EAF2] rounded-xl">
                         <div>
                            <h4 className="font-medium text-gray-900">Report Summaries</h4>
                            <p className="text-xs text-gray-500">Weekly email summaries of platform stats.</p>
                         </div>
                         <div className="h-6 w-11 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                         </div>
                      </div>
                   </div>
                   
                   <div className="pt-4 flex justify-end">
                      <Button className="bg-[#5B6CFF] hover:bg-[#4a5ae0]">Save Preferences</Button>
                   </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                   <div className="space-y-4 mt-8">
                      <SupabaseLinkCard />
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Current Password</label>
                         <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">New Password</label>
                         <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                         <Input type="password" placeholder="••••••••" />
                      </div>
                   </div>
                   
                   <div className="pt-4 flex justify-end">
                      <Button className="bg-[#5B6CFF] hover:bg-[#4a5ae0] gap-2">
                        <Save size={16} /> Update Password
                      </Button>
                   </div>
                </div>
              )}

           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
