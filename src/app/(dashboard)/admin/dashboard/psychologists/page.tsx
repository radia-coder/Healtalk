"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  FileText,
  ShieldOff,
  XCircle,
  RefreshCw,
  Plus,
  X,
  Check,
  UserPlus,
} from "lucide-react";

interface PsychologistRow {
  id: string;
  credentials: string;
  licenseNumber: string;
  experience: number;
  specializations: string[];
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
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "All", value: "ALL" },
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

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  bio: "",
  licenseNumber: "",
  experience: "",
  specializations: [] as string[],
  price60: "",
  price90: "",
  hospitalId: "",
  image: "",
  status: "PENDING" as "PENDING" | "APPROVED",
};

export default function PsychologistsManagementPage() {
  const [statusFilter, setStatusFilter] = useState("PENDING");
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const limit = 10;

  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

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
      const res = await fetch(`/api/admin/psychologists?${params.toString()}`);
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
      const res = await fetch("/api/admin/hospitals?limit=50&status=active");
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
      const res = await fetch(`/api/admin/psychologists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  const openModal = () => {
    setForm(emptyForm);
    setShowModal(true);
    setMessage(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleCreateDoctor = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage({ type: "error", text: "First and last name are required." });
      return;
    }
    if (!form.email.trim()) {
      setMessage({ type: "error", text: "Email is required." });
      return;
    }
    if (!form.password || form.password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (!form.licenseNumber.trim()) {
      setMessage({ type: "error", text: "License number is required." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/psychologists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          bio: form.bio.trim(),
          licenseNumber: form.licenseNumber.trim(),
          experience: Number(form.experience) || 0,
          specializations: form.specializations,
          price60: Math.round(Number(form.price60) * 100) || 0,
          price90: Math.round(Number(form.price90) * 100) || 0,
          hospitalId: form.hospitalId || null,
          image: form.image.trim() || null,
          status: form.status,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create doctor.");
      }

      setMessage({ type: "success", text: "Doctor account created successfully." });
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
                      {row.hospital && (
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                          {row.hospital.name}
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
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF2] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#EEF0FF] flex items-center justify-center">
                  <Plus size={18} className="text-[#5B6CFF]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Doctor</h2>
                  <p className="text-xs text-gray-400">Create a psychologist account directly</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
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
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
                    <Input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Smith"
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
                    placeholder="doctor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Photo URL</label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-gray-400 mt-1">Paste a direct image URL for the doctor&apos;s profile photo.</p>
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
                      placeholder="e.g. PSY-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio / Credentials</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Describe the doctor's background, credentials, and approach..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] resize-none"
                />
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
                      placeholder="e.g. 120"
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
                      placeholder="e.g. 160"
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Initial Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "PENDING" | "APPROVED" })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] bg-white"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved (Active)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6EAF2] sticky bottom-0 bg-white">
              <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
              <Button
                onClick={handleCreateDoctor}
                disabled={isSubmitting}
                className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2"
              >
                {isSubmitting ? "Creating..." : <><Check size={15} /> Create Doctor</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
