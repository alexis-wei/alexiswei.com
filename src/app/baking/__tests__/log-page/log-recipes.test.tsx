// Picking a log's recipes from the library, or adding a new recipe from the
// log (link, pasted text, photos/PDFs), like ingredients.

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addRecipeFile,
  createRecipe,
  setRecipeSelected,
} from "@/app/baking/actions";
import { uploadFile } from "@/components/baking/upload";
import { LogRecipes } from "@/components/baking/LogRecipes";
import type { Recipe } from "@/lib/baking/types";

vi.mock("@/app/baking/actions", () => ({
  setRecipeSelected: vi.fn(async () => {}),
  createRecipe: vi.fn(
    async (input: { name: string; url: string; text: string }) => ({
      id: "new",
      name: input.name.trim(),
      url: input.url.trim(),
      text: input.text,
      files: [],
    }),
  ),
  addRecipeFile: vi.fn(
    async (_id: string, file: { name: string; contentType: string }) => ({
      id: `file-${file.name}`,
      url: `https://media.example/${file.name}`,
      name: file.name,
      contentType: file.contentType,
    }),
  ),
}));
vi.mock("@/components/baking/upload", () => ({
  uploadFile: vi.fn(
    async (_file: File, o: { recipeId: string; filename: string }) =>
      `baking/recipes/${o.recipeId}/${o.filename}`,
  ),
  contentTypeOf: (file: File) => file.type,
}));
vi.mock("next/link", () => ({
  default: ({ href, ...props }: { href: string }) => (
    <a href={href} {...props} />
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const recipe = (id: string, name: string, extra: Partial<Recipe> = {}) => ({
  id,
  name,
  url: "",
  text: "",
  files: [],
  ...extra,
});

const library = [
  recipe("dough", "brioche dough", { url: "https://example.com/brioche" }),
  recipe("filling", "pastry cream", { text: "milk, yolks" }),
];

function open(initial: string[] = []) {
  render(
    <LogRecipes logId="log1" library={library} initial={initial} editable />,
  );
  fireEvent.click(screen.getByText("add recipes"));
  return screen.getByRole("dialog", { name: "Choose recipes" });
}

describe("reading a log's recipes", () => {
  it("lists them in order, each linking to its recipe page", () => {
    render(
      <LogRecipes
        logId="log1"
        library={library}
        initial={["filling", "dough"]}
        editable={false}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/baking/recipes/filling",
      "/baking/recipes/dough",
    ]);
    expect(links[1].textContent).toContain("example.com/brioche");
    expect(screen.queryByText("add recipes")).toBeNull();
  });
});

describe("picking recipes for a log", () => {
  it("adds several recipes from the library", async () => {
    const dialog = open();
    fireEvent.click(within(dialog).getByText("brioche dough"));
    fireEvent.click(within(dialog).getByText("pastry cream"));
    await waitFor(() => expect(setRecipeSelected).toHaveBeenCalledTimes(2));
    expect(setRecipeSelected).toHaveBeenCalledWith("log1", "dough", true);
    expect(setRecipeSelected).toHaveBeenCalledWith("log1", "filling", true);
    expect(within(dialog).getByText("2 selected")).toBeTruthy();
  });

  it("unpicks a recipe from the popup or with ×", async () => {
    render(
      <LogRecipes
        logId="log1"
        library={library}
        initial={["dough"]}
        editable
      />,
    );
    fireEvent.click(screen.getByLabelText("Remove brioche dough"));
    await waitFor(() =>
      expect(setRecipeSelected).toHaveBeenCalledWith("log1", "dough", false),
    );
    expect(screen.queryByText("brioche dough")).toBeNull();
  });

  it("puts the list back if saving the pick fails", async () => {
    vi.mocked(setRecipeSelected).mockRejectedValueOnce(new Error("offline"));
    const dialog = open();
    fireEvent.click(within(dialog).getByText("pastry cream"));
    await waitFor(() =>
      expect(within(dialog).getByText("choose recipes")).toBeTruthy(),
    );
  });

  it("searches the library, offering to add a recipe that isn't there", () => {
    const dialog = open();
    fireEvent.change(within(dialog).getByPlaceholderText("search recipes"), {
      target: { value: "kouign" },
    });
    expect(within(dialog).queryByText("brioche dough")).toBeNull();
    expect(within(dialog).getByText("add “kouign”")).toBeTruthy();
  });
});

describe("adding a new recipe from a log", () => {
  it("saves a link and pasted text, and picks it for the log", async () => {
    const dialog = open();
    fireEvent.click(within(dialog).getByText("new recipe"));
    fireEvent.change(within(dialog).getByPlaceholderText(/brown butter miso/), {
      target: { value: "kouign-amann" },
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText("paste the recipe's link"),
      {
        target: { value: "https://example.com/kouign" },
      },
    );
    fireEvent.change(within(dialog).getByLabelText("Recipe text"), {
      target: { value: "laminate 3 times\nbake 30 min" },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByText("add to log"));
    });

    expect(createRecipe).toHaveBeenCalledWith({
      name: "kouign-amann",
      url: "https://example.com/kouign",
      text: "laminate 3 times\nbake 30 min",
    });
    expect(setRecipeSelected).toHaveBeenCalledWith("log1", "new", true);
    expect(within(dialog).getByText("1 selected")).toBeTruthy();
  });

  it("uploads chosen photos and PDFs into the new recipe", async () => {
    const dialog = open();
    fireEvent.click(within(dialog).getByText("new recipe"));
    fireEvent.change(within(dialog).getByPlaceholderText(/brown butter miso/), {
      target: { value: "scanned loaf" },
    });
    const pdf = new File(["%PDF"], "loaf.pdf", { type: "application/pdf" });
    fireEvent.change(within(dialog).getByTestId("recipe-files"), {
      target: { files: [pdf] },
    });
    expect(within(dialog).getByText("loaf.pdf")).toBeTruthy();
    await act(async () => {
      fireEvent.click(within(dialog).getByText("add to log"));
    });

    expect(uploadFile).toHaveBeenCalledWith(pdf, {
      purpose: "recipe",
      recipeId: "new",
      filename: "loaf.pdf",
    });
    expect(addRecipeFile).toHaveBeenCalledWith(
      "new",
      expect.objectContaining({ key: "baking/recipes/new/loaf.pdf" }),
    );
  });

  it("saves the form when the popup is closed with “done”", async () => {
    const dialog = open();
    fireEvent.click(within(dialog).getByText("new recipe"));
    fireEvent.change(within(dialog).getByPlaceholderText(/brown butter miso/), {
      target: { value: "focaccia" },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByText("done"));
    });
    expect(createRecipe).toHaveBeenCalledWith(
      expect.objectContaining({ name: "focaccia" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("focaccia")).toBeTruthy();
  });

  it("leaves without saving when nothing was entered", async () => {
    const dialog = open();
    fireEvent.click(within(dialog).getByText("new recipe"));
    await act(async () => {
      fireEvent.click(within(dialog).getByText("done"));
    });
    expect(createRecipe).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks for a name rather than losing a pasted recipe", async () => {
    const dialog = open();
    fireEvent.click(within(dialog).getByText("new recipe"));
    fireEvent.change(within(dialog).getByLabelText("Recipe text"), {
      target: { value: "flour, water, salt" },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByText("done"));
    });
    expect(createRecipe).not.toHaveBeenCalled();
    expect(
      within(dialog).getByText("Add a name to save this recipe."),
    ).toBeTruthy();
  });
});
