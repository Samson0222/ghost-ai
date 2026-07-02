import { defineConfig } from "@trigger.dev/sdk";

const projectRef = process.env.TRIGGER_PROJECT_REF;
if (!projectRef) {
  throw new Error("TRIGGER_PROJECT_REF environment variable is required");
}

export default defineConfig({
  project: projectRef,
  runtime: 'node',
  dirs: ["./trigger"],
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
