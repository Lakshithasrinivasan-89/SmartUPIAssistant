# Small Business Smart Assistant (UPI++) 🚀

An AI-powered assistant for small vendors and micro-business owners that automatically tracks sales from UPI SMS/payment messages, analyzes business performance, and provides intelligent insights.

## Project Vision
To empower micro-entrepreneurs (street vendors, kirana stores, tea stalls) with data-driven decision-making tools that are simple, mobile-first, and voice-ready.

## Core Features
- **UPI SMS Parser**: Demo module to parse transaction SMS (amount, name, type) automatically.
- **Smart Dashboard**: Real-time sales, weekly trends, and peak business hour tracking.
- **AI Insight Assistant**: Chat and voice-based interface for querying business data (e.g., "How much did I earn today?").
- **Smart Inventory**: Automated stock alerts and restock suggestions based on sales velocity.
- **Expense Tracking**: Categorized business spending with profit calculation.
- **Reports & Analytics**: Visual charts and downloadable summaries for business health.
- **Multilingual Support**: Placeholder UI and assistant logic for Hindi, Kannada, Tamil, and Telugu.

## Tech Stack
- **Frontend**: Next.js 14, React, Lucide Icons
- **Backend**: Next.js API Routes (Modular Architecture)
- **Database**: Prisma ORM with SQLite (Demo-ready)
- **Styling**: Vanilla CSS with Design System (Premium Aesthetics)
- **AI Logic**: Prompt-based rule engine (Custom Logic)
- **Voice Support**: Web Speech API integration structure

## How this project uses Microsoft Technologies 💻

This project is built to seamlessly scale within the **Microsoft Azure** ecosystem:

- **Azure SQL Database**: For enterprise-grade transaction storage and security.
- **Azure AI Services**:
    - **Language Service**: For high-accuracy NLP parsing of complex UPI messages.
    - **Speech Service**: (Azure Speech SDK) For production-grade multilingual voice commands.
- **Power BI Embedded**: To provide deep dive multi-dimensional business analytics to vendors.
- **Power Automate**: To trigger SMS/WhatsApp alerts for low stock or high sales notifications.
- **Azure App Service**: For robust, scalable hosting of the Next.js application.

---

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd upi-smart-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📸 Hackathon Demo Flow
1. **Dashboard**: View the current sales and profit status.
2. **Transactions**: Click **"Parse UPI SMS"** and paste the sample message to see the automatic extraction in action.
3. **Inventory**: Check **"Low Stock Alerts"** and see "Basmati Rice" restock suggestion.
4. **AI Assistant**: Open the assistant and ask: *"How much did I earn today?"* or click the **Mic** icon for voice demo.
5. **Reports**: View the **"Daily Sales Trend"** and export the performance PDF.

**Hackathon Winner Vision**: We bring the power of high-end ERPs to the palm of a tea-vendor. Simple, Smart, and Scalable.
