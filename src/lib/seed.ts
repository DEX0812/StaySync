import { Property, Room, Tenant, Invoice, Ticket } from './types';

export const INITIAL_PROPERTY: Property = {
  id: '11111111-1111-1111-1111-111111111111',
  owner_id: '00000000-0000-0000-0000-000000000001',
  name: 'Sunrise Luxury PG & Co-Living',
  address: 'Plot 402, Near Chandigarh University Gate 3, Kharar, Punjab',
  total_beds: 8,
};

export const INITIAL_ROOMS: Room[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    property_id: '11111111-1111-1111-1111-111111111111',
    room_number: '101',
    capacity: 2,
    base_rent: 7500,
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    property_id: '11111111-1111-1111-1111-111111111111',
    room_number: '102',
    capacity: 3,
    base_rent: 6500,
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    property_id: '11111111-1111-1111-1111-111111111111',
    room_number: '103',
    capacity: 1,
    base_rent: 9500,
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    property_id: '11111111-1111-1111-1111-111111111111',
    room_number: '104',
    capacity: 2,
    base_rent: 7000,
  },
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    room_id: '22222222-2222-2222-2222-222222222201',
    name: 'Rahul Sharma',
    phone: '+919876543210',
    kyc_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    move_in_date: '2026-01-15',
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    room_id: '22222222-2222-2222-2222-222222222202',
    name: 'Priya Verma',
    phone: '+919812345678',
    kyc_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    move_in_date: '2026-02-01',
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    room_id: '22222222-2222-2222-2222-222222222201',
    name: 'Amit Patel',
    phone: '+919711223344',
    kyc_url: null,
    move_in_date: '2026-03-01',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    tenant_id: '33333333-3333-3333-3333-333333333301',
    amount: 7950,
    due_date: '2026-09-10',
    status: 'pending',
    payment_ref: null,
    created_at: '2026-09-01',
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    tenant_id: '33333333-3333-3333-3333-333333333302',
    amount: 6800,
    due_date: '2026-09-05',
    status: 'overdue',
    payment_ref: null,
    created_at: '2026-09-01',
  },
  {
    id: '44444444-4444-4444-4444-444444444403',
    tenant_id: '33333333-3333-3333-3333-333333333303',
    amount: 7000,
    due_date: '2026-08-10',
    status: 'paid',
    payment_ref: 'UPI/692019481023',
    created_at: '2026-08-01',
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: '55555555-5555-5555-5555-555555555501',
    tenant_id: '33333333-3333-3333-3333-333333333301',
    category: 'Wi-Fi',
    description: 'High latency and frequent disconnects in Room 101 since yesterday evening.',
    status: 'open',
    photo_url: null,
    created_at: '2026-09-08T10:30:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555502',
    tenant_id: '33333333-3333-3333-3333-333333333302',
    category: 'Plumbing',
    description: 'Bathroom tap leaking continuously in Room 102.',
    status: 'in_progress',
    photo_url: null,
    created_at: '2026-09-07T14:15:00Z',
  },
];
