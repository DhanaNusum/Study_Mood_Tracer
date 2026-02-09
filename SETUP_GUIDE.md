# Step-by-Step Setup Guide

## Prerequisites Check

Before starting, make sure you have:
- ✅ **Node.js** installed (v14 or higher) - [Download here](https://nodejs.org/)
- ✅ **MongoDB** installed and running (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- ✅ **npm** (comes with Node.js)

Verify installations:
```bash
node --version
npm --version
mongod --version
```

---

## Step 1: Database Setup

### 1.1 Start MongoDB Server

**Option A: Local MongoDB**
- Make sure MongoDB service is running on your system
- On Windows: MongoDB usually runs as a service automatically
- On Mac/Linux: Run `mongod` in terminal or start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- No local installation needed!

### 1.2 Database Creation
The database and collections will be created automatically when you start the application. No manual setup required!

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install all required packages (express, mongoose, bcryptjs, jsonwebtoken, etc.)

### 2.3 Create Environment File
Create a `.env` file in the `backend` directory:

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env
```

**Windows (CMD):**
```cmd
copy env.example .env
```

**Mac/Linux:**
```bash
cp env.example .env
```

### 2.4 Configure Environment Variables
Open the `.env` file and update it with your MongoDB connection:

**For Local MongoDB:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study_mood_tracker
JWT_SECRET=your_secret_key_here_change_in_production
```

**For MongoDB Atlas (Cloud):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study_mood_tracker
JWT_SECRET=your_secret_key_here_change_in_production
```

**Important:** 
- For local MongoDB: Default URI should work if MongoDB is running on default port (27017)
- For MongoDB Atlas: Replace `username`, `password`, and `cluster` with your Atlas credentials
- Replace `your_secret_key_here_change_in_production` with a random secret string (for JWT token signing)

---

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory
Open a **new terminal window** and navigate to frontend:

```bash
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install React and all required packages (react-router-dom, axios, chart.js, etc.)

### 3.3 (Optional) Create Frontend Environment File
Create a `.env` file in the `frontend` directory if you want to customize the API URL:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Note:** This is optional - the app will default to `http://localhost:5000/api` if not set.

---

## Step 4: Running the Application

### 4.1 Start the Backend Server

In the **backend terminal**:

```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

**Expected output:**
```
Server is running on port 5000
MongoDB connected successfully
```

✅ Backend is now running at `http://localhost:5000`

### 4.2 Start the Frontend

In a **new terminal window** (keep backend running):

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view study-mood-tracker-frontend in the browser.

  Local:            http://localhost:3000
```

✅ Frontend will automatically open in your browser at `http://localhost:3000`

---

## Step 5: Using the Application

### 5.1 Create an Account
1. You'll see the **Login** page
2. Click **"Sign up here"** link
3. Fill in:
   - Name
   - Email
   - Password (minimum 6 characters)
   - Confirm Password
4. Click **"Sign Up"**

### 5.2 Add Your First Study Entry
1. After logging in, you'll see the **Dashboard**
2. Click **"Add Entry"** in the navigation bar
3. Fill in:
   - **Subject**: e.g., "Mathematics", "Physics"
   - **Mood**: Select from Happy 😄, Tired 😴, or Stressed 😣
   - **Study Time**: Defaults to current time (can be changed)
   - **Duration**: Optional (in minutes)
4. Click **"Add Entry"**

### 5.3 View Analytics
- Return to **Dashboard** to see:
  - Total study sessions
  - Weekly mood trend chart
  - Subject-wise mood distribution
  - Smart study suggestions

---

## Troubleshooting

### Backend Issues

**Problem: "Cannot connect to MongoDB"**
- ✅ Check if MongoDB is running (local) or connection string is correct (Atlas)
- ✅ Verify `MONGODB_URI` in `.env` file
- ✅ For local MongoDB: Ensure MongoDB service is running
- ✅ For MongoDB Atlas: Check your connection string and network access settings

**Problem: "Port 5000 already in use"**
- Change `PORT=5000` to another port (e.g., `PORT=5001`) in `.env`
- Update frontend `.env` file accordingly

**Problem: "Module not found"**
- Run `npm install` again in the backend directory

### Frontend Issues

**Problem: "Cannot connect to API"**
- ✅ Make sure backend is running on port 5000
- ✅ Check `REACT_APP_API_URL` in frontend `.env` file
- ✅ Verify CORS is enabled in backend (it should be)

**Problem: "Port 3000 already in use"**
- React will ask if you want to use another port - type `Y` and press Enter

**Problem: "Module not found"**
- Run `npm install` again in the frontend directory

### Database Issues

**Problem: "MongoDB connection error"**
- Collections are created automatically when backend starts
- Check backend console for "MongoDB connected successfully"
- Verify MongoDB is running: `mongod --version` or check MongoDB service status
- For Atlas: Ensure your IP is whitelisted in Network Access settings

**Problem: "Authentication failed" (MongoDB Atlas)**
- Verify username and password in connection string
- Check if database user has read/write permissions
- Ensure connection string format is correct: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

---

## Quick Start Commands Summary

```bash
# Terminal 1 - Backend
cd backend
npm install
# Create .env file with your MongoDB connection string
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
```

---

## Testing the Application

1. **Test Registration**: Create a new account
2. **Test Login**: Log out and log back in
3. **Add Multiple Entries**: Add 5-10 study entries with different subjects and moods
4. **View Charts**: Check if charts appear on dashboard
5. **Check Suggestions**: Add entries that trigger smart suggestions (e.g., many stressed entries for one subject)

---

## Stopping the Application

- **Backend**: Press `Ctrl + C` in the backend terminal
- **Frontend**: Press `Ctrl + C` in the frontend terminal

---

## Need Help?

If you encounter any issues:
1. Check the console/terminal for error messages
2. Verify all prerequisites are installed
3. Ensure MySQL is running
4. Check that `.env` files are configured correctly
5. Try deleting `node_modules` and running `npm install` again
