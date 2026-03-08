import { describe, it, expect } from "vitest";
import type { QuickChatProps, ChatButtonProps, UserData, QuickChatConfig } from "@/lib/types";

describe("Library Types", () => {
  it("UserData interface has required fields", () => {
    const user: UserData = { id: "123", name: "Test User" };
    expect(user.id).toBe("123");
    expect(user.name).toBe("Test User");
    expect(user.avatar).toBeUndefined();
    expect(user.description).toBeUndefined();
    expect(user.email).toBeUndefined();
  });

  it("UserData interface supports optional fields", () => {
    const user: UserData = {
      id: "123",
      name: "Test User",
      avatar: "https://example.com/avatar.png",
      description: "A test user",
      email: "test@example.com",
    };
    expect(user.avatar).toBe("https://example.com/avatar.png");
    expect(user.description).toBe("A test user");
    expect(user.email).toBe("test@example.com");
  });

  it("QuickChatConfig has all feature flags", () => {
    const config: QuickChatConfig = {
      showGroups: true,
      allowVoiceMessages: true,
      allowFileUpload: true,
      allowReactions: true,
      showOnlineStatus: true,
      showReadReceipts: true,
    };
    expect(config.showGroups).toBe(true);
    expect(config.allowVoiceMessages).toBe(true);
    expect(config.allowFileUpload).toBe(true);
    expect(config.allowReactions).toBe(true);
    expect(config.showOnlineStatus).toBe(true);
    expect(config.showReadReceipts).toBe(true);
  });

  it("QuickChatConfig supports disabled flags", () => {
    const config: QuickChatConfig = {
      showGroups: false,
      allowVoiceMessages: false,
      allowFileUpload: false,
      allowReactions: false,
      showOnlineStatus: false,
      showReadReceipts: false,
    };
    expect(Object.values(config).every((v) => v === false)).toBe(true);
  });

  it("QuickChatProps has correct defaults conceptually", () => {
    // Verify that QuickChatProps type compiles with minimal props
    const minimalProps: QuickChatProps = {
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "test-key",
    };
    expect(minimalProps.supabaseUrl).toBe("https://test.supabase.co");
    expect(minimalProps.theme).toBeUndefined();
    expect(minimalProps.authMode).toBeUndefined();
    expect(minimalProps.showGroups).toBeUndefined();
  });

  it("QuickChatProps accepts all optional props", () => {
    const fullProps: QuickChatProps = {
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "test-key",
      userData: { id: "1", name: "User" },
      theme: "dark",
      authMode: "external",
      showGroups: false,
      allowVoiceMessages: false,
      allowFileUpload: true,
      allowReactions: true,
      showOnlineStatus: true,
      showReadReceipts: false,
      height: "600px",
      width: "400px",
      onUnreadCountChange: () => {},
      onConversationSelect: () => {},
    };
    expect(fullProps.theme).toBe("dark");
    expect(fullProps.authMode).toBe("external");
    expect(fullProps.height).toBe("600px");
  });

  it("ChatButtonProps has correct structure", () => {
    const buttonProps: ChatButtonProps = {
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "test-key",
      position: "bottom-left",
      size: "lg",
      unreadCount: 5,
    };
    expect(buttonProps.position).toBe("bottom-left");
    expect(buttonProps.size).toBe("lg");
    expect(buttonProps.unreadCount).toBe(5);
  });

  it("ChatButtonProps accepts onClick and href", () => {
    const withClick: ChatButtonProps = {
      supabaseUrl: "url",
      supabaseAnonKey: "key",
      onClick: () => {},
    };
    const withHref: ChatButtonProps = {
      supabaseUrl: "url",
      supabaseAnonKey: "key",
      href: "/chat",
    };
    expect(withClick.onClick).toBeDefined();
    expect(withHref.href).toBe("/chat");
  });

  it("Theme values are restricted to valid options", () => {
    const themes: QuickChatProps["theme"][] = ["light", "dark", "system"];
    expect(themes).toHaveLength(3);
  });

  it("AuthMode values are restricted to valid options", () => {
    const modes: QuickChatProps["authMode"][] = ["built-in", "external"];
    expect(modes).toHaveLength(2);
  });

  it("ChatButton size values are restricted", () => {
    const sizes: ChatButtonProps["size"][] = ["sm", "md", "lg"];
    expect(sizes).toHaveLength(3);
  });

  it("ChatButton position values are restricted", () => {
    const positions: ChatButtonProps["position"][] = ["bottom-right", "bottom-left"];
    expect(positions).toHaveLength(2);
  });
});
