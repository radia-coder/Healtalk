"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchCsrfToken } from "@/lib/client-security";
import {
  CheckCircle,
  FileText,
  ShieldOff,
  Trash2,
  XCircle,
  RefreshCw,
  Plus,
  X,
  Check,
  UserPlus,
  Pencil,
} from "lucide-react";

interface PsychologistRow {
  id: string;
  credentials: string;
  bio: string;
  licenseNumber: string;
  experience: number;
  location: string | null;
  languages: string[];
  education: unknown;
  certifications: unknown;
  rating: number;
  reviewCount: number;
  specializations: string[];
  price60: number;
  price90: number;
  hospitalId: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  hasCredentialDocument: boolean;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  hospital: {
    name: string;
    location: string;
  } | null;
}

interface HospitalOption {
  id: string;
  name: string;
  location: string;
}

type ProfileEducationEntry = {
  degree: string;
  institution: string;
  year?: string;
};

type ProfileCertificationEntry = {
  name: string;
  issuer: string;
  year?: string;
};

type AdminTestimonial = {
  id: string;
  name: string;
  role: string | null;
  text: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

const SPECIALIZATIONS = [
  "Anxiety",
  "Depression",
  "Trauma & PTSD",
  "Addiction",
  "Grief & Loss",
  "Relationship Issues",
  "Family Therapy",
  "Child & Adolescent",
  "OCD",
  "Eating Disorders",
  "Stress Management",
  "Sleep Disorders",
  "ADHD",
  "Bipolar Disorder",
  "Schizophrenia",
  "Couples Therapy",
  "Career Counseling",
  "Life Transitions",
];

const statusTabs = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-gray-100 text-gray-700",
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const normalizeEducationEntries = (value: unknown): ProfileEducationEntry[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      const record = asRecord(entry);
      if (!record) return null;
      const degree = typeof record.degree === "string" ? record.degree.trim() : "";
      const institution =
        typeof record.institution === "string" ? record.institution.trim() : "";
      const yearRaw = record.year;
      const year =
        typeof yearRaw === "string"
          ? yearRaw.trim()
          : typeof yearRaw === "number"
          ? String(yearRaw)
          : "";
      if (!degree || !institution) return null;
      return year ? { degree, institution, year } : { degree, institution };
    })
    .filter((entry): entry is ProfileEducationEntry => Boolean(entry));
};

const normalizeCertificationEntries = (
  value: unknown
): ProfileCertificationEntry[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      const record = asRecord(entry);
      if (!record) return null;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const issuer = typeof record.issuer === "string" ? record.issuer.trim() : "";
      const yearRaw = record.year;
      const year =
        typeof yearRaw === "string"
          ? yearRaw.trim()
          : typeof yearRaw === "number"
          ? String(yearRaw)
          : "";
      if (!name || !issuer) return null;
      return year ? { name, issuer, year } : { name, issuer };
    })
    .filter((entry): entry is ProfileCertificationEntry => Boolean(entry));
};

const formatEducationLines = (entries: ProfileEducationEntry[]) =>
  entries
    .map((entry) =>
      [entry.degree, entry.institution, entry.year || ""].filter(Boolean).join(" | ")
    )
    .join("\n");

const formatCertificationLines = (entries: ProfileCertificationEntry[]) =>
  entries
    .map((entry) =>
      [entry.name, entry.issuer, entry.year || ""].filter(Boolean).join(" | ")
    )
    .join("\n");

const parseCommaList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseEducationLines = (rawValue: string): ProfileEducationEntry[] => {
  const lines = rawValue
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: ProfileEducationEntry[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const [degree, institution, year] = line.split("|").map((part) => part.trim());
    if (!degree || !institution) {
      throw new Error(
        `Education line ${index + 1} must be: Degree | Institution | Year(optional).`
      );
    }
    parsed.push(year ? { degree, institution, year } : { degree, institution });
  }

  return parsed;
};

const parseCertificationLines = (rawValue: string): ProfileCertificationEntry[] => {
  const lines = rawValue
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: ProfileCertificationEntry[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const [name, issuer, year] = line.split("|").map((part) => part.trim());
    if (!name || !issuer) {
      throw new Error(
        `Certification line ${index + 1} must be: Name | Issuer | Year(optional).`
      );
    }
    parsed.push(year ? { name, issuer, year } : { name, issuer });
  }

  return parsed;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  bio: "",
  licenseNumber: "",
  experience: "",
  location: "",
  languages: "",
  education: "",
  certifications: "",
  specializations: [] as string[],
  price60: "",
  price90: "",
  hospitalId: "",
  image: "",
  status: "PENDING" as PsychologistRow["status"],
  rejectionReason: "",
};

export default function PsychologistsManagementPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<PsychologistRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingPsychologistId, setEditingPsychologistId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(false);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "Patient",
    text: "",
    image: "",
  });
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const limit = 10;
  const modalInputClass =
    "h-10 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:border-[#5B6CFF] focus-visible:ring-[#5B6CFF]/20";

  const canGoBack = page > 1;
  const canGoForward = page < totalPages;
  const hasHospitalSelection = Boolean(form.hospitalId);

  const loadPsychologists = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      status: statusFilter,
      search: search.trim(),
      page: String(page),
      limit: String(limit),
    });

    try {
      const res = await fetch(`/api/admin/psychologists?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load psychologists.");
      }
      const data = await res.json();
      setRows(data.psychologists || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load psychologists.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPsychologists();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadPsychologists]);

  // Load hospitals for the dropdown
  const loadHospitals = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hospitals?limit=50&status=active", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setHospitals(data.hospitals || []);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  const handleStatusUpdate = async (id: string, status: PsychologistRow["status"]) => {
    const confirmText = `Change status to ${status}?`;
    if (!window.confirm(confirmText)) return;

    let rejectionReason = "";
    if (status === "REJECTED") {
      rejectionReason = window.prompt("Rejection reason (optional):") || "";
    }

    setIsUpdatingId(id);
    setMessage(null);

    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        throw new Error("Security token missing. Please refresh and try again.");
      }

      const res = await fetch(`/api/admin/psychologists/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ status, rejectionReason }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update status.");
      }

      await loadPsychologists();
      setMessage({ type: "success", text: "Status updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update status.",
      });
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleViewCredential = async (id: string) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/uploads/credential?psychologistId=${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to fetch credential document.");
      }
      const data = await res.json();
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to fetch credential document.",
      });
    }
  };

  const toggleSpecialization = (spec: string) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const loadTestimonials = useCallback(async (psychologistId: string) => {
    setIsTestimonialsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/psychologists/${psychologistId}/testimonials`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load testimonials.");
      }
      const data = (await res.json()) as {
        testimonials?: AdminTestimonial[];
      };
      setTestimonials(data.testimonials || []);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load testimonials.",
      });
      setTestimonials([]);
    } finally {
      setIsTestimonialsLoading(false);
    }
  }, []);

  const openModal = () => {
    setEditingPsychologistId(null);
    setForm(emptyForm);
    setTestimonials([]);
    setTestimonialForm({ name: "", role: "Patient", text: "", image: "" });
    setShowModal(true);
    setMessage(null);
  };

  const openEditModal = (row: PsychologistRow) => {
    const fullName = (row.user?.name || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName =
      nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Doctor";

    setEditingPsychologistId(row.id);
    setForm({
      firstName,
      lastName,
      email: row.user?.email || "",
      password: "",
      bio: row.bio || row.credentials || "",
      licenseNumber: row.licenseNumber || "",
      experience: String(row.experience || 0),
      location: row.location || row.hospital?.location || "",
      languages: (row.languages || []).join(", "),
      education: formatEducationLines(normalizeEducationEntries(row.education)),
      certifications: formatCertificationLines(
        normalizeCertificationEntries(row.certifications)
      ),
      specializations: row.specializations || [],
      price60: ((row.price60 || 0) / 100).toFixed(2),
      price90: ((row.price90 || 0) / 100).toFixed(2),
      hospitalId: row.hospitalId || "",
      image: row.user?.image || "",
      status: row.status,
      rejectionReason: row.rejectionReason || "",
    });
    setShowModal(true);
    setMessage(null);
    setTestimonials([]);
    setTestimonialForm({ name: "", role: "Patient", text: "", image: "" });
    void loadTestimonials(row.id);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPsychologistId(null);
    setForm(emptyForm);
    setTestimonials([]);
    setTestimonialForm({ name: "", role: "Patient", text: "", image: "" });
    setDeletingTestimonialId(null);
    setIsPhotoUploading(false);
  };

  const handleAddTestimonial = async () => {
    if (!editingPsychologistId) return;
    if (!testimonialForm.name.trim() || !testimonialForm.text.trim()) {
      setMessage({
        type: "error",
        text: "Testimonial name and text are required.",
      });
      return;
    }

    setIsAddingTestimonial(true);
    setMessage(null);
    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        throw new Error("Security token missing. Please refresh and try again.");
      }

      const res = await fetch(
        `/api/admin/psychologists/${editingPsychologistId}/testimonials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({
            name: testimonialForm.name.trim(),
            role: testimonialForm.role.trim() || "Patient",
            text: testimonialForm.text.trim(),
            image: testimonialForm.image.trim() || undefined,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to add testimonial.");
      }

      const data = (await res.json()) as { testimonial?: AdminTestimonial };
      if (data.testimonial) {
        setTestimonials((prev) => [data.testimonial as AdminTestimonial, ...prev]);
      }
      setTestimonialForm({ name: "", role: "Patient", text: "", image: "" });
      setMessage({ type: "success", text: "Testimonial added." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to add testimonial.",
      });
    } finally {
      setIsAddingTestimonial(false);
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!editingPsychologistId) return;
    if (!window.confirm("Delete this testimonial?")) return;

    setDeletingTestimonialId(testimonialId);
    setMessage(null);
    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        throw new Error("Security token missing. Please refresh and try again.");
      }

      const res = await fetch(
        `/api/admin/psychologists/${editingPsychologistId}/testimonials/${testimonialId}`,
        {
          method: "DELETE",
          headers: { "x-csrf-token": csrfToken },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete testimonial.");
      }

      setTestimonials((prev) => prev.filter((item) => item.id !== testimonialId));
      setMessage({ type: "success", text: "Testimonial deleted." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete testimonial.",
      });
    } finally {
      setDeletingTestimonialId(null);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file." });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image is too large. Max size is 4MB." });
      return;
    }

    setIsPhotoUploading(true);
    setMessage(null);

    try {
      const body = new FormData();
      body.append("file", file);

      let res: Response;
      try {
        res = await fetch("/api/admin/uploads/psychologist-photo", {
          method: "POST",
          credentials: "include",
          body,
        });
      } catch {
        throw new Error(
          "Network error while uploading. Please refresh and try again."
        );
      }

      const raw = await res.text();
      const data = (() => {
        try {
          return JSON.parse(raw) as
            | { provider?: string; url?: string; error?: string; details?: string[] }
            | null;
        } catch {
          return null;
        }
      })();
      if (!res.ok || !data?.url) {
        const details = data?.details?.join(" | ");
        throw new Error(
          details || data?.error || `Photo upload failed (HTTP ${res.status}).`
        );
      }

      setForm((prev) => ({ ...prev, image: data.url || "" }));
      const providerName =
        data.provider === "uploadthing"
          ? "UploadThing"
          : data.provider === "supabase"
          ? "Supabase"
          : data.provider === "inline"
          ? "Inline fallback"
          : "storage";
      setMessage({
        type: "success",
        text: `Photo uploaded successfully via ${providerName}.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Photo upload failed. Please try again.",
      });
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleSaveDoctor = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage({ type: "error", text: "First and last name are required." });
      return;
    }
    if (!form.email.trim()) {
      setMessage({ type: "error", text: "Email is required." });
      return;
    }
    if (!editingPsychologistId && (!form.password || form.password.length < 8)) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (editingPsychologistId && form.password.trim().length > 0 && form.password.trim().length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (!form.licenseNumber.trim()) {
      setMessage({ type: "error", text: "License number is required." });
      return;
    }

    let educationEntries: ProfileEducationEntry[] = [];
    let certificationEntries: ProfileCertificationEntry[] = [];
    try {
      educationEntries = parseEducationLines(form.education);
      certificationEntries = parseCertificationLines(form.certifications);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Please check education/certification format.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const nextPassword = form.password.trim();
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: nextPassword || undefined,
        bio: form.bio.trim(),
        licenseNumber: form.licenseNumber.trim(),
        experience: Number(form.experience) || 0,
        location: form.location.trim() || null,
        languages: parseCommaList(form.languages),
        education: educationEntries,
        certifications: certificationEntries,
        specializations: form.specializations,
        price60: Math.round(Number(form.price60) * 100) || 0,
        price90: Math.round(Number(form.price90) * 100) || 0,
        hospitalId: form.hospitalId || null,
        image: form.image.trim() || null,
        status: form.status,
        rejectionReason: form.rejectionReason?.trim() || undefined,
      };

      const isEditing = Boolean(editingPsychologistId);
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        throw new Error("Security token missing. Please refresh and try again.");
      }

      const res = await fetch(
        isEditing
          ? `/api/admin/psychologists/${editingPsychologistId}`
          : "/api/admin/psychologists",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ||
            (isEditing ? "Failed to update doctor." : "Failed to create doctor.")
        );
      }

      setMessage({
        type: "success",
        text: isEditing
          ? "Doctor profile updated successfully."
          : "Doctor account created successfully.",
      });
      closeModal();
      await loadPsychologists();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create doctor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusSummary = useMemo(() => {
    if (total === 0) return "No records";
    return `${total} psychologist${total === 1 ? "" : "s"}`;
  }, [total]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Psychologist Management
            </h1>
            <p className="text-gray-500">
              Review credentials, approve applicants, and manage status updates.
            </p>
          </div>
          <Button
            onClick={openModal}
            className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2 self-start sm:self-auto"
          >
            <UserPlus size={16} /> Add Doctor
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(tab.value);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                  statusFilter === tab.value
                    ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                    : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by name, email, or license"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              className="w-full lg:w-[320px]"
            />
            <span className="text-sm text-gray-500">{statusSummary}</span>
          </div>
        </div>

        {message && !showModal && (
          <div
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm",
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            )}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
              Loading psychologists...
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
              No psychologists found for this filter.
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="bg-white border border-[#E6EAF2] rounded-[20px] p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {row.user?.image ? (
                        <Image
                          src={row.user.image}
                          alt=""
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#EEF0FF] flex items-center justify-center text-[#5B6CFF] font-bold text-sm">
                          {(row.user?.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {row.user?.name || "Unnamed Psychologist"}
                        </div>
                        <div className="text-sm text-gray-500">{row.user?.email}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        License: {row.licenseNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {row.experience} yrs experience
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {row.reviewCount > 0
                          ? `Rating ${row.rating.toFixed(1)} (${row.reviewCount})`
                          : "No reviews yet"}
                      </span>
                      {(row.location || row.hospital) && (
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                          {row.hospital
                            ? `${row.hospital.name} • ${row.hospital.location}`
                            : row.location}
                        </span>
                      )}
                    </div>

                    {row.credentials && (
                      <p className="text-sm text-gray-600 max-w-2xl line-clamp-2">
                        {row.credentials}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {row.specializations.slice(0, 5).map((spec) => (
                        <span
                          key={spec}
                          className="px-2.5 py-1 rounded-full bg-[#EEF0FF] text-[#5B6CFF] text-xs font-semibold"
                        >
                          {spec}
                        </span>
                      ))}
                      {row.specializations.length > 5 && (
                        <span className="text-xs text-gray-400">
                          +{row.specializations.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full lg:w-[240px]">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          statusStyles[row.status]
                        )}
                      >
                        {row.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Joined {formatDate(row.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Approved: {formatDate(row.approvedAt)}
                      <br />
                      Rejected: {formatDate(row.rejectedAt)}
                      {row.rejectionReason && (
                        <div className="mt-2 text-[11px] text-red-500">
                          Reason: {row.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => openEditModal(row)}
                      >
                        <Pencil size={14} /> Edit
                      </Button>

                      {row.hasCredentialDocument ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleViewCredential(row.id)}
                        >
                          <FileText size={14} /> View Document
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">No credential file</span>
                      )}

                      {row.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            disabled={isUpdatingId === row.id}
                            onClick={() => handleStatusUpdate(row.id, "APPROVED")}
                          >
                            <CheckCircle size={14} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 gap-2"
                            disabled={isUpdatingId === row.id}
                            onClick={() => handleStatusUpdate(row.id, "REJECTED")}
                          >
                            <XCircle size={14} /> Reject
                          </Button>
                        </>
                      )}

                      {row.status === "APPROVED" && (
                        <Button
                          size="sm"
                          className="bg-gray-700 hover:bg-gray-800 gap-2"
                          disabled={isUpdatingId === row.id}
                          onClick={() => handleStatusUpdate(row.id, "SUSPENDED")}
                        >
                          <ShieldOff size={14} /> Suspend
                        </Button>
                      )}

                      {row.status === "SUSPENDED" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            disabled={isUpdatingId === row.id}
                            onClick={() => handleStatusUpdate(row.id, "APPROVED")}
                          >
                            <RefreshCw size={14} /> Reinstate
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 gap-2"
                            disabled={isUpdatingId === row.id}
                            onClick={() => handleStatusUpdate(row.id, "REJECTED")}
                          >
                            <XCircle size={14} /> Reject
                          </Button>
                        </>
                      )}

                      {row.status === "REJECTED" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-2"
                          disabled={isUpdatingId === row.id}
                          onClick={() => handleStatusUpdate(row.id, "APPROVED")}
                        >
                          <CheckCircle size={14} /> Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!canGoBack}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!canGoForward}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF2] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#EEF0FF] flex items-center justify-center">
                  <Plus size={18} className="text-[#5B6CFF]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingPsychologistId ? "Edit Doctor" : "Add New Doctor"}
                  </h2>
                  <p className="text-xs text-gray-400">Profile details</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <input
                type="text"
                name="fake-username"
                autoComplete="username"
                tabIndex={-1}
                aria-hidden="true"
                className="absolute -left-[9999px] top-auto h-0 w-0 opacity-0 pointer-events-none"
              />
              <input
                type="password"
                name="fake-password"
                autoComplete="current-password"
                tabIndex={-1}
                aria-hidden="true"
                className="absolute -left-[9999px] top-auto h-0 w-0 opacity-0 pointer-events-none"
              />
              {message && (
                <div className={cn("rounded-xl border px-4 py-3 text-sm",
                  message.type === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                )}>
                  {message.text}
                </div>
              )}

              {/* Basic info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
                    <Input
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      autoComplete="off"
                      name="doctor-first-name"
                      placeholder="Musab"
                      className={modalInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
                    <Input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      autoComplete="off"
                      name="doctor-last-name"
                      placeholder="Mohamed"
                      className={modalInputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="off"
                    name="doctor-email"
                    placeholder="musab.ali@example.com"
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password {editingPsychologistId ? "(optional)" : "*"}
                  </label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="new-password"
                    name="doctor-password-new"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder={
                      editingPsychologistId
                        ? "Leave blank to keep current password"
                        : "Create password (min 8 chars)"
                    }
                    className={modalInputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Doctor photo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No photo</span>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handlePhotoUpload(file);
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isPhotoUploading}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {isPhotoUploading ? "Uploading..." : "Upload From Computer"}
                  </Button>
                </div>
                <div className="mt-3">
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    autoComplete="off"
                    name="doctor-image-url"
                    placeholder="Paste image URL (optional)"
                    className={modalInputClass}
                  />
                </div>
              </div>

              {/* Professional info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Professional Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">License Number *</label>
                    <Input
                      value={form.licenseNumber}
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                      autoComplete="off"
                      name="doctor-license-number"
                      placeholder="PSY-12345"
                      className={modalInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Mogadishu, Somalia or Online"
                      className={modalInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Languages</label>
                    <Input
                      value={form.languages}
                      onChange={(e) => setForm({ ...form, languages: e.target.value })}
                      placeholder="English, Somali, Arabic"
                      className={modalInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      placeholder="8"
                      className={modalInputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio / Credentials</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Short bio and treatment approach."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Education
                  </label>
                  <textarea
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder={"Degree | Institution | Year\nMSc Clinical Psychology | SIMAD University | 2018"}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Certifications
                  </label>
                  <textarea
                    value={form.certifications}
                    onChange={(e) =>
                      setForm({ ...form, certifications: e.target.value })
                    }
                    placeholder={"Name | Issuer | Year\nCBT Practitioner | APA | 2021"}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] resize-y"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Session Pricing (USD)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">60-min Session ($)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price60}
                      onChange={(e) => setForm({ ...form, price60: e.target.value })}
                      placeholder="120"
                      className={modalInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">90-min Session ($)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price90}
                      onChange={(e) => setForm({ ...form, price90: e.target.value })}
                      placeholder="160"
                      className={modalInputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Specializations / Filters */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Specializations <span className="text-gray-300 normal-case font-normal">(used as filters on Find Psychologist page)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                        form.specializations.includes(spec)
                          ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                          : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                      )}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
                {form.specializations.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {form.specializations.length} specialization{form.specializations.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* Hospital & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hospital (optional)</label>
                  <select
                    value={form.hospitalId}
                    onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] bg-white"
                  >
                    <option value="">No hospital</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>{h.name} — {h.location}</option>
                    ))}
                  </select>
                  {hasHospitalSelection && (
                    <p className="mt-1 text-xs text-gray-400">
                      Hospital location will be used if custom location is empty.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Initial Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as PsychologistRow["status"],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] bg-white"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved (Active)</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {form.status === "REJECTED" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Rejection Reason (optional)
                  </label>
                  <Input
                    value={form.rejectionReason}
                    onChange={(e) =>
                      setForm({ ...form, rejectionReason: e.target.value })
                    }
                    placeholder="Optional reason"
                    className={modalInputClass}
                  />
                </div>
              )}

              {editingPsychologistId && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Testimonials
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Add manual testimonials for this doctor profile.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={testimonialForm.name}
                      onChange={(e) =>
                        setTestimonialForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Name"
                      className={modalInputClass}
                    />
                    <Input
                      value={testimonialForm.role}
                      onChange={(e) =>
                        setTestimonialForm((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      placeholder="Role (e.g. Patient)"
                      className={modalInputClass}
                    />
                  </div>
                  <Input
                    value={testimonialForm.image}
                    onChange={(e) =>
                      setTestimonialForm((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    placeholder="Photo URL (optional)"
                    className={modalInputClass}
                  />
                  <textarea
                    value={testimonialForm.text}
                    onChange={(e) =>
                      setTestimonialForm((prev) => ({
                        ...prev,
                        text: e.target.value,
                      }))
                    }
                    placeholder="Testimonial text"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] resize-y"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTestimonial}
                      disabled={isAddingTestimonial}
                    >
                      {isAddingTestimonial ? "Adding..." : "Add Testimonial"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {isTestimonialsLoading ? (
                      <p className="text-sm text-gray-500">Loading testimonials...</p>
                    ) : testimonials.length === 0 ? (
                      <p className="text-sm text-gray-500">No testimonials yet.</p>
                    ) : (
                      testimonials.map((testimonial) => (
                        <div
                          key={testimonial.id}
                          className="rounded-lg border border-gray-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {testimonial.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {testimonial.role || "Patient"} •{" "}
                                {formatDate(testimonial.createdAt)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                              disabled={deletingTestimonialId === testimonial.id}
                              title="Delete testimonial"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{testimonial.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6EAF2] sticky bottom-0 bg-white">
              <Button
                onClick={handleSaveDoctor}
                disabled={isSubmitting || isPhotoUploading}
                className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2"
              >
                {isSubmitting
                  ? editingPsychologistId
                    ? "Saving..."
                    : "Creating..."
                  : isPhotoUploading
                  ? "Uploading photo..."
                  : editingPsychologistId
                  ? <><Check size={15} /> Save Changes</>
                  : <><Check size={15} /> Create Doctor</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
