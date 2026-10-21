// Linking photos to timeline steps on the log page, from either side: a
// step's "+ photo" picker, or a photo's "+ step" picker. The timeline and
// gallery are rendered together, as on the page, to check they stay in sync.

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setMediaStep } from "@/app/baking/actions";
import { LogStateProvider } from "@/components/baking/LogState";
import { MediaGallery } from "@/components/baking/MediaGallery";
import { Timeline } from "@/components/baking/Timeline";
import type { Media, TimelineStep } from "@/lib/baking/types";

vi.mock("@/app/baking/actions", () => ({
  addStep: vi.fn(),
  deleteStep: vi.fn(async () => {}),
  reorderSteps: vi.fn(async () => {}),
  updateStep: vi.fn(async () => {}),
  setMediaStep: vi.fn(async () => {}),
  addMedia: vi.fn(),
  deleteMedia: vi.fn(async () => {}),
  setLogCover: vi.fn(async () => {}),
  updateMediaCaption: vi.fn(async () => {}),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

const step = (id: string, text: string): TimelineStep => ({
  id,
  time: "",
  text,
  roomTemp: "",
  humidity: "",
  internalTemp: "",
});

const photo = (id: string, stepId: string | null = null): Media => ({
  id,
  kind: "image",
  url: `https://media.example/${id}.webp`,
  width: 1080,
  height: 1080,
  caption: id,
  takenAt: null,
  stepId,
});

function LogPage({
  steps = [step("a", "mix"), step("b", "rest")],
  media = [photo("p1"), photo("p2")],
  editable = true,
}: {
  steps?: TimelineStep[];
  media?: Media[];
  editable?: boolean;
}) {
  return (
    <LogStateProvider initialSteps={steps} initialMedia={media}>
      <MediaGallery
        logId="log1"
        logDate="2026-10-15"
        initialCover={null}
        editable={editable}
      />
      <Timeline logId="log1" logDate="2026-10-15" editable={editable} />
    </LogStateProvider>
  );
}

/** The photos shown on the nth step (1-based), by caption. */
function photosOnStep(n: number) {
  const row = screen
    .getAllByLabelText(/^Move step \d+ of \d+$/)
    [n - 1].closest("li")!;
  const strip = within(row).queryByLabelText("Photos for this step");
  return strip
    ? within(strip)
        .getAllByRole("img")
        .map((img) => img.getAttribute("alt"))
    : [];
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("adding photos from a step", () => {
  it("attaches the chosen photo and shows it on the step and in the gallery", async () => {
    render(<LogPage />);
    fireEvent.click(screen.getByLabelText("Choose photos for step 1"));
    const sheet = screen.getByRole("dialog", { name: "photos for step 1" });
    fireEvent.click(within(sheet).getByLabelText("Add image “p1”"));

    await waitFor(() => expect(setMediaStep).toHaveBeenCalledWith("p1", "a"));
    expect(photosOnStep(1)).toEqual(["p1"]);
    expect(screen.getByText("↳ step 1 · mix")).toBeTruthy();
  });

  it("detaches a photo when it's tapped again", async () => {
    render(<LogPage media={[photo("p1", "a")]} />);
    fireEvent.click(screen.getByLabelText("Choose photos for step 1"));
    fireEvent.click(screen.getByLabelText("Remove image “p1”"));

    await waitFor(() => expect(setMediaStep).toHaveBeenCalledWith("p1", null));
    expect(photosOnStep(1)).toEqual([]);
  });

  it("labels photos already on another step, and moves them when picked", async () => {
    render(<LogPage media={[photo("p1", "b")]} />);
    fireEvent.click(screen.getByLabelText("Choose photos for step 1"));
    const sheet = screen.getByRole("dialog", { name: "photos for step 1" });
    expect(within(sheet).getByText("step 2")).toBeTruthy();

    fireEvent.click(within(sheet).getByLabelText("Add image “p1”"));
    await waitFor(() => expect(setMediaStep).toHaveBeenCalledWith("p1", "a"));
    expect(photosOnStep(1)).toEqual(["p1"]);
    expect(photosOnStep(2)).toEqual([]);
  });

  it("explains when the log has no photos yet", () => {
    render(<LogPage media={[]} />);
    fireEvent.click(screen.getByLabelText("Choose photos for step 1"));
    expect(screen.getByText(/no photos in this log yet/)).toBeTruthy();
  });
});

describe("choosing a step from a photo", () => {
  it("links the photo to the chosen step", async () => {
    render(<LogPage />);
    fireEvent.click(screen.getAllByLabelText("Link this image to a step")[0]);
    const sheet = screen.getByRole("dialog", { name: "step for this image" });
    fireEvent.click(within(sheet).getByText("step 2 · rest"));

    await waitFor(() => expect(setMediaStep).toHaveBeenCalledWith("p1", "b"));
    expect(photosOnStep(2)).toEqual(["p1"]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("can unlink it with “no step”", async () => {
    render(<LogPage media={[photo("p1", "a")]} />);
    fireEvent.click(screen.getByLabelText("Change step (step 1 · mix)"));
    fireEvent.click(screen.getByText("no step"));

    await waitFor(() => expect(setMediaStep).toHaveBeenCalledWith("p1", null));
    expect(screen.getByLabelText("Link this image to a step")).toBeTruthy();
  });
});

describe("keeping links consistent", () => {
  it("follows the step when steps are reordered", async () => {
    render(<LogPage media={[photo("p1", "a")]} />);
    expect(screen.getByText("↳ step 1 · mix")).toBeTruthy();

    fireEvent.keyDown(screen.getByLabelText("Move step 1 of 2"), {
      key: "ArrowDown",
    });
    expect(photosOnStep(2)).toEqual(["p1"]);
    expect(screen.getByText("↳ step 2 · mix")).toBeTruthy();
  });

  it("keeps a deleted step's photos in the gallery, unlinked", async () => {
    render(<LogPage media={[photo("p1", "a"), photo("p2")]} />);
    const row = screen.getByLabelText("Move step 1 of 2").closest("li")!;
    fireEvent.click(within(row).getByLabelText("Remove step"));
    fireEvent.click(within(row).getByText("delete"));

    await waitFor(() =>
      expect(screen.queryByText("↳ step 1 · mix")).toBeNull(),
    );
    // Both photos are still in the gallery, and neither is on a step.
    expect(screen.getAllByLabelText(/^Open image/)).toHaveLength(2);
    expect(screen.getAllByLabelText("Link this image to a step")).toHaveLength(
      2,
    );
  });

  it("puts the link back if saving it fails", async () => {
    vi.mocked(setMediaStep).mockRejectedValueOnce(new Error("offline"));
    render(<LogPage />);
    fireEvent.click(screen.getByLabelText("Choose photos for step 1"));
    fireEvent.click(screen.getByLabelText("Add image “p1”"));

    await waitFor(() => expect(photosOnStep(1)).toEqual([]));
  });
});

describe("reading a log", () => {
  it("shows each step's photos as links, with no pickers", () => {
    render(<LogPage media={[photo("p1", "b")]} editable={false} />);
    const strip = screen.getByLabelText("Photos for this step");
    expect(within(strip).getByRole("link").getAttribute("href")).toBe(
      "https://media.example/p1.webp",
    );
    expect(screen.getByText("↳ step 2 · rest")).toBeTruthy();
    expect(screen.queryByLabelText(/Choose photos/)).toBeNull();
    expect(screen.queryByLabelText(/Link this image/)).toBeNull();
  });
});
