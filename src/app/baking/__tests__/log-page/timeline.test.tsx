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
import {
  Timeline as LogTimeline,
  TimelineEditToggle,
} from "@/components/baking/Timeline";
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
      {props.editable && <TimelineEditToggle />}
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
    fireEvent.click(screen.getByLabelText("More for step 1"));
    fireEvent.click(screen.getByLabelText("Insert a step after step 1"));

    await waitFor(() => expect(shownOrder()).toHaveLength(4));
    expect(addStep).toHaveBeenCalledWith("log1", "a", { time: "" });
    expect(shownOrder()).toEqual(["mix", "", "rest", "bake"]);
  });

  it("moves a step with the keyboard and saves the new order", async () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.click(screen.getByText("edit"));
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
    fireEvent.click(screen.getByText("edit"));
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
    fireEvent.click(screen.getByText("edit"));
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
    fireEvent.click(screen.getByText("edit"));
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
        initial={[
          {
            ...step("a", "mix"),
            time: "09:00",
            roomTemp: "24",
            humidity: "48%",
            internalTemp: "205",
          },
        ]}
        editable={false}
      />,
    );
    expect(screen.getByText("mix")).toBeTruthy();
    expect(
      screen.getByText("9:00 am · room 24°C · rh 48% · internal 205°F"),
    ).toBeTruthy();
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
    fireEvent.click(screen.getByText("edit"));
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

describe("Timeline edit mode", () => {
  it("hides drag handles and delete buttons until “edit” is tapped", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    expect(screen.queryByLabelText(/^Move step/)).toBeNull();
    expect(screen.queryByLabelText("Remove step")).toBeNull();
    // Everything else stays editable.
    expect(screen.getAllByLabelText("Step")).toHaveLength(3);
    expect(screen.getAllByLabelText(/^More for step/)).toHaveLength(3);

    fireEvent.click(screen.getByText("edit"));
    expect(screen.getAllByLabelText(/^Move step/)).toHaveLength(3);
    expect(screen.getAllByLabelText("Remove step")).toHaveLength(3);
  });

  it("hides them again with “done”", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.click(screen.getByText("edit"));
    fireEvent.click(screen.getByText("done"));
    expect(screen.queryByLabelText(/^Move step/)).toBeNull();
    expect(screen.queryByLabelText("Remove step")).toBeNull();
    expect(screen.getByText("edit")).toBeTruthy();
  });

  it("isn't offered for an empty timeline", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={[]} editable />,
    );
    expect(screen.queryByText("edit")).toBeNull();
  });

  it("isn't offered to visitors", () => {
    render(
      <Timeline
        logId="log1"
        logDate="2026-10-15"
        initial={initial}
        editable={false}
      />,
    );
    expect(screen.queryByText("edit")).toBeNull();
  });
});

describe("Timeline step menu", () => {
  it("keeps “+ photo” and “+ step below” in each step's ⋮ menu", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    expect(screen.queryByLabelText(/^Insert a step after/)).toBeNull();
    expect(screen.queryByLabelText(/^Choose photos for/)).toBeNull();

    fireEvent.click(screen.getByLabelText("More for step 2"));
    const menu = screen.getByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["+ photo", "+ step below"]);
    expect(
      within(menu).getByLabelText("Insert a step after step 2"),
    ).toBeTruthy();
  });

  it("closes after choosing an item", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    fireEvent.click(screen.getByLabelText("More for step 1"));
    fireEvent.click(screen.getByLabelText("Choose photos for step 1"));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(
      screen.getByRole("dialog", { name: "photos for step 1" }),
    ).toBeTruthy();
  });

  it("shows each reading's unit beside its box", () => {
    render(
      <Timeline logId="log1" logDate="2026-10-15" initial={initial} editable />,
    );
    const row = screen.getAllByLabelText("Step")[0].closest("li")!;
    expect(
      within(row).getByLabelText("Room temperature at this step").parentElement!
        .textContent,
    ).toBe("room°C");
    expect(
      within(row).getByLabelText("Humidity at this step").parentElement!
        .textContent,
    ).toBe("rh%");
    expect(
      within(row).getByLabelText("Internal temperature at this step")
        .parentElement!.textContent,
    ).toBe("internal°F");
  });
});

describe("Timeline readings typed before units were shown", () => {
  it("doesn't repeat the unit in the box, and saves only when edited", () => {
    render(
      <Timeline
        logId="log1"
        logDate="2026-10-15"
        initial={[{ ...step("a", "mix"), roomTemp: "23°C", humidity: "48%" }]}
        editable
      />,
    );
    const room = screen.getByLabelText(
      "Room temperature at this step",
    ) as HTMLInputElement;
    expect(room.value).toBe("23");
    expect(
      (screen.getByLabelText("Humidity at this step") as HTMLInputElement)
        .value,
    ).toBe("48");
    expect(updateStep).not.toHaveBeenCalled();
  });
});

describe("Timeline (read-only) layout", () => {
  const steps = [
    { ...step("a", "scoop into balls"), time: "2026-10-15T09:00" },
    { ...step("b", "chill dough 1h"), time: "2026-10-15T21:24" },
  ];

  it("puts each circle on its step, and the gap between steps", () => {
    const { container } = render(
      <Timeline
        logId="log1"
        logDate="2026-10-15"
        initial={steps}
        editable={false}
      />,
    );
    const blocks = container.querySelectorAll("[data-step]");
    expect(blocks).toHaveLength(2);
    const gap = screen.getByText("12h 24m later");
    // The gap is outside both steps, just before the second one.
    blocks.forEach((block) => expect(block.contains(gap)).toBe(false));
    expect(gap.nextElementSibling).toBe(blocks[1]);
    // Each step's circle sits in the step, beside its time.
    blocks.forEach((block) =>
      expect(block.querySelectorAll("[aria-hidden]")).toHaveLength(1),
    );
    expect(blocks[1].textContent).toContain("9:24 pm");
  });
});
