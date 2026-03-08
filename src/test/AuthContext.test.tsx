import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QuickChatProvider } from "@/lib/QuickChatProvider";

const defaultConfig = {
  showGroups: true,
  allowVoiceMessages: true,
  allowFileUpload: true,
  allowReactions: true,
  showOnlineStatus: true,
  showReadReceipts: true,
};

const AuthConsumer = () => {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user-id">{user?.id ?? "none"}</span>
      <span data-testid="user-name">{(user as any)?.user_metadata?.display_name ?? "none"}</span>
    </div>
  );
};

const Wrapper = ({ children, authMode, userData }: any) => (
  <QuickChatProvider supabaseUrl="https://test.supabase.co" supabaseAnonKey="test-key" config={defaultConfig}>
    <AuthProvider authMode={authMode} userData={userData}>
      {children}
    </AuthProvider>
  </QuickChatProvider>
);

describe("AuthContext", () => {
  it("external auth mode provides user from userData", () => {
    render(
      <Wrapper authMode="external" userData={{ id: "user-123", name: "John Doe", avatar: "https://example.com/avatar.png" }}>
        <AuthConsumer />
      </Wrapper>
    );

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user-id").textContent).toBe("user-123");
    expect(screen.getByTestId("user-name").textContent).toBe("John Doe");
  });

  it("external auth mode without userData provides no user", () => {
    render(
      <Wrapper authMode="external">
        <AuthConsumer />
      </Wrapper>
    );

    // Without userData in external mode, user should be null
    expect(screen.getByTestId("user-id").textContent).toBe("none");
  });

  it("built-in auth mode starts with loading state", () => {
    render(
      <Wrapper authMode="built-in">
        <AuthConsumer />
      </Wrapper>
    );

    // built-in mode starts loading (waiting for supabase session)
    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  it("defaults to built-in auth mode", () => {
    render(
      <Wrapper>
        <AuthConsumer />
      </Wrapper>
    );

    // Default is built-in, which starts loading
    expect(screen.getByTestId("loading").textContent).toBe("true");
  });
});
