import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Calendar, Phone, User, Building, Mail } from "lucide-react";
import { getBookingById } from "@/lib/store-server";
import { getServerSession } from "@/lib/auth-server"; // ✅ SERVER AUTH
import { RequestStatus, BookingType } from "@/types";
import { formatDate } from "@/lib/booking-logic";
import type { Booking } from "@/types";

export default async function BookingDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  // ✅ AWAIT params (Next.js 15 change)
  const { id } = await params;

  // ✅ SERVER-SIDE AUTH CHECK (NO "use client"!)
  // const session = await getServerSession();
  // console.log("Session:", session);
  // if (!session) {
  //   redirect("/"); // ✅ INSTANT redirect
  // }

  // ✅ SERVER-SIDE DATA FETCH
  const booking = await getBookingById(id);
  if (!booking) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/admin/dashboard"
          className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all text-indigo-700 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        {/* Main Booking Card - ALL SAME */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${
                  booking.status === "APPROVED" ? "bg-emerald-400" :
                  booking.status === "REJECTED" ? "bg-red-400" : "bg-amber-400"
                }`} />
                <div>
                  <h1 className="text-4xl font-black">Booking Details</h1>
                  <p className="text-indigo-100">ID: {booking.id.slice(-12)}</p>
                </div>
              </div>
              <span className={`px-6 py-3 rounded-2xl font-bold text-lg ${
                booking.status === "APPROVED" ? "bg-emerald-500/20 backdrop-blur-sm" :
                booking.status === "REJECTED" ? "bg-red-500/20 backdrop-blur-sm" : 
                "bg-amber-500/20 backdrop-blur-sm"
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Visitor Details */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <User className="w-8 h-8 text-indigo-600" />
                  Visitor Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <h3 className="font-semibold text-slate-700 mb-2">Name</h3>
                    <p className="text-2xl font-bold text-slate-900">{booking.visitorName || "N/A"}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <h3 className="font-semibold text-slate-700 mb-2">Booking Type</h3>
                    <p className="text-2xl font-bold text-indigo-700">{booking.type}</p>
                  </div>

                  {booking.roomsRequested && (
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <h3 className="font-semibold text-slate-700 mb-2">Rooms</h3>
                      <p className="text-2xl font-bold text-slate-900">{booking.roomsRequested} room(s)</p>
                    </div>
                  )}

                  {booking.date && (
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <h3 className="font-semibold text-slate-700 mb-2">Date</h3>
                      <p className="text-2xl font-bold text-slate-900">{formatDate(booking.date)}</p>
                    </div>
                  )}
                </div>

                {booking.visitorAddress && (
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-4 text-lg">Address</h3>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                      <p className="text-lg leading-relaxed">{booking.visitorAddress}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Requester & Timeline */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                    <Phone className="w-8 h-8 text-emerald-600" />
                    Requester Details
                  </h2>
                  
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-semibold text-emerald-800 uppercase tracking-wide mb-2">Phone</div>
                        <div className="text-xl font-bold text-slate-900">{booking.requesterPhone || "N/A"}</div>
                      </div>
                      
                      {booking.requesterDepartment && (
                        <div>
                          <div className="text-sm font-semibold text-emerald-800 uppercase tracking-wide mb-2">Department</div>
                          <div className="text-xl font-bold text-slate-900">{booking.requesterDepartment}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    Timeline
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border-l-4 border-indigo-400">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">Created</div>
                        <div className="text-lg text-slate-700">
                          {new Date(booking.createdAt).toLocaleString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {booking.reviewedBy && (
                      <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl border-l-4 border-emerald-400">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          booking.status === "APPROVED" ? "bg-emerald-500" :
                          booking.status === "REJECTED" ? "bg-red-500" : "bg-amber-500"
                        }`} />
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">
                            Reviewed by {booking.reviewedBy}
                          </div>
                          <div className="text-lg text-slate-700">
                            {new Date(booking.updatedAt || booking.createdAt).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                {booking.purpose && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-purple-400">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Purpose of Visit</h3>
                    <p className="text-lg text-slate-800 leading-relaxed">{booking.purpose}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
