// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {};

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent:
      | { type: "AI_THINKING_START" }
      | { type: "AI_THINKING_END" }
      | { type: "AI_STATUS"; message: string }
      | { type: "AI_CANVAS_BATCH"; data: string; replace: boolean }
      | { type: "AI_FEED"; text?: string };

    FeedMessageData: {
      sender: string;
      role: "user" | "assistant";
      content: string;
      timestamp: number;
    };

    RoomInfo: {};
  }
}

export {};
