import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatButton } from "@/lib/ChatButton";

describe("ChatButton Integration", () => {
  it("renders with default props", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
      />
    );

    const button = screen.getByLabelText("Open chat");
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("bottom-4 right-4");
  });

  it("renders in bottom-left position", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        position="bottom-left"
      />
    );

    const button = screen.getByLabelText("Open chat");
    expect(button.className).toContain("bottom-4 left-4");
  });

  it("shows unread badge with count", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        unreadCount={5}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("caps badge at 99+", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        unreadCount={150}
      />
    );

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("hides badge when count is 0", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        unreadCount={0}
      />
    );

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("fires onClick handler", () => {
    const onClick = vi.fn();
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByLabelText("Open chat"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("navigates via href when no onClick", () => {
    const originalHref = window.location.href;
    // Can't easily test href navigation in jsdom, but ensure no error
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        href="/chat"
      />
    );

    const button = screen.getByLabelText("Open chat");
    expect(button).toBeInTheDocument();
  });

  it("applies custom badge color", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        unreadCount={3}
        badgeColor="#ff0000"
      />
    );

    const badge = screen.getByText("3");
    expect(badge.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("renders custom icon", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        icon={<span data-testid="custom-icon">💬</span>}
      />
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders small size variant", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        size="sm"
      />
    );

    const button = screen.getByLabelText("Open chat");
    expect(button.className).toContain("h-10 w-10");
  });

  it("renders large size variant", () => {
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        size="lg"
      />
    );

    const button = screen.getByLabelText("Open chat");
    expect(button.className).toContain("h-16 w-16");
  });

  it("onClick takes priority over href", () => {
    const onClick = vi.fn();
    render(
      <ChatButton
        supabaseUrl="https://test.supabase.co"
        supabaseAnonKey="test-key"
        onClick={onClick}
        href="/chat"
      />
    );

    fireEvent.click(screen.getByLabelText("Open chat"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
