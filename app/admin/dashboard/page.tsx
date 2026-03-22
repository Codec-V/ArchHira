"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Check,
  X,
  Trash2,
  UserPlus,
  Calendar,
  Eye,
} from "lucide-react";
import { RequestStatus, BookingType } from "@/types";
import { canApproveByDate, formatDate } from "@/lib/booking-logic";
import type { Booking } from "@/types";
import { useAutoLogout } from "@/app/hooks/useAutoLogout";
const slotLabels: Record<string, string> = {
  FIRST_HALF: "First Half",
  SECOND_HALF: "Second Half",
  FULL_DAY: "Full Day",
};

const statusLabels: Record<RequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const statusColors: Record<RequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

function filterByDate(
  bookings: Booking[],
  dateFrom: string,
  dateTo: string,
): Booking[] {
  if (!dateFrom && !dateTo) return bookings.filter((b) => b);
  return bookings.filter((b) => {
    if (!b) return false;
    const d = b.date || b.expectedArrival?.slice(0, 10) || "";
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
  const [loadingIds, setLoadingIds] = useState<{ [key: string]: boolean }>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [loading, setLoading] = useState(true); 
    useAutoLogout();
      // ✅ FIXED: Proper auth check
      useEffect(() => {
        const checkAuth = async () => {
          try {
            const res = await fetch("/api/auth/me", {
              credentials: "include", // Include cookies
            });
            
            if (res.ok) {
              setIsAuthenticated(true);
            } else {
              router.push("/");
            }
          } catch (error) {
            router.push("/");
          } finally {
            setLoading(false);
          }
        };
    
        checkAuth();
      }, [router]);
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

  // Categorize bookings by type and status - FIXED
  const categorized = useMemo(() => {
    const categories: Record<string, Record<RequestStatus, Booking[]>> = {};
    const validBookings = bookings.filter(
      (b) =>
        b &&
        b.status &&
        b.type &&
        Object.values(RequestStatus).includes(b.status),
    );
    validBookings.forEach((booking) => {
      if (!booking?.status || !booking?.type) return;

      const typeLabel =
        booking.type === BookingType.GUEST_HOUSE
          ? " Guest House"
          : booking.type === BookingType.HIRA_HALL
            ? " Hira Hall"
            : booking.type === BookingType.ARCHITECTURE_HALL
              ? " Architecture Hall"
              : "Unknown Type";

      if (!categories[typeLabel]) {
        categories[typeLabel] = {
          [RequestStatus.PENDING]: [],
          [RequestStatus.APPROVED]: [],
          [RequestStatus.REJECTED]: [],
        };
      }

      categories[typeLabel][booking.status].push(booking);
    });

    return categories;
  }, [bookings]);

  const filteredBookings = useMemo(
    () => filterByDate(bookings, dateFrom, dateTo),
    [bookings, dateFrom, dateTo],
  );

  const updateStatus = async (id: string, newStatus: RequestStatus) => {
    setLoadingIds((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reviewedBy: adminEmail || "admin",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(
          err?.error ||
            `Failed to update status to ${statusLabels[newStatus]}.`,
        );
        return false;
      }

      await fetchBookings();
      return true;
    } finally {
      setLoadingIds((prev) => {
        const newObj = { ...prev };
        delete newObj[id];
        return newObj;
      });
    }
  };

  const deleteBooking = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this booking? This action cannot be undone.",
      )
    )
      return;

    setLoadingIds((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "Failed to delete booking.");
        return;
      }
      await fetchBookings();
    } finally {
      setLoadingIds((prev) => {
        const newObj = { ...prev };
        delete newObj[id];
        return newObj;
      });
    }
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

  const renderTable = (
    list: Booking[],
    status: RequestStatus,
    statusLabel: string,
  ) =>
    list.length > 0 && (
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-6">
        <div className={`p-6 border-b ${statusColors[status]}`}>
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-current opacity-75" />
            {statusLabel} ({list.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-4 text-left text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-700">
                  Visitor
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-700">
                  Phone
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-700">
                  Rooms
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-700">
                  Purpose
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const isLoading = loadingIds[b.id];
                const canApproveDate = canApproveByDate(
                  b.date || b.expectedArrival?.slice(0, 10) || "",
                );

                return (
                  <tr
                    key={b.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">
                        {b.date
                          ? formatDate(b.date)
                          : b.expectedArrival?.slice(0, 10) || "N/A"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {b.visitorName || "N/A"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {b.visitorAddress?.slice(0, 30)}...
                      </div>
                    </td>
                    <td className="p-4">{b.requesterPhone || "N/A"}</td>
                    <td className="p-4">
                      <div>
                        {b.roomsRequested
                          ? `${b.roomsRequested} room(s)`
                          : "N/A"}
                        {b.category && (
                          <div className="text-xs bg-slate-100 px-2 py-1 rounded mt-1">
                            {b.category}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="truncate" title={b.purpose || ""}>
                        {b.purpose || "N/A"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {status === RequestStatus.PENDING && (
                          <>
                            <button
                              onClick={() =>
                                updateStatus(b.id, RequestStatus.APPROVED)
                              }
                              disabled={!canApproveDate || isLoading}
                              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
                              title={
                                !canApproveDate
                                  ? "Date must be 7+ days ahead"
                                  : ""
                              }
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(b.id, RequestStatus.REJECTED)
                              }
                              disabled={isLoading}
                              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                        {status !== RequestStatus.PENDING && (
                          <>
                            <button
                              onClick={() =>
                                updateStatus(b.id, RequestStatus.PENDING)
                              }
                              disabled={isLoading}
                              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                            >
                              Reset
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(
                                  b.id,
                                  status === RequestStatus.APPROVED
                                    ? RequestStatus.REJECTED
                                    : RequestStatus.APPROVED,
                                )
                              }
                              disabled={isLoading}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                                status === RequestStatus.APPROVED
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
                              }`}
                            >
                              {status === RequestStatus.APPROVED ? (
                                <X className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              {status === RequestStatus.APPROVED
                                ? "Reject"
                                : "Approve"}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteBooking(b.id)}
                          disabled={isLoading}
                          className="bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1"
                          title="Delete booking"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                        {/* ✅ FIXED EYE BUTTON - Creates proper dynamic route */}
                        <Link
                          href={`/admin/booking/${b.id}`}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-700 font-semibold hover:text-indigo-900"
          >
            <ArrowLeft className="w-5 h-5" /> Home
          </Link>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border shadow-lg">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-800 text-lg font-bold rounded-xl shadow-sm">
              {filteredBookings.length} Total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setAddAdminOpen(true)}
              className="inline-flex items-center gap-2 bg-white rounded-2xl border-2 border-indigo-500 px-6 py-3 text-indigo-700 font-semibold hover:bg-indigo-50 shadow-lg transition-all hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              Add Admin
            </button>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 bg-white rounded-2xl border-2 border-slate-300 px-6 py-3 text-slate-700 font-semibold hover:bg-slate-100 shadow-lg transition-all hover:scale-105"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </header>

      {/* Date Filter */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 mb-8 shadow-2xl">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-600" />
          Filter Bookings
        </h3>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-48 rounded-2xl border-2 border-slate-300 px-4 py-3 text-lg focus:ring-4 focus:ring-indigo-500 focus:border-transparent shadow-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-48 rounded-2xl border-2 border-slate-300 px-4 py-3 text-lg focus:ring-4 focus:ring-indigo-500 focus:border-transparent shadow-lg"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="text-indigo-600 hover:text-indigo-800 text-xl font-bold hover:underline px-6 py-3"
          >
            Clear All
          </button>
        </div>
      </section>

      {/* Booking Types - ROW LAYOUT */}
      {Object.entries(categorized).map(([typeLabel, statusGroups]) => {
        const totalCount = Object.values(statusGroups).reduce(
          (sum, group) => sum + group.length,
          0,
        );
        return (
          totalCount > 0 && (
            <section key={typeLabel} className="mb-12">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl mb-8">
                <h2 className="text-3xl font-black flex items-center gap-4">
                  {typeLabel}
                  <span className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-2xl text-xl font-bold">
                    {totalCount} bookings
                  </span>
                </h2>
              </div>

              {/* Status Sections - Only show if data exists */}
              {statusGroups[RequestStatus.PENDING]?.length > 0 &&
                renderTable(
                  statusGroups[RequestStatus.PENDING],
                  RequestStatus.PENDING,
                  statusLabels[RequestStatus.PENDING],
                )}
              {statusGroups[RequestStatus.APPROVED]?.length > 0 &&
                renderTable(
                  statusGroups[RequestStatus.APPROVED],
                  RequestStatus.APPROVED,
                  statusLabels[RequestStatus.APPROVED],
                )}
              {statusGroups[RequestStatus.REJECTED]?.length > 0 &&
                renderTable(
                  statusGroups[RequestStatus.REJECTED],
                  RequestStatus.REJECTED,
                  statusLabels[RequestStatus.REJECTED],
                )}
            </section>
          )
        );
      })}

      {/* Empty State */}
      {Object.values(categorized).every((statusGroups) =>
        Object.values(statusGroups).every((group) => group.length === 0),
      ) && (
        <div className="text-center py-24">
          <Calendar className="w-24 h-24 text-slate-400 mx-auto mb-8" />
          <h3 className="text-3xl font-bold text-slate-500 mb-4">
            No Bookings Found
          </h3>
          <p className="text-xl text-slate-400 mb-8">
            Try adjusting your date filter or create new bookings.
          </p>
        </div>
      )}

      {/* Add Admin Modal */}
      {addAdminOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-slate-900 mb-8 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Add New Admin
            </h3>
            <form onSubmit={handleAddAdmin} className="space-y-6">
              <div>
                <label className="block text-xl font-semibold text-slate-700 mb-3">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-300 px-6 py-4 text-lg focus:ring-4 focus:ring-indigo-500 focus:border-transparent shadow-lg"
                  placeholder="admin@university.edu"
                  required
                />
              </div>
              <div>
                <label className="block text-xl font-semibold text-slate-700 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-300 px-6 py-4 text-lg focus:ring-4 focus:ring-indigo-500 focus:border-transparent shadow-lg"
                  placeholder="Enter secure password"
                  minLength={6}
                  required
                />
              </div>
              {addAdminError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 p-6 rounded-2xl text-lg">
                  {addAdminError}
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
                >
                  Add Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddAdminOpen(false);
                    setAddAdminError(null);
                  }}
                  className="px-10 py-5 border-2 border-slate-300 rounded-2xl text-xl font-bold hover:bg-slate-50 shadow-lg transition-all hover:scale-105"
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
