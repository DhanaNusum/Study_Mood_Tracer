# Study_Mood_Tracker

A full-stack web application that helps students track their study sessions along with their emotional state. The system analyzes mood patterns across subjects and time periods to provide insights and smart study suggestions.

## Features

- 🔐 **User Authentication**: Secure registration and login with JWT tokens
- 📝 **Multi-Emotion Tracking**: Track multiple emotions with scores (1-10) per study session
- ⏱️ **Pomodoro Timer**: Integrated 25-minute work/5-minute break timer with emotion tracking
- 📊 **Advanced Analytics**: Separate analytics page with comprehensive emotion analysis
- 📈 **Weekly Trends**: View emotion trends over time with interactive charts
- 🎯 **Smart Suggestions**: Get personalized study recommendations based on emotion patterns
- 📱 **Responsive Design**: Beautiful, modern UI with GSAP animations that works on all devices
- 🎨 **Light Theme**: Clean, accessible interface with proper color contrast

## Tech Stack

### Backend
- Node.js + Express
- MongoDB Database (Mongoose)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React.js
- React Router v6
- GSAP for smooth animations
- Chart.js for visualizations
- Axios for API calls

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Study_Mood_Tracer
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study_mood_tracker
JWT_SECRET=your_secret_key_here_change_in_production
```

**Note:** For MongoDB Atlas (cloud), use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study_mood_tracker
```

### 3. Database Setup

1. Make sure MongoDB is running on your system
   - **Local MongoDB**: Start MongoDB service (usually runs automatically)
   - **MongoDB Atlas**: Use the connection string from your Atlas cluster
2. The application will automatically create the required collections when you start the server.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional, defaults to localhost:5000):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Start the Backend Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start the Frontend

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with your name, email, and password
2. **Login**: Use your credentials to access the dashboard
3. **Add Study Entry**: Log your study sessions with:
   - Subject name
   - Multiple emotions with scores (1-10)
   - Study time (defaults to current time)
   - Duration (optional)
   - Notes and tags (optional)
4. **Use Pomodoro Timer**: Start focused study sessions with emotion tracking
5. **View Dashboard**: See your recent entries, quick stats, and smart suggestions
6. **Access Analytics**: Navigate to detailed emotion analysis page for comprehensive insights

## Emotion System

The application tracks 10 different emotions with individual scoring:

### Available Emotions
- 😄 **Happy** - Positive, productive state
- 😴 **Tired** - Low energy, need rest
- 😣 **Stressed** - Overwhelmed, anxious
- 🤩 **Excited** - Enthusiastic, motivated
- 😰 **Anxious** - Worried, nervous
- 🎯 **Focused** - Concentrated, productive
- 😑 **Bored** - Disengaged, uninterested
- 💪 **Confident** - Self-assured, capable
- 😤 **Frustrated** - Blocked, stuck
- 😌 **Calm** - Relaxed, peaceful

### Scoring System
- **1-3**: Low intensity (mild feeling)
- **4-6**: Moderate intensity (noticeable feeling)
- **7-10**: High intensity (strong feeling)

## Smart Suggestions

The application provides intelligent suggestions based on your study patterns:

- **Stress Detection**: If high stress scores for a subject, suggests shorter sessions or breaks
- **Energy Management**: Based on tired/excited patterns, suggests optimal study times
- **Emotional Balance**: Analyzes overall emotion distribution for well-being insights
- **Subject Performance**: Correlates emotions with specific subjects for optimization
- **Time-based Patterns**: Identifies best/worst study times based on emotions

## Pages and Features

### Dashboard (`/dashboard`)
- Quick overview of study statistics
- Recent study entries table
- Smart suggestions widget
- GSAP-animated stat cards
- Direct links to timer and analytics

### Add Study Entry (`/add-entry`)
- Multi-step form with GSAP animations
- Emotion selection with scoring sliders
- Subject, duration, notes, and tags
- Real-time validation and feedback

### Pomodoro Timer (`/timer`)
- 25-minute work / 5-minute break cycles
- Emotion tracking during sessions
- Personalized tips based on current emotions
- Session completion logging

### Analytics (`/analytics`)
- **Overview Tab**: Summary statistics and trends
- **Trends Tab**: Weekly emotion patterns
- **Subjects Tab**: Subject-wise emotion analysis
- **Insights Tab**: Smart recommendations and patterns
- Interactive charts with GSAP animations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Study Logs
- `GET /api/study-logs` - Get all study logs (requires authentication)
- `POST /api/study-logs` - Add a new study log (requires authentication)
- `GET /api/study-logs/analytics` - Get analytics data (requires authentication)
- `DELETE /api/study-logs/:id` - Delete a study log (requires authentication)

## Project Structure

```
Study_Mood_Tracer/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   └── StudyLog.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── studyLogs.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── WeeklyTrendChart.js
│   │   │   ├── SubjectMoodChart.js
│   │   │   ├── SmartSuggestions.js
│   │   │   ├── StudyTimer.js
│   │   │   └── StudyTimer.css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AddStudyEntry.js
│   │   │   ├── EmotionAnalytics.js
│   │   │   ├── EmotionAnalytics.css
│   │   │   └── Timer.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
├── README.md
└── SETUP_GUIDE.md
```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes
- MongoDB injection prevention with Mongoose validation
- Input sanitization and validation

## GSAP Animations

The application uses GSAP (GreenSock Animation Platform) for smooth, hardware-accelerated animations:

- **Page Transitions**: Smooth entrance effects for all pages
- **Component Animations**: Staggered card appearances
- **Interactive Elements**: Hover and click animations
- **Form Steps**: Progressive reveal animations
- **Chart Animations**: Smooth data visualization transitions

## Future Enhancements

- Export data to CSV/PDF
- Email notifications for study reminders
- Mobile app version
- Machine learning-based predictions
- Study group features
- Goal setting and tracking
- Voice emotion logging
- Integration with calendar apps

## License

This project is open source and available under the MIT License.

Contributions, issues, and feature requests are welcome!

## Support

For support, please open an issue in the repository.
