# 🌸 MomCare AI — Motherhood Support System

**AI-Enabled Pregnancy Tracker & Health Advisor**

> Team: Shehzad Khan · Ryan Javed · Shivam Saroj · Vinay Singh Yadav  
> Mentor: Ms. Ayushi Mittal

---

## 📁 Project Structure

```
motherhood-app/
├── public/                  → HTML template
├── src/                     → React Frontend
│   ├── components/          → Navbar, Footer
│   ├── context/             → Auth state management
│   ├── pages/               → All 9 pages
│   ├── services/
│   │   └── api.js           → All backend API calls
│   ├── App.js               → Routes
│   └── index.css            → Global design system
├── server/                  → Node.js Backend (ONE FILE)
│   ├── index.js             → Complete backend server
│   └── package.json
├── .env                     → Frontend env vars
└── package.json             → Frontend dependencies
```

---

## 🚀 Setup & Run (Step by Step)

### Prerequisites
- **Node.js** v16+ → https://nodejs.org
- **MongoDB** (choose one):
  - Local: Install MongoDB Community → https://www.mongodb.com/try/download/community
  - Cloud: Create free cluster at → https://cloud.mongodb.com

---

### Step 1 — Setup Backend

```bash
# Go into server folder
cd motherhood-app/server

# Install backend dependencies
npm install

# Edit .env file — set your MongoDB URI
# Open server/.env and change MONGO_URI if needed

# Start backend server
npm start
# OR for auto-reload during development:
npm run dev
```

✅ Backend will run at: **http://localhost:5000**  
✅ Test it: open http://localhost:5000/api/health in browser

---

### Step 2 — Setup Frontend

```bash
# Open a NEW terminal tab
# Go back to root folder
cd motherhood-app

# Install frontend dependencies
npm install

# Start React app
npm start
```

✅ Frontend will run at: **http://localhost:3000**

---

### Step 3 — MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - Windows: MongoDB runs as a service automatically
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
3. The default `MONGO_URI=mongodb://localhost:27017/momcare` will work

#### Option B: MongoDB Atlas (Cloud — Free)
1. Go to https://cloud.mongodb.com
2. Create free account → New Project → Free Cluster
3. Database Access → Add user with password
4. Network Access → Add IP → 0.0.0.0/0 (allow all)
5. Connect → Drivers → Copy connection string
6. Open `server/.env` → Replace MONGO_URI with your connection string:
```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/momcare
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login & get JWT token |
| GET  | /api/auth/me | Get current user |
| PUT  | /api/auth/update | Update profile |
| GET  | /api/dashboard | Full dashboard stats |
| GET  | /api/water | Today's water log |
| POST | /api/water | Save water log |
| GET  | /api/exercise | Today's exercise log |
| POST | /api/exercise/log | Log an exercise |
| GET  | /api/appointments | All appointments |
| POST | /api/appointments | Create appointment |
| PUT  | /api/appointments/:id | Update appointment |
| DELETE | /api/appointments/:id | Delete appointment |
| GET  | /api/embryo/month/:month | Fetal data by month |
| POST | /api/predict | AI health risk prediction |
| POST | /api/emergency/trigger | Trigger emergency SOS |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18, React Router v6 |
| Styling | Custom CSS Design System |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Validation | express-validator |

---

## ⚠️ Disclaimer

This application provides general pregnancy guidance only.  
**Always consult a qualified doctor for medical advice.**
