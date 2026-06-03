-- Enable pgvector extension for VECTOR type
CREATE EXTENSION IF NOT EXISTS vector;

-- ENUMs
CREATE TYPE user_role AS ENUM ('mahasiswa', 'dosen', 'asisten');
CREATE TYPE document_difficulty AS ENUM ('dasar', 'menengah', 'lanjutan');
CREATE TYPE document_status AS ENUM ('pending', 'active', 'archived');
CREATE TYPE vote_type AS ENUM ('up', 'down');

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nim_nip VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    angkatan INT,
    prodi_id INT, -- Asumsi ada tabel prodi atau hanya ID
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MATA KULIAH
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    semester INT,
    sks INT,
    prodi_id INT,
    dosen_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- DOKUMEN (Knowledge Vault)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    uploader_id INT REFERENCES users(id) ON DELETE SET NULL,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    semester_tahun VARCHAR(20),   -- e.g. "2023/2"
    difficulty document_difficulty,
    ai_categories JSONB,      -- {"tags":["Regression","OLS"]}
    ai_summary TEXT,          -- ringkasan otomatis dari AI
    ai_embedding VECTOR(1536),-- untuk semantic search
    is_verified BOOL DEFAULT FALSE, 
    verified_by INT REFERENCES users(id) ON DELETE SET NULL,
    upvotes INT DEFAULT 0,
    status document_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Q&A THREADS  
CREATE TABLE qa_threads (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    question_embedding VECTOR(1536),
    asker_id INT REFERENCES users(id) ON DELETE SET NULL,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    semester_tahun VARCHAR(20),
    view_count INT DEFAULT 0,
    is_resolved BOOL DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE qa_answers (
    id SERIAL PRIMARY KEY,
    thread_id INT REFERENCES qa_threads(id) ON DELETE CASCADE,
    answerer_id INT REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_best_answer BOOL DEFAULT FALSE,
    is_verified_by_lecturer BOOL DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VOTES
CREATE TABLE document_votes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    type vote_type NOT NULL,
    UNIQUE(user_id, document_id) -- User hanya bisa vote 1 kali per dokumen
);

CREATE TABLE answer_votes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    answer_id INT REFERENCES qa_answers(id) ON DELETE CASCADE,
    type vote_type NOT NULL,
    UNIQUE(user_id, answer_id) -- User hanya bisa vote 1 kali per jawaban
);

-- AI SEMANTIC MATCHES (cache hasil pencarian)
CREATE TABLE semantic_cache (
    id SERIAL PRIMARY KEY,
    query_hash VARCHAR(255) UNIQUE NOT NULL,
    query_embedding VECTOR(1536),
    matched_thread_ids JSONB, 
    similarity_scores JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

