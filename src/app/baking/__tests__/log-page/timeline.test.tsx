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
import { LogStateProvider } from "@/components/baking/LogState";
import { Timeline as LogTimeline } from "@/components/baking/Timeline";
import type { Media } from "@/lib/baking/types";

/** The timeline as the log page renders it, inside the shared log state. */
function Timeline({
  initial,
  media = [],
  ...props
}: {
  initial: TimelineStep[];
  media?: Media[];
  logId: string;
  logDate: string;
  editable: boolean;
}) {
  return (
    <LogStateProvider initialSteps={initial} initialMedia={media}>
      <LogTimeline {...props} />
    </LogStateProvider>
  );
}

vi.mock("@/app/baking/actions", () => ({
  addStep: vi.fn(),
  deleteStep: vi.fn(async () => {}),
  reorderSteps: vi.fn(async () => {}),
  updateStep: vi.fn(async () => {}),
  setMediaStep: vi.fn(async () => {}),
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
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.click(screen.getByText("+ add step"));

    await waitFor(() => expect(shownOrder()).toHaveLength(4));
    // New steps at the end start at "now", with the date.
    expect(addStep).toHaveBeenCalledWith("log1", null, {
      time: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
    });
    expect(shownOrder()).toEqual(["mix", "rest", "bake", ""]);
  });

  it("inserts a forgotten step right after the chosen one", async () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.click(screen.getByLabelText("Insert a step after step 1"));

    await waitFor(() => expect(shownOrder()).toHaveLength(4));
    expect(addStep).toHaveBeenCalledWith("log1", "a", { time: "" });
    expect(shownOrder()).toEqual(["mix", "", "rest", "bake"]);
  });

  it("moves a step with the keyboard and saves the new order", async () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.keyDown(screen.getByLabelText("Move step 1 of 3"), {
      key: "ArrowDown",
    });

    expect(shownOrder()).toEqual(["rest", "mix", "bake"]);
    await waitFor(() =>
      expect(reorderSteps).toHaveBeenCalledWith("log1", ["b", "a", "c"]),
    );
  });

  it("does nothing when moving past the ends", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.keyDown(screen.getByLabelText("Move step 1 of 3"), {
      key: "ArrowUp",
    });
    expect(shownOrder()).toEqual(["mix", "rest", "bake"]);
    expect(reorderSteps).not.toHaveBeenCalled();
  });

  it("puts the order back if saving it fails", async () => {
    vi.mocked(reorderSteps).mockRejectedValueOnce(new Error("offline"));
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.keyDown(screen.getByLabelText("Move step 3 of 3"), {
      key: "ArrowUp",
    });
    expect(shownOrder()).toEqual(["mix", "bake", "rest"]);
    await waitFor(() => expect(shownOrder()).toEqual(["mix", "rest", "bake"]));
  });

  it("needs a second tap to delete a step", async () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    const row = screen.getAllByRole("listitem")[1];
    fireEvent.click(within(row).getByLabelText("Remove step"));
    expect(deleteStep).not.toHaveBeenCalled();
    fireEvent.click(within(row).getByText("delete"));

    await waitFor(() => expect(deleteStep).toHaveBeenCalledWith("b"));
    expect(shownOrder()).toEqual(["mix", "bake"]);
  });

  it("saves a step's own fields when edited", async () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
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
        logDate="2026-10-15"
        initial={[{ ...step("a", "mix"), time: "09:00", humidity: "48%" }]}
        editable={false}
      />,
    );
    expect(screen.getByText("mix")).toBeTruthy();
    expect(screen.getByText("9:00 am · rh 48%")).toBeTruthy();
    expect(screen.queryByText("+ add step")).toBeNull();
    expect(screen.queryByLabelText(/Move step/)).toBeNull();
  });
});

describe("Timeline dates and gaps", () => {
  const timed = [
    { ...step("a", "mix"), time: "2026-10-15T20:00" },
    { ...step("b", "cold proof"), time: "2026-10-15T21:30" },
    { ...step("c", "bake"), time: "2026-10-16T09:15" },
  ];

  it("shows each step's date and time in the editor", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={timed} editable />,
    );
    const inputs = screen.getAllByLabelText("Step date and time");
    expect(inputs.map((el) => (el as HTMLInputElement).value)).toEqual([
      "2026-10-15T20:00",
      "2026-10-15T21:30",
      "2026-10-16T09:15",
    ]);
  });

  it("shows the time between steps, across days", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={timed} editable />,
    );
    expect(screen.getByText("1h 30m later")).toBeTruthy();
    expect(screen.getByText("11h 45m later")).toBeTruthy();
  });

  it("recalculates the gaps when steps are reordered", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={timed} editable />,
    );
    fireEvent.keyDown(screen.getByLabelText("Move step 3 of 3"), {
      key: "ArrowUp",
    });
    // bake (Oct 16 9:15) now sits before cold proof (Oct 15 21:30).
    expect(screen.getByText("13h 15m later")).toBeTruthy();
    expect(screen.getByText("−11h 45m (before the step above)")).toBeTruthy();
  });

  it("saves a step's new date and time", async () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={timed} editable />,
    );
    fireEvent.change(screen.getAllByLabelText("Step date and time")[1], {
      target: { value: "2026-10-16T07:00" },
    });
    await waitFor(
      () =>
        expect(updateStep).toHaveBeenCalledWith(
          "b",
          expect.objectContaining({ time: "2026-10-16T07:00" }),
        ),
      { timeout: 2000 },
    );
  });

  it("reads older time-only steps on the log's date, rolling past midnight", () => {
    render(
      <Timeline
        logId="log1"
        logDate="2026-10-15"
        initial={[
          { ...step("a", "shape"), time: "22:00" },
          { ...step("b", "bake"), time: "07:30" },
        ]}
        editable={false}
      />,
    );
    expect(screen.getByText("10:00 pm")).toBeTruthy();
    expect(screen.getByText("Oct 16, 7:30 am")).toBeTruthy();
    expect(screen.getByText("9h 30m later")).toBeTruthy();
  });

  it("measures from the last timed step, skipping untimed ones", () => {
    render(
      <Timeline
        logId="log1"
        logDate="2026-10-15"
        initial={[
          { ...step("a", "mix"), time: "2026-10-15T09:00" },
          step("b", "untimed note"),
          { ...step("c", "bake"), time: "2026-10-15T10:00" },
        ]}
        editable={false}
      />,
    );
    expect(screen.getAllByText(/later$/).map((el) => el.textContent)).toEqual([
      "1h later",
    ]);
  });
});
