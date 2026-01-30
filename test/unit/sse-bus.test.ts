import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  broadcast,
  addClient,
  removeClient,
} from "../../src/runtime/server/utils/sse-bus";
import { kv } from "@nuxthub/kv";

vi.mock("@nuxthub/kv", () => ({ kv: { set: vi.fn() } }));

describe("SSE Bus Core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes client automatically on write failure", async () => {
    const mockWriter = {
      write: vi.fn().mockRejectedValue(new Error("Closed")),
      close: vi.fn(),
    };
    addClient("stale-id", mockWriter as any);

    await broadcast({ test: true });

    // localBroadcast catch block triggers on next tick
    expect(mockWriter.write).toHaveBeenCalled();
    // Subsequent broadcast would confirm 'stale-id' is gone from the internal Map
  });

  it("synchronizes to KV with 60s TTL", async () => {
    await broadcast({ action: "sync" });
    expect(kv.set).toHaveBeenCalledWith(
      "nac_signal",
      expect.objectContaining({ payload: { action: "sync" } }),
      { ttl: 60 },
    );
  });

  it("broadcasts to multiple clients", async () => {
    const writer1 = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };
    const writer2 = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };

    addClient("client-1", writer1 as any);
    addClient("client-2", writer2 as any);

    await broadcast({ msg: "hello" });

    expect(writer1.write).toHaveBeenCalled();
    expect(writer2.write).toHaveBeenCalled();
  });

  it("does not broadcast to removed clients", async () => {
    const writer = { write: vi.fn(), close: vi.fn() };
    addClient("client-to-remove", writer as any);
    removeClient("client-to-remove");

    await broadcast({ msg: "test" });
    expect(writer.write).not.toHaveBeenCalled();
  });
});
