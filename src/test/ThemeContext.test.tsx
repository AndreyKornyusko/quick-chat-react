import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

const ThemeConsumer = () => {
  const { theme, resolved, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button data-testid="set-light" onClick={() => setTheme("light")}>Light</button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>Dark</button>
      <button data-testid="set-system" onClick={() => setTheme("system")}>System</button>
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to system theme", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("system");
  });

  it("accepts initialTheme prop", () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("switches to light theme", () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.click(screen.getByTestId("set-light"));
    });
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });

  it("persists theme to localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.click(screen.getByTestId("set-dark"));
    });
    expect(localStorage.getItem("chat-theme")).toBe("dark");
  });

  it("reads theme from localStorage when no initialTheme", () => {
    localStorage.setItem("chat-theme", "dark");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("initialTheme overrides localStorage", () => {
    localStorage.setItem("chat-theme", "dark");
    render(
      <ThemeProvider initialTheme="light">
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("adds dark class to documentElement when dark", () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when switching to light", () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.click(screen.getByTestId("set-light"));
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
