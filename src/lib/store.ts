'use client';

import { Property, Room, Tenant, Invoice, Ticket, RoomWithTenants, TicketStatus, InvoiceStatus } from './types';
import { INITIAL_PROPERTY, INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_INVOICES, INITIAL_TICKETS } from './seed';

const STORAGE_KEYS = {
  PROPERTY: 'staysync_property',
  ROOMS: 'staysync_rooms',
  TENANTS: 'staysync_tenants',
  INVOICES: 'staysync_invoices',
  TICKETS: 'staysync_tickets',
};

class DataStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initStorage();
    }
  }

  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.PROPERTY)) {
      localStorage.setItem(STORAGE_KEYS.PROPERTY, JSON.stringify(INITIAL_PROPERTY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getProperty(): Property {
    if (typeof window === 'undefined') return INITIAL_PROPERTY;
    const data = localStorage.getItem(STORAGE_KEYS.PROPERTY);
    return data ? JSON.parse(data) : INITIAL_PROPERTY;
  }

  getRooms(): Room[] {
    if (typeof window === 'undefined') return INITIAL_ROOMS;
    const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return data ? JSON.parse(data) : INITIAL_ROOMS;
  }

  getTenants(): Tenant[] {
    if (typeof window === 'undefined') return INITIAL_TENANTS;
    const data = localStorage.getItem(STORAGE_KEYS.TENANTS);
    return data ? JSON.parse(data) : INITIAL_TENANTS;
  }

  getInvoices(): Invoice[] {
    if (typeof window === 'undefined') return INITIAL_INVOICES;
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : INITIAL_INVOICES;
  }

  getTickets(): Ticket[] {
    if (typeof window === 'undefined') return INITIAL_TICKETS;
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : INITIAL_TICKETS;
  }

  getRoomsWithTenants(): RoomWithTenants[] {
    const rooms = this.getRooms();
    const tenants = this.getTenants();
    const invoices = this.getInvoices();

    return rooms.map((room) => {
      const roomTenants = tenants
        .filter((t) => t.room_id === room.id)
        .map((t) => ({
          ...t,
          invoices: invoices.filter((inv) => inv.tenant_id === t.id),
        }));

      const occupied_beds = roomTenants.length;
      let status: 'occupied_paid' | 'occupied_pending' | 'vacant' = 'vacant';

      if (occupied_beds > 0) {
        const hasUnpaid = roomTenants.some((t) =>
          t.invoices.some((inv) => inv.status === 'pending' || inv.status === 'overdue')
        );
        status = hasUnpaid ? 'occupied_pending' : 'occupied_paid';
      }

      return {
        ...room,
        tenants: roomTenants,
        occupied_beds,
        status,
      };
    });
  }

  // --- Actions ---

  markInvoicePaid(invoiceId: string, paymentRef?: string): Invoice {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((inv) => inv.id === invoiceId);
    if (index !== -1) {
      invoices[index] = {
        ...invoices[index],
        status: 'paid',
        payment_ref: paymentRef || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      };
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      this.notify();
      return invoices[index];
    }
    throw new Error('Invoice not found');
  }

  addTicket(ticket: Omit<Ticket, 'id' | 'status' | 'created_at'>): Ticket {
    const tickets = this.getTickets();
    const newTicket: Ticket = {
      ...ticket,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ticket-${Date.now()}`,
      status: 'open',
      created_at: new Date().toISOString(),
    };
    tickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    this.notify();
    return newTicket;
  }

  updateTicketStatus(ticketId: string, status: TicketStatus): Ticket {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index !== -1) {
      tickets[index] = { ...tickets[index], status };
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
      this.notify();
      return tickets[index];
    }
    throw new Error('Ticket not found');
  }

  updateTenantKyc(tenantId: string, kycUrl: string): Tenant {
    const tenants = this.getTenants();
    const index = tenants.findIndex((t) => t.id === tenantId);
    if (index !== -1) {
      tenants[index] = { ...tenants[index], kyc_url: kycUrl };
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
      this.notify();
      return tenants[index];
    }
    throw new Error('Tenant not found');
  }

  generateInvoice(tenantId: string, amount: number, dueDate: string): Invoice {
    const invoices = this.getInvoices();
    const newInvoice: Invoice = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inv-${Date.now()}`,
      tenant_id: tenantId,
      amount,
      due_date: dueDate,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    this.notify();
    return newInvoice;
  }

  resetToDefaultSeed() {
    localStorage.setItem(STORAGE_KEYS.PROPERTY, JSON.stringify(INITIAL_PROPERTY));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    this.notify();
  }
}

export const store = new DataStore();
