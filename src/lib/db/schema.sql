-- RouteWise Supabase / PostgreSQL Schema Definition

-- 1. Airports Table
CREATE TABLE IF NOT EXISTS airports (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Railway Stations Table
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Operators Table
CREATE TABLE IF NOT EXISTS operators (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('airline', 'railway')),
    reliability_index DECIMAL(4, 2) DEFAULT 90.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Travel Segments (Schedules)
CREATE TABLE IF NOT EXISTS travel_segments (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('flight', 'train')),
    operator_code VARCHAR(10) REFERENCES operators(code),
    segment_number VARCHAR(50) NOT NULL,
    from_code VARCHAR(10) NOT NULL,
    to_code VARCHAR(10) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL,
    taxes DECIMAL(10, 2) NOT NULL,
    reliability_score INTEGER DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning-fast schedule queries
CREATE INDEX IF NOT EXISTS idx_segments_from_to ON travel_segments(from_code, to_code);
CREATE INDEX IF NOT EXISTS idx_segments_departure ON travel_segments(departure_time);
CREATE INDEX IF NOT EXISTS idx_segments_type ON travel_segments(type);

-- 5. User Searches
CREATE TABLE IF NOT EXISTS searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    origin_city VARCHAR(10) NOT NULL,
    destination_city VARCHAR(10) NOT NULL,
    travel_date DATE NOT NULL,
    arrive_by TIMESTAMP WITH TIME ZONE NOT NULL,
    budget DECIMAL(10, 2),
    optimization_mode VARCHAR(50) NOT NULL,
    routes_found INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_searches_user ON searches(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_created ON searches(created_at);

-- 6. Saved Routes
CREATE TABLE IF NOT EXISTS saved_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    search_id UUID REFERENCES searches(id) ON DELETE SET NULL,
    route_data JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_routes_user ON saved_routes(user_id);
