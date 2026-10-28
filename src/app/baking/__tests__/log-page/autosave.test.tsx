import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "@/components/baking/autosave";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useAutosave", () => {
  it("waits for typing to pause, then saves only the latest value", async () => {
    const save = vi.fn(async () => {});
    const { result } = renderHook(() => useAutosave(save, 600));

    act(() => {
      result.current.schedule("b");
      result.current.schedule("br");
      result.current.schedule("bread");
    });
    expect(save).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("bread");
  });

  it("saves right away on flush (e.g. leaving the field)", async () => {
    const save = vi.fn(async () => {});
    const { result } = renderHook(() => useAutosave(save, 600));
    act(() => result.current.schedule("rye"));
    await act(async () => result.current.flush());
    expect(save).toHaveBeenCalledWith("rye");
  });

  it("retries a failed save until it goes through", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutosave(save, 0));

    act(() => result.current.schedule("crumb"));
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(save).toHaveBeenCalledTimes(1);

    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith("crumb");
  });

  it("saves pending edits when the field goes away", async () => {
    const save = vi.fn(async () => {});
    const { result, unmount } = renderHook(() => useAutosave(save, 600));
    act(() => result.current.schedule("last words"));
    await act(async () => unmount());
    expect(save).toHaveBeenCalledWith("last words");
  });
});
