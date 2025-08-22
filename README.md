# BrokeBhai - AI-Powered Financial Management Platform

## Team Details  
- **Team Name:** ByteBenders
- **Team Members:** Anmol Mahobiya, Sourabh Singh, Sumant Sahu, Anshika Chandrawanshi

## PPT Link : 
https://docs.google.com/presentation/d/1K1tPSb0GOUF_spdXFLP2hoBbi1BYQPlD/edit?usp=sharing&ouid=109564785001838202691&rtpof=true&sd=true

## Problem Statement  
Traditional financial management tools lack intelligent insights and personalized recommendations. BrokeBhai solves this by providing AI-powered financial analysis, smart spending predictions, and automated loan management to help users make informed financial decisions.

## Project Description  
BrokeBhai is a comprehensive financial management platform that combines modern web technologies with artificial intelligence to deliver personalized financial insights. The platform features:

### Core Features
- **AI-Powered Savings Analysis**: Uses Google Gemini AI to analyze spending patterns and provide personalized recommendations
- **Smart Spending Predictions**: Machine learning models predict future expenses based on user behavior
- **Peer-to-Peer Loan Management**: Track and manage loans between friends with automated notifications
- **Real-time Financial Insights**: Interactive dashboards with spending analytics and forecasting
- **Secure Authentication**: Clerk-based authentication with role-based access control
- **Multi-Database Architecture**: Hybrid approach using both Supabase and MongoDB for optimal performance

### Unique Approach
- **EWMA Smoothing**: Advanced exponentially weighted moving average for accurate trend analysis
- **Feature Engineering**: Sophisticated ML pipeline for spending prediction
- **Real-time Notifications**: Smart alert system for important financial events
- **Responsive Design**: Modern UI with Tailwind CSS and Radix UI components

## Tech Stack Used

### Frontend
- **Framework**: Next.js 14 (React 18.2.0)
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives
- **Authentication**: Clerk
- **State Management**: React Hooks
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Framework**: FastAPI 0.111.0
- **Runtime**: Python with Uvicorn server
- **Databases**: 
  - Supabase (Primary)
  - MongoDB with Motor (Legacy support)
- **ML/AI**: 
  - Google Generative AI (Gemini)
  - Joblib for model persistence
  - NumPy & Pandas for data processing
- **Scheduling**: APScheduler for automated tasks
- **Authentication**: JWT tokens

### Development Tools
- **Package Management**: npm (Frontend), pip (Backend)
- **Database ORM**: Prisma (Frontend), Motor (Backend)
- **Code Quality**: ESLint, Next.js built-in linting
- **Email**: React Email with Resend

## Installation & Usage

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- Clerk account for authentication
- Google AI API key (for Gemini)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   MONGODB_URL=your_mongodb_url  # Optional for legacy support
   GOOGLE_API_KEY=your_gemini_api_key
   ML_MODEL_PATH=model.pkl
   ML_FEATURES_PATH=model_features.json
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Live Demo / Deployment  
[Add deployment link when available]

## UI/UX / Design Link (if applicable)  
[Add Figma/Design link if available]

## API Endpoints

### Core Endpoints
- `GET /` - Health check
- `GET /health` - System health status
- `GET /test-db` - Database connectivity test

### User Management
- `POST /api/users/` - Create user
- `GET /api/users/{user_id}` - Get user details
- `PUT /api/users/{user_id}` - Update user

### Transactions
- `POST /api/transactions/` - Add transaction
- `GET /api/transactions/user/{user_id}` - Get user transactions
- `DELETE /api/transactions/{transaction_id}` - Delete transaction

### AI & ML Features
- `GET /api/savings_analysis/{user_id}` - AI-powered savings analysis
- `POST /api/predict_spending` - ML spending prediction

### Loan Management
- `POST /api/loans/` - Create loan
- `GET /api/loans/user/{user_id}` - Get user loans
- `PUT /api/loans/{loan_id}/repay` - Mark loan as repaid

### Notifications
- `GET /api/notifications/{user_id}` - Get user notifications
- `POST /api/notifications/` - Create notification

## Future Enhancements  
- **Mobile Application**: React Native app for iOS and Android
- **Advanced ML Models**: Deep learning for more accurate predictions
- **Investment Tracking**: Portfolio management and stock tracking
- **Bill Reminders**: Automated bill payment reminders
- **Expense Categories**: AI-powered automatic expense categorization
- **Social Features**: Financial goal sharing and community challenges
- **Integration APIs**: Connect with banks and financial institutions
- **Voice Commands**: Voice-based transaction logging
- **Cryptocurrency Support**: Track and manage crypto investments
- **Financial Education**: Personalized learning modules and tips

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

---
**Made with 💗 by ByteBenders**
