"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, Check, X, UserPlus } from "lucide-react";
import { RequestStatus, BookingType } from "@/types";
import { canApproveByDate } from "@/lib/booking-logic";
import type { Booking } from "@/types";

const slotLabels: Record<string, string> = {
  FIRST_HALF: "First Half",
  SECOND_HALF: "Second Half",
  FULL_DAY: "Full Day",
};

function filterByDate(bookings: Booking[], dateFrom: string, dateTo: string): Booking[] {
  if (!dateFrom && !dateTo) return bookings;
  return bookings.filter((b) => {
    const d = b.date;
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [addAdminError, setAddAdminError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    const res = await fetch("/api/bookings");
    if (res.ok) {
      const data = await res.json();
      setBookings(data);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("admin") !== "true") {
      router.replace("/admin");
      return;
    }
    setAdminEmail(sessionStorage.getItem("adminEmail"));
    setIsSuperAdmin(sessionStorage.getItem("adminIsSuperAdmin") === "true");
    fetchBookings();
  }, [fetchBookings, router]);

  const filtered = filterByDate(bookings, dateFrom, dateTo);
  const pending = filtered.filter((b) => b.status === RequestStatus.PENDING);
  const pendingHall = pending.filter((b) => b.type === BookingType.HIRA_HALL);
  const pendingGuest = pending.filter((b) => b.type === BookingType.GUEST_HOUSE);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: RequestStatus.APPROVED,
        reviewedBy: adminEmail || "admin",
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Failed to approve.");
      return;
    }
    fetchBookings();
  };

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: RequestStatus.REJECTED,
        reviewedBy: adminEmail || "admin",
      }),
    });
    if (!res.ok) {
      alert("Failed to reject.");
      return;
    }
    fetchBookings();
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError(null);
    const res = await fetch("/api/admin/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentAdminEmail: adminEmail,
        newEmail: newAdminEmail,
        newPassword: newAdminPassword,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAddAdminError(json?.error || "Failed to add admin.");
      return;
    }
    setAddAdminOpen(false);
    setNewAdminEmail("");
    setNewAdminPassword("");
  };

  const logout = () => {
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("adminEmail");
    sessionStorage.removeItem("adminIsSuperAdmin");
    router.replace("/admin");
  };

  const renderTable = (list: Booking[], title: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-600 text-sm">
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Slot</th>
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Designation</th>
            <th className="p-3 font-medium">Email</th>
            <th className="p-3 font-medium">Purpose</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-slate-500">
                No pending requests.
              </td>
            </tr>
          ) : (
            list.map((b) => {
              const canApprove = canApproveByDate(b.date);
              return (
                <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3">{b.date}</td>
                  <td className="p-3">{slotLabels[b.slot] ?? b.slot}</td>
                  <td className="p-3">{b.name}</td>
                  <td className="p-3">{b.designation}</td>
                  <td className="p-3 text-sm">{b.email}</td>
                  <td className="p-3 max-w-xs truncate" title={b.purpose}>
                    {b.purpose}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleApprove(b.id)}
                        disabled={!canApprove}
                        title={
                          canApprove
                            ? "Approve (date must be at least 7 days from today)"
                            : "Approval only for dates at least 7 days from today"
                        }
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm py-2 px-3"
                      >
                        <Check className="w-4 h-4 inline mr-1" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(b.id)}
                        className="btn-danger text-sm py-2 px-3"
                      >
                        <X className="w-4 h-4 inline mr-1" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="min-h-screen p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-royal font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-2xl font-bold text-royal">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setAddAdminOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-royal px-4 py-2 text-royal hover:bg-royal/5"
            >
              <UserPlus className="w-4 h-4" /> Add Admin
            </button>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Date filter */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 mb-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Filter by date</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="text-sm text-royal hover:underline"
          >
            Clear filter
          </button>
        </div>
      </section>

      {/* Hira Hall */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
        <h2 className="text-lg font-semibold text-royal p-4 border-b border-slate-200 bg-slate-50/50">
          Hira Hall – Pending ({pendingHall.length})
        </h2>
        {renderTable(pendingHall, "Hira Hall")}
      </section>

      {/* Guest House */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
        <h2 className="text-lg font-semibold text-royal p-4 border-b border-slate-200 bg-slate-50/50">
          Guest House – Pending ({pendingGuest.length})
        </h2>
        {renderTable(pendingGuest, "Guest House")}
      </section>

      {/* Add Admin modal */}
      {addAdminOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-royal mb-4">Add new admin</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="newadmin@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>
              {addAdminError && (
                <p className="text-sm text-soft-red">{addAdminError}</p>
              )}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Add Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setAddAdminOpen(false); setAddAdminError(null); }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
