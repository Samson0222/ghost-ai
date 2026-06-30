import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Find your project ref in the Trigger.dev dashboard → Settings → Project
  project: "proj_YOUR_PROJECT_REF",
  dirs: ["./trigger"],
  maxDuration: 300,
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
