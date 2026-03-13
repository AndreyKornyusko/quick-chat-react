import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatButton } from "@/lib/ChatButton";

describe("ChatButton", () => {
  const defaultProps = {
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-key",
  };

  it("renders with default props", () => {
    render(<ChatButton {...defaultProps} />);
    const button = screen.getByRole("button", { name: /open chat/i });
    expect(button).toBeInTheDocument();
  });

  it("shows unread count badge when unreadCount > 0", () => {
    render(<ChatButton {...defaultProps} unreadCount={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not show badge when unreadCount is 0", () => {
    render(<ChatButton {...defaultProps} unreadCount={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows 99+ for large unread counts", () => {
    render(<ChatButton {...defaultProps} unreadCount={150} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<ChatButton {...defaultProps} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("navigates to href when clicked (without onClick)", () => {
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    render(<ChatButton {...defaultProps} href="/chat" />);
    fireEvent.click(screen.getByRole("button"));
    expect(window.location.href).toBe("/chat");

    // Restore
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("prioritizes onClick over href", () => {
    const handleClick = vi.fn();
    render(<ChatButton {...defaultProps} onClick={handleClick} href="/chat" />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies bottom-right position by default", () => {
    render(<ChatButton {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bottom-4");
    expect(button.className).toContain("right-4");
  });

  it("applies bottom-left position", () => {
    render(<ChatButton {...defaultProps} position="bottom-left" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("left-4");
  });

  it("applies correct size classes for sm", () => {
    render(<ChatButton {...defaultProps} size="sm" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-10");
    expect(button.className).toContain("w-10");
  });

  it("applies correct size classes for md (default)", () => {
    render(<ChatButton {...defaultProps} size="md" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-14");
    expect(button.className).toContain("w-14");
  });

  it("applies correct size classes for lg", () => {
    render(<ChatButton {...defaultProps} size="lg" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-16");
    expect(button.className).toContain("w-16");
  });

  it("applies custom badge color", () => {
    render(<ChatButton {...defaultProps} unreadCount={3} badgeColor="#ff0000" />);
    const badge = screen.getByText("3");
    expect(badge.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("renders custom icon", () => {
    render(
      <ChatButton {...defaultProps} icon={<span data-testid="custom-icon">🔔</span>} />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
