-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Invoice Status Enum
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue');

-- Create Ticket Status Enum
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved');

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    total_beds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    base_rent DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    kyc_url TEXT DEFAULT NULL,
    move_in_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'pending',
    payment_ref VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'open',
    photo_url TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) setup
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Sample Seed Data
INSERT INTO properties (id, owner_id, name, address, total_beds) VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Sunrise Luxury PG & Co-Living', 'Plot 402, Near Chandigarh University Gate 3, Kharar, Punjab', 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, property_id, room_number, capacity, base_rent) VALUES 
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', '101', 2, 7500.00),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', '102', 3, 6500.00),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', '103', 1, 9500.00),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111', '104', 2, 7000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenants (id, room_id, name, phone, kyc_url, move_in_date) VALUES 
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'Rahul Sharma', '+919876543210', 'https://example.com/kyc/rahul_aadhar.pdf', '2026-01-15'),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 'Priya Verma', '+919812345678', 'https://example.com/kyc/priya_aadhar.pdf', '2026-02-01'),
('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 'Amit Patel', '+919711223344', NULL, '2026-03-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, tenant_id, amount, due_date, status, payment_ref) VALUES 
('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 7950.00, '2026-09-10', 'pending', NULL),
('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333302', 6800.00, '2026-09-05', 'overdue', NULL),
('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333303', 7000.00, '2026-08-10', 'paid', 'UPI/692019481023')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tickets (id, tenant_id, category, description, status, photo_url) VALUES 
('55555555-5555-5555-5555-555555555501', '33333333-3333-3333-3333-333333333301', 'Wi-Fi', 'High latency and frequent disconnects in Room 101 since yesterday evening.', 'open', NULL),
('55555555-5555-5555-5555-555555555502', '33333333-3333-3333-3333-333333333302', 'Plumbing', 'Bathroom tap leaking continuously in Room 102.', 'in_progress', NULL)
ON CONFLICT (id) DO NOTHING;
