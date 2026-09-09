'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  DollarSign,
  Send,
  Bed,
  FileText,
  Check,
  X,
  Wrench,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { store } from '@/lib/store';
import { RoomWithTenants, Ticket, TicketStatus, Tenant, Invoice } from '@/lib/types';

export const OwnerDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<RoomWithTenants[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithTenants | null>(null);
  const [tenantFilter, setTenantFilter] = useState<'all' | 'defaulters' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState<TicketStatus | 'all'>('all');

  // Invoice generator modal state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedTenantForInvoice, setSelectedTenantForInvoice] = useState('');
  const [rentAmount, setRentAmount] = useState<number>(7500);
  const [electricityUnits, setElectricityUnits] = useState<number>(50);
  const [ratePerUnit, setRatePerUnit] = useState<number>(10);

  const reloadData = () => {
    setRooms(store.getRoomsWithTenants());
    setTickets(store.getTickets());
    setTenants(store.getTenants());
    setInvoices(store.getInvoices());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = store.subscribe(reloadData);
    return () => {
      unsubscribe();
    };
  }, []);

  // Compute Metrics
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupied_beds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalCollected = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalPending = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const activeTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  // Filter Tenants
  const filteredTenants = tenants.filter((tenant) => {
    const tenantInvoices = invoices.filter((i) => i.tenant_id === tenant.id);
    const isDefaulter = tenantInvoices.some((i) => i.status === 'pending' || i.status === 'overdue');
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (tenantFilter === 'defaulters') return isDefaulter;
    if (tenantFilter === 'paid') return !isDefaulter;
    return true;
  });

  // Filter Tickets
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true;
    return t.status === ticketFilter;
  });

  // Handle Invoice Submit
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForInvoice) return;

    const totalAmount = rentAmount + electricityUnits * ratePerUnit;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    store.generateInvoice(selectedTenantForInvoice, totalAmount, dueDate);
    setIsInvoiceModalOpen(false);
    setSelectedTenantForInvoice('');
  };

  return (
    <div className="space-y-8 pb-12 font-sans bg-slate-50 text-slate-900">
      {/* SECTION 1: Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* REALIZED REVENUE CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/10 relative overflow-hidden transition-all duration-200 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">REALIZED REVENUE</p>
              <div className="text-4xl font-extrabold font-mono tracking-tight mt-2 text-white">
                ₹ {totalCollected.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-blue-100 font-semibold mt-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-300" /> Settled this billing cycle
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/20">
              <DollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* PENDING DUES CARD */}
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">PENDING RENT DUES</p>
              <div className="text-4xl font-extrabold font-mono tracking-tight mt-2 text-slate-900">
                ₹ {totalPending.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-amber-700 font-bold mt-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Action required on defaulters
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* OCCUPANCY & TICKETS CARD */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">OCCUPANCY RATE</p>
              <div className="text-4xl font-extrabold font-mono tracking-tight mt-2 text-slate-900">
                {occupancyRate}% <span className="text-base font-bold font-sans text-slate-500">({occupiedBeds}/{totalBeds} Beds)</span>
              </div>
              <p className="text-xs text-indigo-600 font-bold mt-2 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-indigo-500" /> {activeTicketsCount} Active Maintenance Tickets
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Room Blueprint Matrix Grid */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">LIVE INVENTORY MAP</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Floor 1 Room Blueprint</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Physical bed availability across Sunrise Luxury PG</p>
          </div>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all duration-200 hover:scale-105 shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Issue Monthly Bill
          </button>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                <span className="text-lg font-extrabold text-slate-900">Room {room.room_number}</span>
                <span className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-3 py-1 rounded-full uppercase shadow-xs">
                  {room.capacity} Sharing • ₹{room.base_rent}/mo
                </span>
              </div>

              {/* Beds */}
              <div className="space-y-2.5">
                {Array.from({ length: room.capacity }).map((_, idx) => {
                  const bedLetter = String.fromCharCode(65 + idx);
                  const bedId = `${room.room_number}-${bedLetter}`;
                  const tenant = room.tenants[idx];

                  let status: 'paid' | 'pending' | 'overdue' | 'vacant' = 'vacant';
                  let tenantName = 'Vacant Bed Slot';

                  if (tenant) {
                    tenantName = tenant.name;
                    const hasUnpaid = tenant.invoices.some((i) => i.status === 'pending' || i.status === 'overdue');
                    const hasOverdue = tenant.invoices.some((i) => i.status === 'overdue');
                    status = hasOverdue ? 'overdue' : hasUnpaid ? 'pending' : 'paid';
                  }

                  return (
                    <div
                      key={bedId}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-3.5 rounded-xl border flex justify-between items-center transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                        status === 'paid'
                          ? 'bg-emerald-50/80 text-emerald-950 border-emerald-200/80 hover:bg-emerald-100/80'
                          : status === 'pending'
                          ? 'bg-amber-50/80 text-amber-950 border-amber-200/80 hover:bg-amber-100/80'
                          : status === 'overdue'
                          ? 'bg-rose-50/80 text-rose-950 border-rose-200/80 hover:bg-rose-100/80'
                          : 'bg-white text-slate-400 border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">{bedId}</span>
                      <span className="text-xs font-extrabold truncate max-w-[140px] font-sans">{tenantName}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          status === 'paid'
                            ? 'bg-emerald-600 text-white'
                            : status === 'pending'
                            ? 'bg-amber-500 text-slate-950'
                            : status === 'overdue'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Resident Ledger & WhatsApp Reminders */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">RENT ROLL DIRECTORY</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resident Ledger & WhatsApp Nudge</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search resident or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 text-slate-900 text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
              <button
                onClick={() => setTenantFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tenantFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ALL ({tenants.length})
              </button>
              <button
                onClick={() => setTenantFilter('defaulters')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tenantFilter === 'defaulters' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                DEFAULTERS
              </button>
              <button
                onClick={() => setTenantFilter('paid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tenantFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PAID UP
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Resident</th>
                <th className="p-3.5">Room</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Move-In</th>
                <th className="p-3.5">Dues Status</th>
                <th className="p-3.5">KYC Verification</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((t) => {
                  const room = rooms.find((r) => r.id === t.room_id);
                  const tenantInvoices = invoices.filter((inv) => inv.tenant_id === t.id);
                  const pendingInvoice = tenantInvoices.find((inv) => inv.status === 'pending' || inv.status === 'overdue');

                  const whatsappMsg = encodeURIComponent(
                    `Hi ${t.name}, payment reminder from Sunrise PG. Your rent of ₹${
                      pendingInvoice ? pendingInvoice.amount : 7500
                    } for Room ${room?.room_number || ''} is pending. Please pay via StaySync UPI app.`
                  );

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900">{t.name}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">Room {room?.room_number || 'N/A'}</td>
                      <td className="p-3.5 font-mono text-slate-500">{t.phone}</td>
                      <td className="p-3.5 font-mono text-slate-500">{t.move_in_date}</td>
                      <td className="p-3.5 font-mono">
                        {pendingInvoice ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-bold uppercase text-[10px]">
                            ₹{pendingInvoice.amount} ({pendingInvoice.status})
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase text-[10px]">
                            PAID UP
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {t.kyc_url ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase text-[10px]">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-bold uppercase text-[10px]">
                            MISSING ID
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {pendingInvoice ? (
                          <a
                            href={`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition-all hover:scale-105 shadow-xs"
                          >
                            <Send className="w-3 h-3" /> Nudge WhatsApp
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No Dues</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono text-xs italic">
                    No residents found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: Maintenance Helpdesk Desk */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">HELPDESK TRIAGE</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance Desk</h2>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
            <button
              onClick={() => setTicketFilter('all')}
              className={`px-3 py-1.5 rounded-lg ${ticketFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              ALL ({tickets.length})
            </button>
            <button
              onClick={() => setTicketFilter('open')}
              className={`px-3 py-1.5 rounded-lg ${ticketFilter === 'open' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'}`}
            >
              OPEN
            </button>
            <button
              onClick={() => setTicketFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg ${ticketFilter === 'in_progress' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              IN PROGRESS
            </button>
            <button
              onClick={() => setTicketFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg ${ticketFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              RESOLVED
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => {
              const tenant = tenants.find((item) => item.id === t.tenant_id);
              const room = rooms.find((r) => r.id === tenant?.room_id);

              return (
                <div key={t.id} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100/80 text-blue-800 text-xs font-extrabold px-3 py-0.5 rounded-full uppercase">
                        {t.category}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          t.status === 'open'
                            ? 'bg-amber-100 text-amber-800'
                            : t.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-base font-extrabold text-slate-900 mt-3">{t.description}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Resident: {tenant?.name || 'Unknown'} (Room {room?.room_number || 'N/A'})
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today'}
                    </span>

                    <div className="flex items-center gap-2">
                      {t.status !== 'in_progress' && t.status !== 'resolved' && (
                        <button
                          onClick={() => store.updateTicketStatus(t.id, 'in_progress')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all hover:scale-105 shadow-xs"
                        >
                          In Progress
                        </button>
                      )}
                      {t.status !== 'resolved' && (
                        <button
                          onClick={() => store.updateTicketStatus(t.id, 'resolved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all hover:scale-105 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-8 text-center text-slate-400 font-mono text-xs italic bg-slate-50 rounded-2xl border border-slate-200">
              No tickets recorded in this triage category.
            </div>
          )}
        </div>
      </div>

      {/* Invoice Generator Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateInvoice} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">Issue Monthly Rent Slip</h3>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Resident</label>
                <select
                  required
                  value={selectedTenantForInvoice}
                  onChange={(e) => {
                    setSelectedTenantForInvoice(e.target.value);
                    const tenant = tenants.find((t) => t.id === e.target.value);
                    const room = rooms.find((r) => r.id === tenant?.room_id);
                    if (room) setRentAmount(room.base_rent);
                  }}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="">-- Choose Resident --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Base Rent (₹)</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Electricity (Units)</label>
                  <input
                    type="number"
                    value={electricityUnits}
                    onChange={(e) => setElectricityUnits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rate per Unit (₹)</label>
                <input
                  type="number"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl font-bold"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Electricity ({electricityUnits}u):</span>
                  <span>₹ {electricityUnits * ratePerUnit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Rent:</span>
                  <span>₹ {rentAmount}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-200 font-sans">
                  <span>Total Payable:</span>
                  <span className="font-mono text-xl text-blue-600">₹ {rentAmount + electricityUnits * ratePerUnit}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 font-mono font-bold text-xs text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-105"
              >
                Confirm & Issue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Drawer Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-2xl font-extrabold text-slate-900">Room {selectedRoom.room_number} Overview</h3>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <p className="text-slate-600">Capacity: {selectedRoom.capacity} Beds | Rent: ₹{selectedRoom.base_rent}/mo</p>
              <div className="space-y-2.5">
                <span className="font-bold text-slate-900 uppercase">Assigned Residents:</span>
                {selectedRoom.tenants.length > 0 ? (
                  selectedRoom.tenants.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-extrabold text-slate-900 font-sans text-sm">{t.name}</p>
                        <p className="text-slate-500 text-[11px]">{t.phone} | Joined: {t.move_in_date}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        t.invoices.some(i => i.status !== 'paid') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.invoices.some(i => i.status !== 'paid') ? 'Dues Pending' : 'Paid Up'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">Room is currently vacant.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedRoom(null)}
                className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
