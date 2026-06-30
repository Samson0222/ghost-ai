import { task } from "@trigger.dev/sdk";

export interface GenerateSpecPayload {
  projectId: string;
  canvasSnapshot: {
    nodes: unknown[];
    edges: unknown[];
  };
}

const generateSpecTask = task({
  id: "generate-spec",
  maxDuration: 300,
  run: async (payload: GenerateSpecPayload) => {
    // TODO: implement spec generation
    // 1. Call Claude / OpenAI with payload.canvasSnapshot as context
    // 2. Generate a Markdown technical spec from the graph
    // 3. Upload the Markdown to Vercel Blob at specs/{projectId}/{specId}.md
    // 4. Save the spec record + blob URL to the database
    throw new Error("generate-spec task not yet implemented");
  },
});
