import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const watchOrder = JSON.parse(readFileSync(new URL("../watch-order.json", import.meta.url)));

function watchText(item) {
  return item.type === "episode" ? `Watch Episode ${item.number}: ${item.title}` : `Watch ${item.name}`;
}

const episode = watchOrder.find((item) => item.type === "episode");
assert(episode);
assert.equal(episode.title, "I'm Luffy! The Man Who's Gonna Be King of the Pirates!");
assert.equal(watchText(episode), `Watch Episode ${episode.number}: ${episode.title}`);

const named = watchOrder.find((item) => item.type === "movie" || item.type === "special");
assert(named);
assert("name" in named);
assert.equal(watchText(named), `Watch ${named.name}`);

for (const item of watchOrder) {
  assert(!("filler" in item));
  assert(item.type === "episode" || item.type === "movie" || item.type === "special");
}

console.log("ok: display rules");
