import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickChatProvider, useSupabase, useConfig } from "@/lib/QuickChatProvider";

const defaultConfig = {
  showGroups: true,
  allowVoiceMessages: true,
  allowFileUpload: true,
  allowReactions: true,
  showOnlineStatus: true,
  showReadReceipts: true,
};

// Test component that consumes the context
const ConfigConsumer = () => {
  const config = useConfig();
  return (
    <div>
      <span data-testid="showGroups">{String(config.showGroups)}</span>
      <span data-testid="allowVoice">{String(config.allowVoiceMessages)}</span>
      <span data-testid="allowFile">{String(config.allowFileUpload)}</span>
      <span data-testid="allowReactions">{String(config.allowReactions)}</span>
      <span data-testid="showOnline">{String(config.showOnlineStatus)}</span>
      <span data-testid="showRead">{String(config.showReadReceipts)}</span>
    </div>
  );
};

const SupabaseConsumer = () => {
  const supabase = useSupabase();
  return <span data-testid="supabase-exists">{supabase ? "yes" : "no"}</span>;
};

describe("QuickChatProvider", () => {
  it("provides config values to children", () => {
    render(
      <QuickChatProvider supabaseUrl="https://test.supabase.co" supabaseAnonKey="test-key" config={defaultConfig}>
        <ConfigConsumer />
      </QuickChatProvider>
    );

    expect(screen.getByTestId("showGroups").textContent).toBe("true");
    expect(screen.getByTestId("allowVoice").textContent).toBe("true");
    expect(screen.getByTestId("allowFile").textContent).toBe("true");
    expect(screen.getByTestId("allowReactions").textContent).toBe("true");
    expect(screen.getByTestId("showOnline").textContent).toBe("true");
    expect(screen.getByTestId("showRead").textContent).toBe("true");
  });

  it("provides config with disabled flags", () => {
    const disabledConfig = {
      showGroups: false,
      allowVoiceMessages: false,
      allowFileUpload: false,
      allowReactions: false,
      showOnlineStatus: false,
      showReadReceipts: false,
    };

    render(
      <QuickChatProvider supabaseUrl="https://test.supabase.co" supabaseAnonKey="test-key" config={disabledConfig}>
        <ConfigConsumer />
      </QuickChatProvider>
    );

    expect(screen.getByTestId("showGroups").textContent).toBe("false");
    expect(screen.getByTestId("allowVoice").textContent).toBe("false");
    expect(screen.getByTestId("allowFile").textContent).toBe("false");
    expect(screen.getByTestId("allowReactions").textContent).toBe("false");
    expect(screen.getByTestId("showOnline").textContent).toBe("false");
    expect(screen.getByTestId("showRead").textContent).toBe("false");
  });

  it("creates a supabase client instance", () => {
    render(
      <QuickChatProvider supabaseUrl="https://test.supabase.co" supabaseAnonKey="test-key" config={defaultConfig}>
        <SupabaseConsumer />
      </QuickChatProvider>
    );

    expect(screen.getByTestId("supabase-exists").textContent).toBe("yes");
  });

  it("throws error when useSupabase is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<SupabaseConsumer />);
    }).toThrow("useQuickChat must be used within QuickChatProvider");

    consoleSpy.mockRestore();
  });

  it("throws error when useConfig is used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<ConfigConsumer />);
    }).toThrow("useQuickChat must be used within QuickChatProvider");

    consoleSpy.mockRestore();
  });
});
