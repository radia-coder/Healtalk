"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building, Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface HospitalRow {
  id: string;
  name: string;
  location: string;
  address: string;
  status: string;
  createdAt: string;
  psychologistCount: number;
}

const statusTabs = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const emptyForm = { name: "", location: "", address: "", status: "active" };

export default function HospitalsManagementPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const limit = 10;

  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      status: statusFilter,
      search: search.trim(),
      page: String(page),
      limit: String(limit),
    });

    try {
      const res = await fetch(`/api/admin/hospitals?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to load hospitals.");
      }
      const payload = await res.json();
      setHospitals(payload.hospitals || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to load hospitals." });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadHospitals(), 250);
    return () => clearTimeout(timer);
  }, [loadHospitals]);

  const summary = useMemo(() => {
    if (hospitals.length === 0) return "No hospitals";
    return `${hospitals.length} hospital${hospitals.length === 1 ? "" : "s"}`;
  }, [hospitals.length]);

  const openCreate = () => {
    setEditingHospital(null);
    setForm(emptyForm);
    setShowModal(true);
    setMessage(null);
  };

  const openEdit = (hospital: HospitalRow) => {
    setEditingHospital(hospital);
    setForm({ name: hospital.name, location: hospital.location, address: hospital.address, status: hospital.status });
    setShowModal(true);
    setMessage(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHospital(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setMessage({ type: "error", text: "Hospital name is required." });
      return;
    }
    if (!form.location.trim()) {
      setMessage({ type: "error", text: "Location is required." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      let res: Response;
      if (editingHospital) {
        res = await fetch(`/api/admin/hospitals/${editingHospital.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/admin/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to save hospital.");
      }

      setMessage({ type: "success", text: editingHospital ? "Hospital updated." : "Hospital created." });
      closeModal();
      await loadHospitals();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to save." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (hospital: HospitalRow) => {
    if (!window.confirm(`Delete "${hospital.name}"? This cannot be undone.`)) return;
    setDeletingId(hospital.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/hospitals/${hospital.id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete.");
      }
      setMessage({ type: "success", text: "Hospital deleted." });
      await loadHospitals();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to delete." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Hospital Management</h1>
            <p className="text-gray-500">Manage partner hospitals and medical centers</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2 self-start sm:self-auto"
          >
            <Plus size={16} /> Add Hospital
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setPage(1); setStatusFilter(tab.value); }}
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
              placeholder="Search hospitals"
              value={search}
              onChange={(event) => { setPage(1); setSearch(event.target.value); }}
              className="w-full lg:w-[320px]"
            />
            <span className="text-sm text-gray-500">{summary}</span>
          </div>
        </div>

        {message && !showModal && (
          <div className={cn("w-full rounded-xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100"
          )}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            Loading hospitals...
          </div>
        ) : hospitals.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            <Building size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="mb-4">No hospitals found.</p>
            <Button onClick={openCreate} className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2">
              <Plus size={16} /> Add First Hospital
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white border border-[#E6EAF2] rounded-[20px] p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building size={18} className="text-[#5B6CFF]" />
                      <div className="text-lg font-semibold text-gray-900">{hospital.name}</div>
                    </div>
                    <div className="text-sm text-gray-500">{hospital.location}</div>
                    {hospital.address && (
                      <div className="text-xs text-gray-400 max-w-2xl">{hospital.address}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      Added {formatDate(hospital.createdAt)} · {hospital.psychologistCount} psychologist{hospital.psychologistCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", statusStyles[hospital.status] || "bg-gray-100 text-gray-700")}>
                      {hospital.status}
                    </span>
                    <button
                      onClick={() => openEdit(hospital)}
                      className="p-1.5 rounded-lg text-[#5B6CFF] hover:bg-[#EEF0FF] transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(hospital)}
                      disabled={deletingId === hospital.id}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF2]">
              <h2 className="text-xl font-bold text-gray-900">
                {editingHospital ? "Edit Hospital" : "Add Hospital"}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {message && (
                <div className={cn("rounded-xl border px-4 py-3 text-sm",
                  message.type === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                )}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hospital Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. City Medical Center" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City / Location *</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. New York, NY" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. 123 Main St, Suite 400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6EAF2]">
              <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2"
              >
                {isSubmitting ? "Saving..." : <><Check size={15} /> {editingHospital ? "Save Changes" : "Add Hospital"}</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
