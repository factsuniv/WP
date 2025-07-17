CREATE TABLE white_papers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    category_id INTEGER,
    pdf_url VARCHAR(1000),
    presentation_url VARCHAR(1000),
    audio_url VARCHAR(1000),
    ai_summary TEXT,
    ai_sections JSONB,
    status VARCHAR(50) DEFAULT 'published',
    views INTEGER DEFAULT 0,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);