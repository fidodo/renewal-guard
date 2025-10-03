This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

🔐 Arcjet packages (security & rate limiting)

@arcjet/inspect
Helps inspect and analyze requests in your app for debugging and observability. Useful for checking how Arcjet is applying rate limiting and bot protection.

@arcjet/next
Arcjet integration for Next.js apps. It protects your frontend routes (like /api) from abuse (e.g., too many requests, bots, etc.).

@arcjet/node
Arcjet integration for Node.js backend (like your Express app). Helps secure APIs against spam, scraping, and brute-force attacks.

🔄 State management

@reduxjs/toolkit
The official, modern way to use Redux in React apps. Makes global state management easier (with slices, reducers, async thunks).

🛠 Workflows & queues

@upstash/workflow
A serverless workflow engine by Upstash. Helps you schedule jobs (like your subscription reminder emails/SMS) in a scalable way without running a cron server.

🔑 Authentication & security

bcryptjs
Library for hashing and comparing passwords. Securely stores user credentials.

jsonwebtoken
For creating and verifying JWT tokens (used for login sessions, auth middleware).

🎨 Styling utilities

class-variance-authority
A utility for managing reusable variant-based Tailwind CSS classes (e.g., button sizes, colors).

clsx
Small utility to conditionally join class names (clsx("btn", isActive && "btn-active")).

tailwind-merge
Merges Tailwind class names intelligently (so p-2 p-4 becomes p-4). Avoids class conflicts.

lucide-react
Icon library for React. Modern replacement for Feather icons.

🍪 Middleware & utilities

cookie-parser
Express middleware to parse cookies (req.cookies). Useful for JWT/session tokens.

dotenv
Loads environment variables from .env files.

dayjs
Lightweight date/time library (for formatting, differences, reminders).

debug
Debugging utility. Lets you add debug logs with namespaces (e.g., DEBUG=myapp:\*).

morgan
HTTP request logger for Express (logs method, URL, status, response time).

📧 Communication

nodemailer
Sends emails from Node.js (like your subscription renewal reminders).

# i used gmail as email account transporter

# 1. go to settings in gmail account

# 2. turn 2 step verification

# 3. go to manage account search for app password

# 4. enter app name and click next

# 5. copy app password

twilio
Sends SMS, WhatsApp, or calls programmatically (you’re using it for subscription SMS reminders).

# i used twilio as SMS transporter

# 1. go to twilio console

# 2. create account

# 3. copy account sid and auth token

🗄 Database

mongodb
Official MongoDB driver for Node.js (low-level).

# login create a project in mongodb atlas

# create a database cluster

# choose free options,if rich enough paid option

# clickon create development button

# copy username and password, paste password in .env

# create data base user

# choose connection method "driver"

# nminstall mongodb, and get the connection string and paste it in .env

mongoose
ODM (Object Data Modeling) library for MongoDB. Lets you define schemas, models, and interact with MongoDB in a structured way.

workflow
is like taskscheduling system or workflow engine. It helps you schedule jobs (like your subscription reminder emails/SMS) in a scalable way without running a cron server. or apirequest can trigger a workflow to happen.

Model (Mongoose model)

Represents the data structure and database logic.

Example: Subscription schema defines fields like name, price, startDate.

Think of it as: “How data looks and is stored in MongoDB.”

Controller

Contains the business logic (what happens when a request comes in).

Uses models to query or update the database.

Example: createSubscription validates request data, saves it to DB via Subscription.create().

Middleware

Functions that run before the controller.

Used for tasks like authentication, validation, logging.

Example: authorize checks if the user is logged in before allowing access to /subscriptions.

Routes (Router)

Define the API endpoints (URLs) and map them to controllers (and optional middlewares).

Example:

subscriptionRouter.post("/", authorize, createSubscription);

➝ When POST /subscriptions is called, Express runs authorize middleware first, then createSubscription controller.

Config

Handles environment setup: database connection, server port, JWT secrets, etc.

Example: config/db.js connects to MongoDB, config/index.js loads .env.

🔗 Relationships Between Them
Client (Frontend / Postman)
|
v
Routes ---------------------------+
| |
Middlewares (authorize, validate) |
| |
Controllers (handle requests) |
| |
Models (Mongoose - Subscription) |
| |
Database (MongoDB) <---------------+

🖼️ Imagined Relationship (Analogy)

Think of it like a restaurant 🍽️:

Config = The kitchen setup (stoves, ovens, ingredients list, rules).

Routes = The menu (what customers can order: /subscriptions, /users).

Middleware = The waiter checking ID / allergies before passing the order.

Controller = The chef preparing the dish (business logic).

Model = The recipe book + pantry (data structure + DB).

Database = The actual food storage (MongoDB).

So when a customer (frontend) orders:

Customer asks: "POST /subscriptions (make me a subscription)."

Waiter (middleware) checks ID (authentication).

Chef (controller) takes recipe (model) and cooks (runs logic).

Kitchen (database) provides ingredients (data).

Customer gets their meal (response JSON).

⚡ Example Flow in Your App

POST /subscriptions

Route says: “Call authorize → then createSubscription.”

Middleware (authorize) checks JWT token.

Controller (createSubscription) calls Subscription.create(req.body).

Model (Subscription) saves to MongoDB.

Response: { message: "Subscription created successfully" }.
