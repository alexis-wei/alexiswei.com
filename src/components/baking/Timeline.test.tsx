import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addStep,
  deleteStep,
  reorderSteps,
  updateStep,
} from "@/app/baking/actions";
import type { TimelineStep } from "@/lib/baking/types";
import { Timeline } from "./Timeline";

vi.mock("@/app/baking/actions", () => ({
  addStep: vi.fn(),
  deleteStep: vi.fn(async () => {}),
  reorderSteps: vi.fn(async () => {}),
  updateStep: vi.fn(async () => {}),
}));

const step = (id: string, text: string): TimelineStep => ({
  id,
  time: "",
  text,
  roomTemp: "",
  humidity: "",
  internalTemp: "",
});

const initial = [step("a", "mix"), step("b", "rest"), step("c", "bake")];

/** The step texts in the order they're shown. */
const shownOrder = () =>
  screen
    .getAllByLabelText("Step")
    .map((el) => (el as HTMLTextAreaElement).value);

beforeEach(() => {
  let n = 0;
  vi.mocked(addStep).mockImplementation(async () => step(`new${++n}`, ""));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Timeline (editing)", () => {
  it("adds a step at the end", async () => {
    render(<Timeline logId="log1" initial={initial} editable />);
    fireEvent.click(screen.getByText("+ add step"));

    await waitFor(() => expect(shownOrder()).toHaveLength(4));
    expect(addStep).toHaveBeenCalledWith("log1", null, expect.any(Object));
    expect(shownOrder()).toEqual(["mix", "rest", "bake", ""]);
  });

  it("inserts a forgotten step right after the chosen one", async () => {
    render(<Timeline logId="log1" initial={initial} editable />);
    fireEvent.click(screen.getByLabelText("Insert a step after step 1"));

    await waitFor(() => expect(shownOrder()).toHaveLength(4));
    expect(addStep).toHaveBeenCalledWith("log1", "a", { time: "" });
    expect(shownOrder()).toEqual(["mix", "", "rest", "bake"]);
  });

  it("moves a step with the keyboard and saves the new order", async () => {
    render(<Timeline logId="log1" initial={initial} editable />);
    fireEvent.keyDown(screen.getByLabelText("Move step 1 of 3"), {
      key: "ArrowDown",
    });

    expect(shownOrder()).toEqual(["rest", "mix", "bake"]);
    await waitFor(() =>
      expect(reorderSteps).toHaveBeenCalledWith("log1", ["b", "a", "c"]),
    );
  });

  it("does nothing when moving past the ends", () => {
    render(<Timeline logId="log1" initial={initial} editable />);
    fireEvent.keyDown(screen.getByLabelText("Move step 1 of 3"), {
      key: "ArrowUp",
    });
    expect(shownOrder()).toEqual(["mix", "rest", "bake"]);
    expect(reorderSteps).not.toHaveBeenCalled();
  });

  it("puts the order back if saving it fails", async () => {
    vi.mocked(reorderSteps).mockRejectedValueOnce(new Error("offline"));
    render(<Timeline logId="log1" initial={initial} editable />);
    fireEvent.keyDown(screen.getByLabelText("Move step 3 of 3"), {
      key: "ArrowUp",
    });
    expect(shownOrder()).toEqual(["mix", "bake", "rest"]);
    await waitFor(() => expect(shownOrder()).toEqual(["mix", "rest", "bake"]));
  });

  it("needs a second tap to delete a step", async () => {
    render(<Timeline logId="log1" initial={initial} editable />);
    const row = screen.getAllByRole("listitem")[1];
    fireEvent.click(within(row).getByLabelText("Remove step"));
    expect(deleteStep).not.toHaveBeenCalled();
    fireEvent.click(within(row).getByText("delete"));

    await waitFor(() => expect(deleteStep).toHaveBeenCalledWith("b"));
    expect(shownOrder()).toEqual(["mix", "bake"]);
  });

  it("saves a step's own fields when edited", async () => {
    render(<Timeline logId="log1" initial={initial} editable />);
    const row = screen.getAllByRole("listitem")[0];
    fireEvent.change(within(row).getByLabelText("Humidity at this step"), {
      target: { value: "48%" },
    });

    await waitFor(
      () =>
        expect(updateStep).toHaveBeenCalledWith(
          "a",
          expect.objectContaining({ text: "mix", humidity: "48%" }),
        ),
      { timeout: 2000 },
    );
  });
});

describe("Timeline (read-only)", () => {
  it("shows steps and readings without any editing controls", () => {
    render(
      <Timeline
        logId="log1"
        initial={[{ ...step("a", "mix"), time: "09:00", humidity: "48%" }]}
        editable={false}
      />,
    );
    expect(screen.getByText("mix")).toBeTruthy();
    expect(screen.getByText("09:00 · rh 48%")).toBeTruthy();
    expect(screen.queryByText("+ add step")).toBeNull();
    expect(screen.queryByLabelText(/Move step/)).toBeNull();
  });
});
