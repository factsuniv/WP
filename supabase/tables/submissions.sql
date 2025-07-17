CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    category_id INTEGER,
    pdf_url VARCHAR(1000),
    presentation_url VARCHAR(1000),
    audio_url VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'pending',
    submitted_by UUID,
    reviewed_by UUID,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);