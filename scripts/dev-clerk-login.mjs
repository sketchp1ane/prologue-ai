#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_NEXT_PATH = "/dashboard";
const DEFAULT_TOKEN_TTL_SECONDS = 120;

function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  const entries = {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
    entries[key] = value;
  }

  return entries;
}

function loadLocalEnv() {
  return {
    ...parseEnvFile(resolve(process.cwd(), ".env")),
    ...parseEnvFile(resolve(process.cwd(), ".env.local")),
    ...process.env,
  };
}

function parseNextPathArg(argv) {
  const equalsArg = argv.find((arg) => arg.startsWith("--next="));

  if (equalsArg) {
    return equalsArg.slice("--next=".length);
  }

  const nextIndex = argv.indexOf("--next");

  if (nextIndex >= 0) {
    return argv[nextIndex + 1];
  }

  return DEFAULT_NEXT_PATH;
}

function sanitizeNextPath(value) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return DEFAULT_NEXT_PATH;
  }

  return value;
}

function requireEnv(env, key) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing ${key}. Add it to .env.local before running.`);
  }

  return value;
}

async function createSignInToken({ secretKey, userId }) {
  const response = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    body: JSON.stringify({
      expires_in_seconds: DEFAULT_TOKEN_TTL_SECONDS,
      user_id: userId,
    }),
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.errors?.[0]?.long_message ||
      body?.errors?.[0]?.message ||
      body?.message ||
      response.statusText;

    throw new Error(`Clerk sign-in token request failed: ${message}`);
  }

  if (!body?.token) {
    throw new Error("Clerk did not return a sign-in token.");
  }

  return body.token;
}

async function main() {
  const env = loadLocalEnv();
  const appUrl = env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
  const nextPath = sanitizeNextPath(parseNextPathArg(process.argv.slice(2)));
  const secretKey = requireEnv(env, "CLERK_SECRET_KEY");
  const userId = requireEnv(env, "CLERK_TEST_USER_ID");
  const token = await createSignInToken({ secretKey, userId });
  const url = new URL("/dev/clerk-ticket", appUrl);

  url.searchParams.set("token", token);
  url.searchParams.set("next", nextPath);

  console.log("Open this one-time local Clerk login URL:");
  console.log(url.toString());
  console.log(`Expires in ${DEFAULT_TOKEN_TTL_SECONDS} seconds.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
