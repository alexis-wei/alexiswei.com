// A recipe's contents on its page: pasting it as text, and reading it.

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { updateRecipe } from "@/app/baking/actions";
import { RecipeSection } from "@/components/baking/RecipeSection";

vi.mock("@/app/baking/actions", () => ({
  addRecipeFile: vi.fn(),
  deleteRecipeFile: vi.fn(async () => {}),
  updateRecipe: vi.fn(async () => {}),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function Recipe({
  text = "",
  editable = true,
}: {
  text?: string;
  editable?: boolean;
}) {
  return (
    <RecipeSection
      recipe={{ id: "r1", name: "loaf", url: "", text, files: [] }}
      editable={editable}
    />
  );
}

const lines = (n: number) =>
  Array.from({ length: n }, (_, i) => `line ${i + 1}`).join("\n");

describe("pasting a recipe", () => {
  it("saves the pasted text to the recipe, as written", async () => {
    render(<Recipe />);
    const box = screen.getByLabelText("Recipe");
    expect(box.getAttribute("placeholder")).toBe("paste the recipe");

    const pasted = "225g butter\n2 tbsp miso\n\nbake 11 min";
    fireEvent.change(box, { target: { value: pasted } });
    await act(async () => {
      fireEvent.blur(box);
    });
    expect(updateRecipe).toHaveBeenLastCalledWith("r1", { text: pasted });
  });

  it("saves a pasted link to the recipe", async () => {
    render(<Recipe />);
    const link = screen.getByPlaceholderText("paste the recipe's link");
    fireEvent.change(link, { target: { value: "https://example.com/loaf" } });
    await act(async () => {
      fireEvent.blur(link);
    });
    expect(updateRecipe).toHaveBeenLastCalledWith("r1", {
      url: "https://example.com/loaf",
    });
  });

  it("shows a saved recipe for editing", () => {
    render(<Recipe text={"flour\nwater"} />);
    expect((screen.getByLabelText("Recipe") as HTMLTextAreaElement).value).toBe(
      "flour\nwater",
    );
  });
});

describe("reading a recipe", () => {
  it("shows a short recipe in full, with no toggle", () => {
    render(<Recipe text={"flour\nwater\nsalt"} editable={false} />);
    expect(screen.getByText(/flour\s+water\s+salt/)).toBeTruthy();
    expect(screen.queryByText(/show full recipe/)).toBeNull();
    expect(screen.queryByLabelText("Recipe")).toBeNull();
  });

  it("collapses a long recipe until “show full recipe”", () => {
    render(<Recipe text={lines(20)} editable={false} />);
    const text = screen.getByText(/line 1\s/);
    expect(text.className).toContain("line-clamp-8");

    fireEvent.click(screen.getByText("show full recipe ↓"));
    expect(text.className).not.toContain("line-clamp-8");
    expect(screen.getByText("show less ↑").getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("collapses one very long paragraph too", () => {
    render(<Recipe text={"mix ".repeat(200)} editable={false} />);
    expect(screen.getByText("show full recipe ↓")).toBeTruthy();
  });

  it("shows nothing when there's no recipe text", () => {
    const { container } = render(<Recipe text="   " editable={false} />);
    expect(container.querySelector("p")).toBeNull();
  });
});
