export type InvoiceStatus = 'pending' | 'paid' | 'overdue';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  total_beds: number;
  created_at?: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  capacity: number;
  base_rent: number;
  created_at?: string;
}

export interface Tenant {
  id: string;
  room_id: string;
  name: string;
  phone: string;
  kyc_url: string | null;
  move_in_date: string;
  created_at?: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  amount: number;
  due_date: string;
  status: InvoiceStatus;
  payment_ref?: string | null;
  created_at?: string;
}

export interface Ticket {
  id: string;
  tenant_id: string;
  category: string;
  description: string;
  status: TicketStatus;
  photo_url?: string | null;
  created_at?: string;
}

export interface RoomWithTenants extends Room {
  tenants: (Tenant & { invoices: Invoice[] })[];
  occupied_beds: number;
  status: 'occupied_paid' | 'occupied_pending' | 'vacant';
}
