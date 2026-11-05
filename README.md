# NoteNest ????

> A peer-to-peer academic note-sharing platform featuring a **Give-to-Get Credit Economy**, PDF previewing, and an automated cold-storage lifecycle manager.

---

## ?? Overview

**NoteNest** solves the common "free-rider" problem in college study hubs. Instead of students only consuming content without contributing, NoteNest introduces a **tokenized credit economy**:
- Users get **6 starter credits** (worth 3 downloads).
- Downloading a note costs **2 credits**.
- Uploading verified study material awards **+10 credits**.
- Whenever peers download your notes, you earn **+1 credit royalty**.

The backend also incorporates an automated file lifecycle engine that archives neglected documents to optimize primary disk space.

---

## ??? Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (Modern UI styling)
- **Lucide React** (Icons)
- **Axios** (API client with interceptors)
- **React Router DOM v6** (Client-side routing)

### Backend
- **Node.js** & **Express.js** (REST API architecture)
- **MongoDB Atlas** & **Mongoose** (Database & schema design)
- **JWT (JSON Web Tokens)** & **bcryptjs** (Authentication & password hashing)
- **Multer** (File upload handling)
- **Node-Cron** / Lifecycle Background Engine (Storage tiering)

---

## ? Key Features

1. **Tokenized Academic Economy**:
   - Starting balance for new signups.
   - Atomic debit/credit transactions on download with royalty distribution.
   - In-app "Out of Credits" modal directing students to upload materials.
   - Duplicate prevention: re-downloading previously unlocked notes is free.

2. **File Explorer & PDF Previewer**:
   - Search by title, subject, or tags.
   - Filter by semester (1 to 8) and engineering department.
   - Sort by latest, most downloaded, or highest upvoted.
   - Embedded full-page modal preview before downloading.

3. **Community & Engagement**:
   - **Upvotes**: Community ranking for high-quality notes.
   - **Bookmarks**: Save notes to a personal library for revision.
   - **Dashboard**: Track uploaded resources, download metrics, and bookmarked documents.

4. **Automated Lifecycle Manager**:
   - Scans files and flags unaccessed/stale notes.
   - Compresses and moves dormant files to cold archive storage.

---

## ?? Project Structure

\\\	ext
notenest/
+-- backend/
¦   +-- controllers/       # Auth and note business logic
¦   +-- middleware/        # JWT auth and Multer upload configurations
¦   +-- models/            # User and Note Mongoose schemas
¦   +-- routes/            # REST API route handlers
¦   +-- services/          # Storage lifecycle automation
¦   +-- uploads/           # Active PDF documents (.gitkeep)
¦   +-- archived_uploads/  # Cold-storage archives (.gitkeep)
¦   +-- server.js          # App entry point
¦   +-- package.json
+-- frontend/
¦   +-- src/
¦   ¦   +-- api/           # Axios instance configuration
¦   ¦   +-- components/    # Navbar, Modals, Card UI
¦   ¦   +-- context/       # AuthContext & credit state
¦   ¦   +-- pages/         # Explore, Dashboard, Upload, Auth
¦   ¦   +-- App.jsx
¦   ¦   +-- main.jsx
¦   +-- index.html
¦   +-- package.json
+-- .gitignore             # Strict exclusion for secrets, zips, & dependencies
+-- README.md
\\\

---

## ? Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas cluster URL or local MongoDB instance

### 1. Backend Setup
\\\ash
cd backend
npm install
\\\

Create a \.env\ file in \ackend/\:
\\\env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
\\\

Run the backend server:
\\\ash
npm run dev
# Server runs on http://localhost:5000
\\\

### 2. Frontend Setup
Open a separate terminal:
\\\ash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
\\\

---

## ?? Security Best Practices
- Environment credentials, database passwords, and JWT keys are excluded from git history.
- Local binary uploads and user-submitted PDFs are stored locally or in object storage rather than bloated into the Git repository.
