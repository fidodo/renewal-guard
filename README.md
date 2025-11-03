[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
![CI](https://github.com/fidodo/renewal-guard/actions/workflows/ci.yml/badge.svg)
![Vercel](https://vercelbadge.vercel.app/api/fidodo/renewal-guard)

# Renewal Guard

<!-- PROJECT LOGO -->
<br />
<p align="center">

  <h3 align="center">Renewal-guard-(Full-stack)</h3>

  <p align="center">
   RENEWAL_GUARD_SUBSCRIPTION_MANAGEMENT
    <br />
    <a href="https://github.com/fidodo/renewal-guard"><strong>Explore the repo »</strong></a>
    <br />
    <br />
    <a href="renewal-guard.vercel.app">View Demo</a>
    ·
    <a href="https://github.com/fidodo/renewal-guard/issues">Report Bug</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [About the Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [note](#note)
- [Contact](#contact)
- [return](#return)

  <!-- ABOUT THE PROJECT -->

## About The Project

![Product Screen Shot1][screenshot1]

![Product Screen Shot2][screenshot2]

🛡️ Renewal Guard

Renewal Guard is a full-stack web platform designed to simplify subscription and contract management. It allows users to track, organize, and receive reminders for upcoming renewals — preventing missed deadlines or unwanted auto-renewals.

The application is built with a Next.js frontend (for a modern, responsive UI) and a Node.js/Express backend (for API and database operations).
Key Features:

📅 Subscription & contract tracking with renewal reminders

🔔 Smart notifications before renewal dates

💻 Responsive dashboard built with Next.js

⚙️ RESTful API powered by Node.js & Express

Tech Stack:

Frontend: Next.js, TypeScript, SCSS

Backend: Node.js, Express

Database: (MongoDB )

Goal:
To help individuals and businesses efficiently manage recurring subscriptions, ensuring financial awareness and eliminating forgotten renewals.

### Built With

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- DEPENDENCIES

```sh
    "@arcjet/inspect": "^1.0.0-beta.11",
    "@arcjet/next": "^1.0.0-beta.11",
    "@arcjet/node": "^1.0.0-beta.10",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@reduxjs/toolkit": "^2.9.0",
    "@upstash/redis": "^1.35.6",
    "@upstash/workflow": "^0.2.19",
    "bcryptjs": "^3.0.2",
    "cheerio": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cookie-parser": "~1.4.4",
    "cors": "^2.8.5",
    "dayjs": "^1.11.18",
    "debug": "~2.6.9",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.544.0",
    "mailparser": "^3.7.5",
    "mongodb": "^6.20.0",
    "mongoose": "^8.18.1",
    "morgan": "~1.9.1",
    "next": "15.5.3",
    "nodemailer": "^7.0.10",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-is": "^19.2.0",
    "react-redux": "^9.2.0",
    "recharts": "^3.2.1",
    "redux-persist": "^6.0.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "tailwind-merge": "^3.3.1",
    "twilio": "^5.9.0",
    "dotenv": "^16.3.1",
    "nodemon": "^3.0.1"
```

### Installation

1. Clone the repo

```sh
git clone https://github.com/fidodo/renewal-guard.git
```

2. cd my-app
3. Install project's dependencies

```sh
npm install
```

3. Start the development server

```sh
npm run dev
```

## ⚙️ Environment Setup

1. Copy the example environment file and add correct .env credentials:
   ```bash
   cp .env.example .env
   ```

```bash
npm run dev
 or
yarn dev
 or
pnpm dev
 or
bun dev




```

## Libraries and purpose inthe project/ steps in usingthose libraries

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

1.  used gmail as email account transporter

2.  go to settings in gmail account

3.  turn 2 step verification

4.  go to manage account search for app password

5.  enter app name and click next

6.  copy app password

twilio
Sends SMS, WhatsApp, or calls programmatically (you’re using it for subscription SMS reminders).

1. used twilio as SMS transporter

2. go to twilio console

3. create account

4. copy account sid and auth token

🗄 Database

mongodb
Official MongoDB driver for Node.js (low-level).

1 login create a project in mongodb atlas

2 create a database cluster

3 choose free options,if rich enough paid option

4 clickon create development button

5 copy username and password, paste password in .env

6 create data base user

7 choose connection method "driver"

8 npm install mongodb, and get the connection string and paste it in .env

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

<!-- CONTACT -->

## Contact

Ayokunle Ogunfidodo - [@Linkedin](linkedin.com/in/ayokunle-ogunfidodo-a862a0153/)

Project Link: [https://github.com/fidodo/renewal-guard](https://github.com/fidodo/renewal-guard)
[Back to top](#renewal-guard)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[issues-shield]: https://img.shields.io/github/issues/fidodo/renewal-guard.svg?style=flat-square
[issues-url]: https://github.com/fidodo/renewal-guard/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/ayokunle-ogunfidodo-a862a0153/
[screenshot1]: https://github.com/fidodo/renewal-guard/blob/main/assets/Screenshot%202025-10-29%20103408.png
[screenshot2]: https://github.com/fidodo/renewal-guard/blob/main/assets/Screenshot%202025-10-29%20103336.png

### return

[Back to top](#renewal-guard)
