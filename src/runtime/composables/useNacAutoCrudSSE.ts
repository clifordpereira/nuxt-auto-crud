export interface AutoCrudEvent {
  table: string;
  action: "create" | "update" | "delete";
  data: Record<string, unknown>;
  primaryKey: string | number;
}

export function useNacAutoCrudSSE(onEvent: (e: AutoCrudEvent) => void) {
  let source: EventSource | null = null;

  onMounted(() => {
    if (typeof window === "undefined" || !("EventSource" in window)) return;

    source = new EventSource(`/api/_nac/_sse`);

    // 1. Connection Error Handler
    source.onerror = (err) => {
      console.error("[NAC] SSE Connection Error:", err);
    };

    // 2. Custom Event Listener
    source.addEventListener("crud", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        onEvent(payload);
      } catch (err) {
        console.error("[NAC] SSE Parse Error:", err);
      }
    });
  });

  onBeforeUnmount(() => {
    source?.close();
  });
}
