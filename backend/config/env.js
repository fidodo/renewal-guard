import { config } from "dotenv";

// Only load .env files in development
if (process.env.NODE_ENV !== "production") {
  config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
}

// Debug logging (only in development)
if (process.env.NODE_ENV !== "production") {
  Object.keys(process.env).forEach((key) => {
    if (key.includes("DB") || key.includes("MONGO")) {
      console.log(`  ${key}: ${process.env[key]}`);
    }
  });
}

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET_KEY,
  JWT_EXPIRATION_TIME,
  JWT_REFRESH_SECRET_KEY,
  JWT_FRESH_EXPIRATION_TIME,
  ARCJET_KEY,
  ARCJET_ENV,
  QSTASH_URL,
  QSTASH_TOKEN,
  SERVER_URL,
  EMAIL_PASSWORD,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY,
  NEXT_PUBLIC_API_URL,
} = process.env;
