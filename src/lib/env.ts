/**
 * Environment variable validation
 * Import this at the top level to fail fast on missing configuration
 */

interface EnvConfig {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL?: string;
  AUTH_TRUST_HOST?: string;
  NODE_ENV: string;
}

function validateEnv(): EnvConfig {
  const required: (keyof EnvConfig)[] = ["DATABASE_URL", "NEXTAUTH_SECRET"];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing
        .map((k) => `  - ${k}`)
        .join("\n")}\n\nPlease check your .env file or Coolify environment variables.`
    );
  }

  // Warn if NEXTAUTH_SECRET is too weak
  const secret = process.env.NEXTAUTH_SECRET!;
  if (secret.length < 32) {
    console.warn(
      "⚠️  NEXTAUTH_SECRET is too short (< 32 chars). Generate a strong one: openssl rand -base64 64"
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: secret,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

export const env = validateEnv();
