<div align="center">

# 🌸 MomCare AI
### AI-Enabled Pregnancy Tracker & Smart Health Advisor

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-ML%20Server-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

> **A full-stack AI-powered pregnancy support system** that tracks health, predicts risks, monitors fetal growth, and provides personalized care recommendations — all in one beautiful app.

</div>

---

## 📸 Preview

> _Dashboard • AI Predict • Baby Growth • Water & Exercise Tracker_

```
localhost:3000  →  Full React App
localhost:5000  →  Node.js Backend API
localhost:5001  →  Python ML Server
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Dashboard** | Pregnancy week tracker, trimester progress, quick stats |
| 🤖 **AI Health Predictor** | ML model predicts disease risk (92% accuracy) |
| 👶 **Baby Growth Tracker** | Month-by-month fetal development data |
| 💧 **Water Tracker** | Daily hydration logging with AI-recommended intake |
| 🏃 **Exercise Tracker** | Safe pregnancy workouts with AI recommendations |
| 📅 **Appointments** | Schedule & manage doctor visits |
| 🚨 **Emergency SOS** | One-tap emergency contact trigger |
| 🔐 **Auth System** | Secure JWT-based login & registration |

---

## 🛠️ Tech Stack

```
Frontend   →  React.js 18, React Router v6, Recharts, Lucide Icons
Backend    →  Node.js, Express.js, Mongoose
Database   →  MongoDB (Atlas or Local)
Auth       →  JWT + bcryptjs
ML Server  →  Python, Flask, scikit-learn, pandas, numpy
Validation →  express-validator
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js v16+](https://nodejs.org)
- [Python 3.8+](https://python.org)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** [MongoDB Atlas](https://cloud.mongodb.com) (free cloud)

---

### 📁 Project Structure

```
motherhood-app/
├── public/                  → HTML template
├── src/                     → React Frontend
│   ├── components/          → Navbar, Footer
│   ├── context/             → Auth state (Context API)
│   ├── pages/               → All 9 pages
│   ├── services/
│   │   └── api.js           → All backend API calls
│   ├── App.js               → Routes
│   └── index.css            → Global design system
├── server/                  → Node.js Backend
│   ├── index.js             → Complete Express server
│   ├── ml/                  → Python ML Server
│   │   ├── ml_server.py     → Flask ML API
│   │   ├── train_models.py  → Model training
│   │   ├── generate_datasets.py → Dataset generator
│   │   └── requirements.txt
│   └── package.json
├── .env                     → Frontend env vars
└── package.json             → Frontend dependencies
```

---

### ⚙️ Setup & Run

#### Step 1 — Clone the repo

```bash
git clone https://github.com/shehzad786553/Ai-enabled-motherhood-support-system.git
cd Ai-enabled-motherhood-support-system/motherhood-app
```

---

#### Step 2 — Backend Setup (Terminal 1)

```bash
cd server
npm install
```

Edit `server/.env` and set your MongoDB URI:

```env
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/momcare

# OR MongoDB Atlas (Cloud)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/momcare
```

Start the backend:

```bash
npm run dev
```

✅ You should see:
```
✅  MomCare AI Backend Running on http://localhost:5000
✅  MongoDB connected
```

---

#### Step 3 — ML Server Setup (Terminal 2)

```bash
cd server/ml
pip install -r requirements.txt

# Generate training data
python generate_datasets.py

# Train ML models
python train_models.py

# Start ML server
python ml_server.py
```

✅ You should see:
```
🌸  MomCare AI — ML Prediction Server
🔗  Running on http://localhost:5001
```

---

#### Step 4 — Frontend Setup (Terminal 3)

```bash
# From root: motherhood-app/
npm install
npm start
```

✅ App opens at **http://localhost:3000**

---

### 🔌 All 3 Servers Must Run Together

| Terminal | Command | Port |
|---|---|---|
| Terminal 1 | `cd server && npm run dev` | :5000 |
| Terminal 2 | `cd server/ml && python ml_server.py` | :5001 |
| Terminal 3 | `npm start` (from root) | :3000 |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update` | Update profile |
| GET | `/api/dashboard` | Full dashboard stats |
| GET | `/api/water` | Today's water log |
| POST | `/api/water` | Save water log |
| GET | `/api/exercise` | Today's exercise log |
| POST | `/api/exercise/log` | Log an exercise |
| GET | `/api/appointments` | All appointments |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |
| GET | `/api/embryo/month/:month` | Fetal data by month |
| POST | `/api/predict` | AI health risk prediction |
| POST | `/api/emergency/trigger` | Trigger emergency SOS |

---

## 🤖 ML Models

| Model | Algorithm | Accuracy |
|---|---|---|
| Disease Risk Predictor | Random Forest | **92.0%** |
| Exercise Recommender | Decision Tree | 68.9% |
| Hydration Advisor | Linear Regression | R² = 0.82 |

**Input features for Disease Prediction:**
- Systolic/Diastolic Blood Pressure
- Blood Sugar (BS)
- Body Temperature
- Heart Rate
- Hemoglobin
- Age

---

## 🌍 Environment Variables

**`server/.env`**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/momcare
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
ML_SERVER_URL=http://localhost:5001
```

**`.env` (Frontend)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 👨‍💻 Team

| Name | Role |
|---|---|
| Shehzad Khan | Full Stack Developer |
| Ryan Javed | Backend & ML |
| Shivam Saroj | Frontend & UI |
| Vinay Singh Yadav | ML & Data |

**Mentor:** Ms. Ayushi Mittal

---

## ⚠️ Disclaimer

> This application provides general pregnancy guidance only.
> **Always consult a qualified doctor for medical advice.**

---

<div align="center">

Made with 🌸 by Team MomCare AI

</div>
