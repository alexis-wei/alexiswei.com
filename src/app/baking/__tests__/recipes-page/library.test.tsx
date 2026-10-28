// The recipes page: the library list, its search, and what each row says.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecipeLibrary } from "@/components/baking/RecipeList";
import type { Recipe } from "@/lib/baking/types";

vi.mock("next/link", () => ({
  default: ({ href, ...props }: { href: string }) => (
    <a href={href} {...props} />
  ),
}));

afterEach(cleanup);

const recipe = (id: string, name: string, extra: Partial<Recipe> = {}) => ({
  id,
  name,
  url: "",
  text: "",
  files: [],
  ...extra,
});

describe("recipe library", () => {
  it("links each recipe to its page, with what it's made of", () => {
    render(
      <RecipeLibrary
        recipes={[
          recipe("r1", "miso cookies", {
            url: "https://www.example.com/miso",
            text: "flour",
            files: [
              {
                id: "f",
                url: "u",
                name: "scan.pdf",
                contentType: "application/pdf",
              },
            ],
          }),
          recipe("r2", ""),
        ]}
      />,
    );
    const row = screen.getByText("miso cookies").closest("a")!;
    expect(row.getAttribute("href")).toBe("/baking/recipes/r1");
    expect(row.textContent).toContain("example.com/miso · 1 pdf · pasted");
    expect(screen.getByText("untitled")).toBeTruthy();
  });

  it("searches by name or link once the list is long", () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      recipe(`r${i}`, `recipe ${i}`),
    );
    many.push(recipe("bagels", "bagels", { url: "https://bake.example/nyc" }));
    render(<RecipeLibrary recipes={many} />);
    fireEvent.change(screen.getByPlaceholderText("search recipes"), {
      target: { value: "nyc" },
    });
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual([
      expect.stringContaining("bagels"),
    ]);
  });

  it("says so when there are no recipes yet", () => {
    render(<RecipeLibrary recipes={[]} />);
    expect(screen.getByText("no recipes yet")).toBeTruthy();
  });
});
