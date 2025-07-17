CREATE TABLE paper_views (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER,
    user_id UUID,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);