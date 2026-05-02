import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const e2eDataFile = fileURLToPath(new URL("../api/data/e2e-db.json", import.meta.url));

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: "http://127.0.0.1:5174",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: [
    {
      command: "npm run reset-dev-data --workspace @ecclesiaos/api && npm run start --workspace @ecclesiaos/api",
      cwd: "../..",
      env: {
        PORT: "4100",
        ECCLESIAOS_DATA_FILE: e2eDataFile,
        ECCLESIAOS_DATA_PROVIDER: "json",
        AUTH_TOKEN_SECRET: "ecclesiaos-e2e-secret"
      },
      reuseExistingServer: false,
      timeout: 30000,
      url: "http://127.0.0.1:4100/health"
    },
    {
      command: "npm run dev --workspace @ecclesiaos/web -- --host 127.0.0.1 --port 5174",
      cwd: "../..",
      env: {
        VITE_API_BASE_URL: "http://127.0.0.1:4100"
      },
      reuseExistingServer: false,
      timeout: 30000,
      url: "http://127.0.0.1:5174"
    }
  ]
});
