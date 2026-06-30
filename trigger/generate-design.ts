import { task } from "@trigger.dev/sdk";

export interface GenerateDesignPayload {
  projectId: string;
  prompt: string;
  canvasSnapshot: {
    nodes: unknown[];
    edges: unknown[];
  };
}

const generateDesignTask = task({
  id: "generate-design",
  maxDuration: 300,
  run: async (payload: GenerateDesignPayload) => {
    // TODO: implement AI canvas generation
    // 1. Call Claude / OpenAI with payload.prompt + payload.canvasSnapshot
    // 2. Parse the model response into node and edge updates
    // 3. Write updates into the Liveblocks room for payload.projectId
    throw new Error("generate-design task not yet implemented");
  },
});
