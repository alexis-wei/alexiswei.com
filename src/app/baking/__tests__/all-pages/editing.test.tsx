// Getting out of editing: the pinned "done editing" button on every /baking
// page while unlocked, and the quiet "edit" link for visitors.

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isEditor } from "@/lib/baking/auth";
import BakingLayout from "@/app/baking/layout";
import { BakingFooter } from "@/components/baking/BakingHeader";

vi.mock("@/app/baking/actions", () => ({
  lock: vi.fn(async () => {}),
  unlock: vi.fn(async () => null),
}));
vi.mock("@/lib/baking/auth", () => ({ isEditor: vi.fn(async () => false) }));
vi.mock("next/link", () => ({
  default: ({ href, ...props }: { href: string }) => (
    <a href={href} {...props} />
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderLayout() {
  render(await BakingLayout({ children: <p>page</p> }));
}

describe("done editing", () => {
  it("is pinned to the screen on every page while editing", async () => {
    vi.mocked(isEditor).mockResolvedValue(true);
    await renderLayout();
    const button = screen.getByRole("button", { name: "done editing" });
    expect(button.getAttribute("type")).toBe("submit");
    // Fixed to the viewport, so it's there however far down the page is.
    expect(button.closest("form")!.className).toContain("fixed");
  });

  it("isn't shown to visitors", async () => {
    vi.mocked(isEditor).mockResolvedValue(false);
    await renderLayout();
    expect(screen.queryByText("done editing")).toBeNull();
    expect(screen.getByText("page")).toBeTruthy();
  });
});

describe("list page footer", () => {
  it("offers visitors an “edit” link", () => {
    render(<BakingFooter editor={false} />);
    expect(screen.getByText("edit").getAttribute("href")).toBe("/baking/edit");
  });

  it("is empty while editing (the pinned button takes its place)", () => {
    const { container } = render(<BakingFooter editor />);
    expect(container.innerHTML).toBe("");
    expect(screen.queryByText("lock editing")).toBeNull();
  });
});
