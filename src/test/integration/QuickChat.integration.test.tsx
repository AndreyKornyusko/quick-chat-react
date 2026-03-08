import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QuickChat } from "@/lib/QuickChat";

// Mock Supabase client creation
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

const mockGetSession = vi.fn(() =>
  Promise.resolve({ data: { session: null }, error: null })
);

const mockSignOut = vi.fn(() => Promise.resolve({ error: null }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: mockOnAuthStateChange,
      getSession: mockGetSession,
      signOut: mockSignOut,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        neq: vi.fn(() => ({
          or: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  })),
}));

describe("QuickChat Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it("renders loading spinner then auth screen when no session (built-in mode)", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        authMode="built-in"
      />
    );

    // Should eventually show auth screen (login form)
    await waitFor(() => {
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  it("renders chat directly in external auth mode with userData", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        authMode="external"
        userData={{
          id: "user-123",
          name: "Test User",
          avatar: "https://example.com/avatar.png",
          email: "test@example.com",
        }}
      />
    );

    // In external mode, should skip auth and render chat app directly
    // ChatApp renders sidebar + window layout
    await waitFor(() => {
      const container = document.querySelector(".flex.h-screen");
      expect(container).toBeTruthy();
    });
  });

  it("applies custom height and width", () => {
    const { container } = render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        authMode="external"
        userData={{ id: "user-1", name: "User" }}
        height="500px"
        width="400px"
      />
    );

    const styledDiv = container.querySelector('[style*="height: 500px"]');
    expect(styledDiv).toBeTruthy();
    expect(styledDiv?.getAttribute("style")).toContain("width: 400px");
  });

  it("uses default height/width when not specified", () => {
    const { container } = render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        authMode="external"
        userData={{ id: "user-1", name: "User" }}
      />
    );

    const styledDiv = container.querySelector('[style*="height: 100vh"]');
    expect(styledDiv).toBeTruthy();
    expect(styledDiv?.getAttribute("style")).toContain("width: 100%");
  });

  it("renders with light theme", () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        theme="light"
        authMode="external"
        userData={{ id: "user-1", name: "User" }}
      />
    );

    // Should render without errors
    expect(document.body).toBeTruthy();
  });

  it("renders with dark theme", () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        theme="dark"
        authMode="external"
        userData={{ id: "user-1", name: "User" }}
      />
    );

    expect(document.body).toBeTruthy();
  });

  it("renders with all feature flags disabled", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        authMode="external"
        userData={{ id: "user-1", name: "User" }}
        showGroups={false}
        allowVoiceMessages={false}
        allowFileUpload={false}
        allowReactions={false}
        showOnlineStatus={false}
        showReadReceipts={false}
      />
    );

    await waitFor(() => {
      const container = document.querySelector(".flex.h-screen");
      expect(container).toBeTruthy();
    });
  });

  it("renders with all feature flags enabled (defaults)", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        authMode="external"
        userData={{ id: "user-1", name: "User" }}
        showGroups={true}
        allowVoiceMessages={true}
        allowFileUpload={true}
        allowReactions={true}
        showOnlineStatus={true}
        showReadReceipts={true}
      />
    );

    await waitFor(() => {
      const container = document.querySelector(".flex.h-screen");
      expect(container).toBeTruthy();
    });
  });

  it("built-in mode shows auth form fields", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-anon-key"
        authMode="built-in"
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    // Password field should be present in login mode
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
  });
});
