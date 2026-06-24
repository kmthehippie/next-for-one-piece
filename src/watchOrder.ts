import items from "../watch-order.json";

export type WatchItem =
  | { id: string; type: "episode"; number: number; title: string }
  | { id: string; type: "movie" | "special"; name: string; after_episode: number };

export const watchOrder = items as WatchItem[];

export function firstItem() {
  return watchOrder[0] ?? null;
}

export function itemById(id: string | null) {
  return id ? watchOrder.find((item) => item.id === id) ?? null : null;
}

export function nextItem(id: string) {
  const index = watchOrder.findIndex((item) => item.id === id);
  return index >= 0 ? watchOrder[index + 1] ?? null : null;
}

export function episodeByNumber(number: number) {
  return watchOrder.find((item) => item.type === "episode" && item.number === number) ?? null;
}
