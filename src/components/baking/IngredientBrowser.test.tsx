import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createIngredient } from "@/app/baking/actions";
import type { Ingredient } from "@/lib/baking/types";
import { IngredientBrowser } from "./IngredientBrowser";
import { uploadIcon } from "./IconPicker";

// Server actions and uploads are replaced so the test exercises only the
// popup's own logic: when it saves a new ingredient, and with what.
vi.mock("@/app/baking/actions", () => ({ createIngredient: vi.fn() }));

const uploaded = {
  imageKey: "baking/ingredients/icon.webp",
  sourceKey: "baking/ingredients/original.webp",
  crop: { x: 0, y: 0, width: 1 },
};

vi.mock("./IconPicker", () => ({
  // Stands in for the file picker + crop step: one click "picks" an image.
  IconPicker: ({ onIcon }: { onIcon: (icon: object) => void }) => (
    <button
      type="button"
      onClick={() =>
        onIcon({
          blob: new Blob(["icon"]),
          url: "blob:icon",
          crop: uploaded.crop,
          source: new Blob(["original"]),
        })
      }
    >
      pick image
    </button>
  ),
  uploadIcon: vi.fn(),
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

const ryeFlour: Ingredient = {
  id: "ing-1",
  name: "rye flour",
  origin: "",
  details: "",
  imageUrl: "https://media.example/icon.webp",
  sourceUrl: "https://media.example/original.webp",
  crop: uploaded.crop,
};

function setup() {
  const onCreated = vi.fn(async () => {});
  const onClose = vi.fn();
  render(
    <IngredientBrowser
      library={[]}
      selectedIds={new Set()}
      onToggle={() => {}}
      onCreated={onCreated}
      onClose={onClose}
    />,
  );
  return { onCreated, onClose };
}

/** Searches for a name that isn't in the library and opens "add". */
function startAdding(name: string) {
  fireEvent.change(screen.getByPlaceholderText("search ingredients"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByText(`add “${name}”`));
}

beforeEach(() => {
  vi.mocked(createIngredient).mockResolvedValue(ryeFlour);
  vi.mocked(uploadIcon).mockResolvedValue(uploaded);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("adding an ingredient from a log's popup", () => {
  it("saves it with its image when tapping “add to log”", async () => {
    const { onCreated, onClose } = setup();
    startAdding("rye flour");
    fireEvent.click(screen.getByText("pick image"));
    fireEvent.click(screen.getByText("add to log"));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(ryeFlour));
    expect(uploadIcon).toHaveBeenCalledTimes(1);
    expect(createIngredient).toHaveBeenCalledWith({
      name: "rye flour",
      origin: "",
      details: "",
      image: uploaded,
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  // The reported bug: picking an image and then tapping "done" (the visible
  // button while the phone keyboard covers "add to log") discarded it.
  it("saves it before closing when tapping “done”", async () => {
    const { onCreated, onClose } = setup();
    startAdding("rye flour");
    fireEvent.click(screen.getByText("pick image"));
    fireEvent.click(screen.getByText("done"));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(createIngredient).toHaveBeenCalledTimes(1);
    expect(vi.mocked(createIngredient).mock.calls[0][0].image).toEqual(
      uploaded,
    );
    expect(onCreated).toHaveBeenCalledWith(ryeFlour);
  });

  it("saves it when tapping outside the popup", async () => {
    const { onCreated, onClose } = setup();
    startAdding("rye flour");
    // The dimmed backdrop is the dialog's parent.
    fireEvent.click(screen.getByRole("dialog").parentElement!);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onCreated).toHaveBeenCalledWith(ryeFlour);
  });

  it("saves it when going back to browse", async () => {
    const { onCreated, onClose } = setup();
    startAdding("rye flour");
    fireEvent.click(screen.getByText("browse"));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(ryeFlour));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("creates only one ingredient when “done” is tapped twice", async () => {
    const { onClose } = setup();
    startAdding("rye flour");
    fireEvent.click(screen.getByText("done"));
    fireEvent.click(screen.getByText("done"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(createIngredient).toHaveBeenCalledTimes(1);
  });

  it("closes without creating anything when the form is empty", async () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByText("new ingredient"));
    fireEvent.click(screen.getByText("done"));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(createIngredient).not.toHaveBeenCalled();
  });

  it("stays open and asks for a name when there's an image but no name", async () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByText("new ingredient"));
    fireEvent.click(screen.getByText("pick image"));
    fireEvent.click(screen.getByText("done"));

    expect(
      await screen.findByText("Add a name to save this ingredient."),
    ).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(createIngredient).not.toHaveBeenCalled();
  });

  it("stays open and shows the error when saving fails", async () => {
    vi.mocked(createIngredient).mockRejectedValue(new Error("offline"));
    const { onCreated, onClose } = setup();
    startAdding("rye flour");
    fireEvent.click(screen.getByText("done"));

    expect(await screen.findByText("offline")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });
});
