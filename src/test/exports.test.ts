import { describe, it, expect } from "vitest";

describe("Library Exports", () => {
  it("exports QuickChat component", async () => {
    const lib = await import("@/lib/index");
    expect(lib.QuickChat).toBeDefined();
    expect(typeof lib.QuickChat).toBe("function");
  });

  it("exports ChatButton component", async () => {
    const lib = await import("@/lib/index");
    expect(lib.ChatButton).toBeDefined();
    expect(typeof lib.ChatButton).toBe("function");
  });

  it("does not export internal provider directly", async () => {
    const lib = await import("@/lib/index");
    // QuickChatProvider should be internal, not exported from index
    expect((lib as any).QuickChatProvider).toBeUndefined();
  });
});
