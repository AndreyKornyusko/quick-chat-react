import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodeBlock } from "@/components/demo/CodeBlock";
import { PropsTable } from "@/components/demo/PropsTable";

describe("CodeBlock", () => {
  it("renders code content", () => {
    render(<CodeBlock code="const x = 1;" />);
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<CodeBlock code="test" title="example.ts" />);
    expect(screen.getByText("example.ts")).toBeInTheDocument();
  });

  it("renders language tag when title is provided", () => {
    render(<CodeBlock code="test" title="file" language="typescript" />);
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("renders copy button", () => {
    render(<CodeBlock code="test" />);
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });
});

describe("PropsTable", () => {
  const mockProps = [
    { name: "url", type: "string", default: "", required: true, description: "The URL" },
    { name: "theme", type: "'light' | 'dark'", default: "'light'", required: false, description: "Theme" },
  ];

  it("renders table title", () => {
    render(<PropsTable title="Test Props" props={mockProps} />);
    expect(screen.getByText("Test Props")).toBeInTheDocument();
  });

  it("renders prop names", () => {
    render(<PropsTable title="Props" props={mockProps} />);
    expect(screen.getByText("url")).toBeInTheDocument();
    expect(screen.getByText("theme")).toBeInTheDocument();
  });

  it("renders Required badge for required props", () => {
    render(<PropsTable title="Props" props={mockProps} />);
    const requiredBadges = screen.getAllByText("Required");
    // One in the header, one as a badge
    expect(requiredBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("renders Optional badge for optional props", () => {
    render(<PropsTable title="Props" props={mockProps} />);
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("renders prop types", () => {
    render(<PropsTable title="Props" props={mockProps} />);
    expect(screen.getByText("string")).toBeInTheDocument();
    expect(screen.getByText("'light' | 'dark'")).toBeInTheDocument();
  });

  it("renders descriptions", () => {
    render(<PropsTable title="Props" props={mockProps} />);
    expect(screen.getByText("The URL")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
  });

  it("renders default values", () => {
    render(<PropsTable title="Props" props={mockProps} />);
    expect(screen.getByText("'light'")).toBeInTheDocument();
  });

  it("renders dash for empty defaults", () => {
    render(<PropsTable title="Props" props={mockProps} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });
});
