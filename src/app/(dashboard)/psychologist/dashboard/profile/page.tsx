"use client";

import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Bell, Clock, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/lib/uploadthing";

const formatPrice = (value?: number | null) =>
  value ? Math.round(value / 100).toString() : "";

export default function ProfilePage() {
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    licenseNumber: "",
    credentials: "",
    experience: "",
    bio: "",
    specializations: "",
    price60: "",
    price90: "",
    credentialDocumentUrl: "",
    credentialDocumentKey: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setMessage({
            type: "error",
            text: data?.error || "Failed to load profile details.",
          });
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setProfile({
          name: data.name || "",
          licenseNumber: data.psychologist?.licenseNumber || "",
          credentials: data.psychologist?.credentials || "",
          experience: data.psychologist?.experience?.toString() || "",
          bio: data.psychologist?.bio || "",
          specializations: Array.isArray(data.psychologist?.specializations)
            ? data.psychologist.specializations.join(", ")
            : "",
          price60: formatPrice(data.psychologist?.price60),
          price90: formatPrice(data.psychologist?.price90),
          credentialDocumentUrl: data.psychologist?.credentialDocumentUrl || "",
          credentialDocumentKey: data.psychologist?.credentialDocumentKey || "",
        });
      } catch {
        setMessage({ type: "error", text: "Failed to load profile details." });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isProfileSaving) return;

    setIsProfileSaving(true);
    setMessage(null);

    const payload: Record<string, unknown> = {
      name: profile.name.trim(),
      credentials: profile.credentials.trim(),
      licenseNumber: profile.licenseNumber.trim(),
      bio: profile.bio.trim(),
    };

    if (profile.experience) {
      payload.experience = Number(profile.experience);
    }

    if (profile.specializations) {
      payload.specializations = profile.specializations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (profile.price60) {
      payload.price60 = Math.round(Number(profile.price60) * 100);
    }

    if (profile.price90) {
      payload.price90 = Math.round(Number(profile.price90) * 100);
    }

    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage({
          type: "error",
          text: data?.error || "Failed to update profile.",
        });
        setIsProfileSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleViewCredential = async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/uploads/credential");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage({
          type: "error",
          text: data?.error || "Unable to access credential document.",
        });
        return;
      }
      const data = await res.json();
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        setMessage({
          type: "error",
          text: "Unable to access credential document.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Unable to access credential document.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Profile Settings
          </h1>
          <p className="text-text-secondary">
            Manage your professional profile and availability
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleProfileUpdate}>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="text-primary" size={20} />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Professional Information
                </h2>
              </div>

              {message && (
                <div
                  className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "border-green-100 bg-green-50 text-green-700"
                      : "border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    value={profile.name}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, name: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    License Number
                  </label>
                  <Input
                    value={profile.licenseNumber}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, licenseNumber: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Credentials
                  </label>
                  <Input
                    value={profile.credentials}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, credentials: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    value={profile.experience}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, experience: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    className="w-full min-h-24 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    value={profile.bio}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, bio: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Specializations (comma-separated)
                  </label>
                  <Input
                    value={profile.specializations}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, specializations: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                className="mt-4 bg-primary hover:bg-primary/90"
                type="submit"
                disabled={isProfileSaving || isLoading}
              >
                {isProfileSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-primary" size={20} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Pricing</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Session Price (60 min)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₺</span>
                    <Input
                      type="number"
                      value={profile.price60}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, price60: event.target.value }))
                      }
                      className="pl-8"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Extended Session (90 min)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₺</span>
                    <Input
                      type="number"
                      value={profile.price90}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, price90: event.target.value }))
                      }
                      className="pl-8"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Credential Documents
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Upload your license or certification (PDF, JPG, PNG).
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  {profile.credentialDocumentUrl
                    ? "Document uploaded."
                    : "No document uploaded yet."}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {profile.credentialDocumentUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10"
                      onClick={handleViewCredential}
                    >
                      View Document
                    </Button>
                  )}
                  <UploadButton
                    endpoint="credentialDocument"
                    appearance={{
                      button:
                        "h-10 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50",
                      allowedContent: "hidden",
                    }}
                    content={{
                      button: "Upload Document",
                    }}
                    onClientUploadComplete={(res) => {
                      const url = res?.[0]?.url;
                      const key = res?.[0]?.key;
                      if (!url) {
                        setMessage({
                          type: "error",
                          text: "Upload failed. Please try again.",
                        });
                        return;
                      }
                      setProfile((prev) => ({
                        ...prev,
                        credentialDocumentUrl: url,
                        credentialDocumentKey: key || prev.credentialDocumentKey,
                      }));
                      setMessage({
                        type: "success",
                        text: "Credential document uploaded successfully.",
                      });
                    }}
                    onUploadError={(error) => {
                      setMessage({
                        type: "error",
                        text: error.message || "Upload failed. Please try again.",
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="text-primary" size={20} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Availability</h2>
            </div>
            <p className="text-sm text-text-secondary">
              Availability management will be enabled once scheduling is fully connected.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bell className="text-primary" size={20} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
            </div>
            <p className="text-sm text-text-secondary">
              Notification preferences will sync once messaging is live.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
