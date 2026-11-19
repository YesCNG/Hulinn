# Hulinn — Dynamic Luxury Landing Page

A minimal, high-aesthetic mock-up website with a fully dynamic enquiry form powered by **Vercel Serverless Functions**.

---

## 📁 Project Structure

```
hulinn/
├── index.html          # Frontend website with dynamic modal form & state transitions
├── vercel.json         # Vercel configuration & routing
├── package.json        # Project metadata
├── .env.example        # Environment variable templates (Resend, Discord, Slack)
├── api/
│   └── enquiry.js      # Vercel serverless function handling submissions
└── README.md           # Deployment & configuration instructions
```

---

## ⚡ Key Features

1. **Dynamic Form & UX Transitions**:
   - Asynchronous submission using `fetch()` to `/api/enquiry`.
   - Real-time client-side validation and responsive loading feedback (`Transmitting enquiry…`).
   - Clean success state matching the luxury aesthetic when submission succeeds.
   - Elegant error handling with retry capability.
   - Built-in bot anti-spam honeypot field (`_gotcha`).

2. **Vercel Serverless Backend (`/api/enquiry`)**:
   - Zero-configuration serverless endpoint ready for Vercel.
   - Automatically logs submissions into your Vercel Function logs.
   - **Optional Email Delivery**: Connect [Resend](https://resend.com) with a free API key to have submissions sent directly to your email inbox.
   - **Optional Webhook Notifications**: Forward inquiries directly to Discord or Slack channels.

---

## 🚀 How to Host on Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Create a new GitHub repository (e.g. `hulinn-website`).
2. Push the contents of the `hulinn` folder to your repository:
   ```bash
   cd hulinn
   git init
   git add .
   git commit -m "Initial commit of Hulinn website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/hulinn-website.git
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and log in.
4. Click **"Add New..."** → **"Project"**.
5. Select your GitHub repository and click **Deploy**.
   - *Framework Preset*: Other (Vercel automatically detects static HTML + `/api` functions).
   - *Build Command*: None needed.
   - *Output Directory*: None needed.
6. Your site will be live on `https://<your-project>.vercel.app` in under 30 seconds!

---

### Option 2: Deploy via Vercel CLI

If you have Node.js installed:

```bash
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Deploy directly from the hulinn folder
cd hulinn
vercel
```

Follow the interactive prompts to log in and deploy. When you're ready for production:
```bash
vercel --prod
```

---

## 📬 Setting Up Email or Chat Notifications (Optional)

In your Vercel Project Dashboard:
1. Go to **Settings** → **Environment Variables**.
2. Add the following variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Your API key from [resend.com](https://resend.com) | `re_123456789...` |
| `NOTIFICATION_EMAIL` | The email address where you want to receive inquiries | `owner@hulinn.com` |
| `FROM_EMAIL` | *(Optional)* Sender address | `Hulinn Concierge <onboarding@resend.dev>` |
| `DISCORD_WEBHOOK_URL` | *(Optional)* Discord incoming webhook URL | `https://discord.com/api/webhooks/...` |
| `SLACK_WEBHOOK_URL` | *(Optional)* Slack incoming webhook URL | `https://hooks.slack.com/services/...` |

3. Trigger a redeploy (or deploy a commit) for the environment variables to take effect.

---

## 💻 Local Testing with Vercel CLI

To test both frontend and the serverless `/api/enquiry` function locally:

```bash
cd hulinn
npx vercel dev
```
Open [http://localhost:3000](http://localhost:3000) to test the form live.
