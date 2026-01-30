import { it, expect, vi, describe, afterEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { h } from "vue";
import { useAutoCrudSSE, type AutoCrudEvent } from "../../src/runtime/composables/useAutoCrudSSE";

describe("NAC Core: useAutoCrudSSE", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("initializes EventSource and cleans up on unmount", async () => {
    const closeMock = vi.fn();
    const addEventListenerMock = vi.fn();

    const MockEventSource = vi.fn(function () {
      return {
        addEventListener: addEventListenerMock,
        close: closeMock,
      };
    });
    vi.stubGlobal("EventSource", MockEventSource);

    const wrapper = await mountSuspended({
      setup() {
        useAutoCrudSSE(() => {});
        return () => h("div");
      },
    });

    expect(MockEventSource).toHaveBeenCalledWith("/api/sse");
    expect(addEventListenerMock).toHaveBeenCalledWith(
      "crud",
      expect.any(Function),
    );

    wrapper.unmount();
    expect(closeMock).toHaveBeenCalled();
  });

  it("correctly parses and filters stream data", async () => {
    const onEvent = vi.fn();
    let trigger: Function;

    vi.stubGlobal(
      "EventSource",
      vi.fn(function () {
        return {
          addEventListener: (_: string, cb: Function) => {
            trigger = cb;
          },
          close: vi.fn(),
        };
      }),
    );

    await mountSuspended({
      setup() {
        useAutoCrudSSE(onEvent);
        return () => h("div");
      },
    });

    const mockPayload: AutoCrudEvent = {
      table: "users",
      action: "create",
      data: { id: 1 },
      primaryKey: 1,
    };
    trigger!({ data: JSON.stringify(mockPayload) });

    expect(onEvent).toHaveBeenCalledWith(mockPayload);
  });
});
