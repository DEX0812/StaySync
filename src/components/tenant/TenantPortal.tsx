'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Home,
  Wrench,
  QrCode,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Phone,
  User,
  Clock,
  Sparkles,
  X,
  Send,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '@/lib/store';
import { Tenant, Room, Invoice, Ticket } from '@/lib/types';

interface TenantPortalProps {
  tenantId: string;
}

export const TenantPortal: React.FC<TenantPortalProps> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState<'dues' | 'room' | 'helpdesk'>('dues');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [roommates, setRoommates] = useState<Tenant[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');

  // Ticket Form State
  const [ticketCategory, setTicketCategory] = useState('Wi-Fi');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // KYC Upload State
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  const [kycUploadedSuccess, setKycUploadedSuccess] = useState(false);

  const reloadData = () => {
    const allTenants = store.getTenants();
    const currentTenant = allTenants.find((t) => t.id === tenantId) || allTenants[0];
    setTenant(currentTenant);

    if (currentTenant) {
      const allRooms = store.getRooms();
      const currentRoom = allRooms.find((r) => r.id === currentTenant.room_id) || null;
      setRoom(currentRoom);

      setRoommates(allTenants.filter((t) => t.room_id === currentTenant.room_id && t.id !== currentTenant.id));
      setInvoices(store.getInvoices().filter((inv) => inv.tenant_id === currentTenant.id));
      setTickets(store.getTickets().filter((t) => t.tenant_id === currentTenant.id));
    }
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = store.subscribe(reloadData);
    return () => {
      unsubscribe();
    };
  }, [tenantId]);

  if (!tenant) return null;

  const pendingInvoice = invoices.find((inv) => inv.status === 'pending' || inv.status === 'overdue');
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');

  // Handle Mock Payment Execution
  const handleExecutePayment = () => {
    if (!selectedInvoice) return;
    setIsPaymentProcessing(true);

    setTimeout(() => {
      store.markInvoicePaid(selectedInvoice.id);
      setIsPaymentProcessing(false);
      setPaymentSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log('Confetti triggered', err);
      }

      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedInvoice(null);
      }, 2200);
    }, 1000);
  };

  // Handle Submit Ticket
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) return;

    store.addTicket({
      tenant_id: tenant.id,
      category: ticketCategory,
      description: ticketDescription,
    });

    setTicketDescription('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  // Handle KYC Simulation
  const handleKycSimulatedUpload = () => {
    setIsUploadingKyc(true);
    setTimeout(() => {
      store.updateTenantKyc(tenant.id, `https://storage.staysync.io/kyc/${tenant.id}_aadhar.pdf`);
      setIsUploadingKyc(false);
      setKycUploadedSuccess(true);
      setTimeout(() => setKycUploadedSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 font-sans">
      {/* Welcome Resident Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-blue-500/10 transition-transform hover:scale-[1.01]">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center font-extrabold text-2xl shadow-inner">
            {tenant.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold leading-tight text-white">{tenant.name}</h2>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              Room {room?.room_number || '101'} • Bed B1
            </p>
          </div>
        </div>
        <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase border border-white/20">
          RESIDENT
        </span>
      </div>

      {/* Navigation Pills */}
      <div className="grid grid-cols-3 bg-slate-100 p-1.5 rounded-2xl text-xs font-extrabold border border-slate-200/60">
        <button
          onClick={() => setActiveTab('dues')}
          className={`py-3 rounded-xl transition-all ${
            activeTab === 'dues' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          INVOICE
        </button>

        <button
          onClick={() => setActiveTab('room')}
          className={`py-3 rounded-xl transition-all ${
            activeTab === 'room' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          MY ROOM
        </button>

        <button
          onClick={() => setActiveTab('helpdesk')}
          className={`py-3 rounded-xl transition-all ${
            activeTab === 'helpdesk' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          HELPDESK
        </button>
      </div>

      {/* TAB 1: Digital Boarding Pass / Punch-Card Receipt */}
      {activeTab === 'dues' && (
        <div className="space-y-5">
          {pendingInvoice ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">Current Billing Cycle</p>
                  <h2 className="text-2xl font-extrabold text-slate-900">September 2026</h2>
                </div>
                <span className="text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase">
                  DUE TOMORROW
                </span>
              </div>

              {/* Ledger Breakdown */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Room Base Rent</span>
                  <span className="font-bold text-slate-900">₹ {room?.base_rent.toLocaleString('en-IN') || '8,500'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Electricity Sub-Meter</span>
                  <span className="font-bold text-slate-900">₹ {(pendingInvoice.amount - (room?.base_rent || 7500)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Wi-Fi & Maintenance</span>
                  <span className="font-bold text-slate-900">₹ 0 (Free)</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-sans text-xl font-extrabold text-slate-900">
                  <span>Total Payable</span>
                  <span className="font-mono text-3xl text-blue-600">₹ {pendingInvoice.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Instant UPI Button */}
              <button
                onClick={() => setSelectedInvoice(pendingInvoice)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
              >
                <QrCode className="w-5 h-5" />
                PAY VIA UPI (INSTANT)
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-950">All Rent Settled!</h3>
              <p className="text-xs font-mono text-emerald-800">No active invoices pending for the current cycle.</p>
            </div>
          )}

          {/* Ticket Helpdesk Action Box */}
          <div
            onClick={() => setActiveTab('helpdesk')}
            className="bg-amber-500 text-slate-950 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-md shadow-amber-500/10"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-slate-950" />
              <div>
                <p className="text-base font-extrabold">Issue in Room?</p>
                <p className="text-xs text-slate-900 font-bold">Tap to raise maintenance ticket →</p>
              </div>
            </div>
          </div>

          {/* Past Receipts */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Settlement Receipts</h3>
            {paidInvoices.length > 0 ? (
              paidInvoices.map((inv) => (
                <div key={inv.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs font-mono">
                  <div>
                    <p className="font-bold text-slate-900">₹ {inv.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-500">Ref: {inv.payment_ref || 'UPI/Success'}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase text-[10px]">
                    PAID UP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-400 italic">No past settlement receipts.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: My Room & KYC */}
      {activeTab === 'room' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Room {room?.room_number || '101'} Specs</h3>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full uppercase">
                {room?.capacity || 2} Bed Sharing
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Base Rent</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">₹ {room?.base_rent || 7500}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Joined Date</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{tenant.move_in_date}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase text-slate-500 mb-2">Roommates</p>
              {roommates.length > 0 ? (
                roommates.map((rm) => (
                  <div key={rm.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-slate-900">{rm.name}</span>
                    </div>
                    <span className="font-mono text-slate-600 text-[11px]">{rm.phone}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-mono text-slate-400 italic">Single occupant in room.</p>
              )}
            </div>
          </div>

          {/* Digital KYC */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Aadhaar KYC Verification</h3>
              {tenant.kyc_url ? (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  VERIFIED
                </span>
              ) : (
                <span className="bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  REQUIRED
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600">Chandigarh Police PG regulation verification.</p>

            {kycUploadedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Document uploaded and verified.
              </div>
            )}

            <button
              onClick={handleKycSimulatedUpload}
              disabled={isUploadingKyc}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md shadow-blue-600/20"
            >
              <UploadCloud className="w-4 h-4" />
              {isUploadingKyc ? 'Uploading Document...' : tenant.kyc_url ? 'Re-upload Aadhaar' : 'Upload Aadhaar PDF'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Maintenance Helpdesk */}
      {activeTab === 'helpdesk' && (
        <div className="space-y-5">
          <form onSubmit={handleTicketSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Raise Maintenance Issue</h3>

            {ticketSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Ticket logged! Manager notified.
              </div>
            )}

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Wi-Fi">Wi-Fi & Network</option>
                  <option value="Plumbing">Plumbing & Leak</option>
                  <option value="Electrical">Electrical / AC</option>
                  <option value="Food">Mess Food Quality</option>
                  <option value="Other">Other Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the issue..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl font-sans focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md shadow-blue-600/20"
            >
              <Send className="w-4 h-4" /> Submit Ticket
            </button>
          </form>

          {/* Ticket History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-slate-500">Ticket History</h3>
            <div className="space-y-2.5">
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-extrabold uppercase text-blue-600">{t.category}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        t.status === 'open' ? 'bg-amber-100 text-amber-800' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 font-sans">{t.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs font-mono text-slate-400 italic">No maintenance tickets raised.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOCK UPI PAYMENT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 relative text-center border border-slate-200 shadow-2xl">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold"
            >
              <X className="w-6 h-6" />
            </button>

            {paymentSuccess ? (
              <div className="py-6 space-y-3 font-mono">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-sans">Payment Settled!</h3>
                <p className="text-xs font-bold text-emerald-600">
                  ₹ {selectedInvoice.amount.toLocaleString('en-IN')} paid via UPI
                </p>
                <p className="text-[11px] text-slate-500">Database & receipt updated.</p>
              </div>
            ) : (
              <>
                <div>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    StaySync Dynamic UPI
                  </span>
                  <h3 className="text-3xl font-extrabold font-mono text-slate-900 mt-2">
                    ₹ {selectedInvoice.amount.toLocaleString('en-IN')}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">Paying Sunrise Luxury PG</p>
                </div>

                {/* QR Code */}
                <div className="bg-slate-50 p-4 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center border border-slate-200">
                  <QrCode className="w-36 h-36 text-slate-900" />
                </div>

                {/* App Selector Pills */}
                <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono font-bold">
                  {(['gpay', 'phonepe', 'paytm', 'bhim'] as const).map((app) => (
                    <button
                      key={app}
                      onClick={() => setSelectedUpiApp(app)}
                      className={`py-2 rounded-xl border uppercase transition-all ${
                        selectedUpiApp === app
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExecutePayment}
                  disabled={isPaymentProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
                >
                  {isPaymentProcessing ? 'Authorizing UPI Payment...' : 'Simulate UPI Payment Success'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
