import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuickChat } from "@/lib/QuickChat";

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResetPasswordForEmail = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
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

describe("Auth Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows login form by default in built-in mode", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        authMode="built-in"
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    });
  });

  it("can switch to signup mode", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        authMode="built-in"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Регистрация")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Регистрация"));

    await waitFor(() => {
      expect(screen.getByLabelText(/Имя/i)).toBeInTheDocument();
    });
  });

  it("can switch to forgot password mode", async () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        authMode="built-in"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Забыли пароль?")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Забыли пароль?"));

    await waitFor(() => {
      // Password field should be hidden in forgot mode
      expect(screen.queryByLabelText(/Пароль/i)).not.toBeInTheDocument();
      expect(screen.getByText("Отправить ссылку")).toBeInTheDocument();
    });
  });

  it("calls signInWithPassword on login submit", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        authMode="built-in"
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Пароль/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Войти"));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("skips auth entirely in external mode", () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        authMode="external"
        userData={{ id: "ext-user", name: "External User" }}
      />
    );

    // Should NOT show login form
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    // Should render the chat layout
    expect(document.querySelector(".flex.h-screen")).toBeTruthy();
  });

  it("external mode without userData still renders (no user)", () => {
    render(
      <QuickChat
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        authMode="external"
      />
    );

    // Should render chat layout (no auth gate)
    expect(document.querySelector(".flex.h-screen")).toBeTruthy();
  });
});
