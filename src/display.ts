import type { WatchItem } from "./watchOrder";

export function watchText(item: WatchItem) {
  return item.type === "episode" ? `Watch Episode ${item.number}` : `Watch ${item.name}`;
}
