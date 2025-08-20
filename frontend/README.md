# FinSmart

![FinSmart Banner](public/logo.png)

> **A modern financial management platform for tracking, budgeting, and analyzing your finances with AI-powered insights.**

---

## 🚀 Overview
FinSmart is a full-featured financial management application designed to help individuals and businesses track expenses, manage budgets, and gain actionable insights into their financial health. Built with Next.js, Prisma, Clerk, and Tailwind CSS, it offers a seamless, secure, and beautiful user experience.

---

## ✨ Features
- **Advanced Analytics:** AI-powered insights into your spending patterns
- **Smart Receipt Scanner:** Extract data from receipts using AI
- **Budget Planning:** Create and manage budgets with intelligent recommendations
- **Multi-Account Support:** Manage multiple accounts and credit cards in one place
- **Multi-Currency:** Real-time currency conversion and support
- **Automated Insights:** Receive financial recommendations automatically
- **Secure Authentication:** Powered by Clerk
- **Responsive UI:** Built with Tailwind CSS and Radix UI
- **Email Notifications:** Transaction and budget alerts

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, React 18, Tailwind CSS, Radix UI
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** Clerk
- **Email:** Resend, React Email
- **AI/Automation:** Google Generative AI, Inngest

---

## 📦 Folder Structure
```
finsmart/
├── app/           # Next.js app directory (pages, layouts, API routes)
├── components/    # Reusable UI components
├── actions/       # Server actions (email, transactions, etc.)
├── data/          # Static data (features, landing, etc.)
├── emails/        # Email templates
├── hooks/         # Custom React hooks
├── lib/           # Utilities, Prisma, Clerk, Inngest clients
├── prisma/        # Prisma schema and migrations
├── public/        # Static assets (logo, images)
└── ...
```

---

## ⚡ Getting Started

### 1. **Clone the repository**
```bash
git clone https://github.com/your-username/finsmart.git
cd finsmart
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Set up environment variables**
Create a `.env` file in the root directory and add the following:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
RESEND_API_KEY=your-resend-api-key
ARCJET_KEY=your-arcjet-key
GOOGLE_API_KEY=your-google-api-key
```

### 4. **Run database migrations**
```bash
npx prisma migrate deploy
```

### 5. **Start the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔒 Authentication
- User authentication is handled by [Clerk](https://clerk.com/).
- Sign up and sign in flows are pre-built and secure.

---

## 🗄️ Database
- Uses [Prisma ORM](https://www.prisma.io/) with a PostgreSQL database.
- Models: User, Account, Transaction, Budget
- See `prisma/schema.prisma` for details.

---

## 📧 Email & Notifications
- Transactional emails are sent using [Resend](https://resend.com/) and [React Email](https://react.email/).
- Budget and transaction alerts are automated.

---

## 🤖 AI & Automation
- AI-powered analytics and receipt scanning (Google Generative AI)
- Automated recurring transaction processing (Inngest)

---

## 🧑‍💻 Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License
[MIT](LICENSE)

---

## 🙋 Contact & Support
- **Made with 💗 by ByteBenders**
- For questions, open an issue or contact the maintainer.

---

## 🌟 Demo & Screenshots
> _Add screenshots or a link to a live demo here_

---

## 📊 Stats
- **50K+** Active Users
- **₹2B+** Transactions Tracked
- **99.9%** Uptime
- **4.9/5** User Rating
