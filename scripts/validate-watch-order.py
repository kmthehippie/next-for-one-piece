#!/usr/bin/env python3
import json
from pathlib import Path

LATEST_EPISODE = 1163
ALLOWED_TYPES = {
    "episode",
    "movie",
    "special",
}

path = Path(__file__).resolve().parents[1] / "watch-order.json"
items = json.loads(path.read_text())

ids = [item["id"] for item in items]
assert len(ids) == len(set(ids)), "duplicate ids"

episodes = []
for item in items:
    assert item["type"] in ALLOWED_TYPES, item
    if item["type"] == "episode":
        assert set(item) == {"id", "type", "number", "title"}, item
        assert item["id"] == f"episode-{item['number']}", item
        assert isinstance(item["title"], str) and item["title"], item
        episodes.append(item["number"])
    else:
        assert set(item) == {"id", "type", "name", "after_episode"}, item
        assert isinstance(item["name"], str) and item["name"], item
        assert isinstance(item["after_episode"], int), item

expected = set(range(1, LATEST_EPISODE + 1))
actual = set(episodes)
assert actual == expected, {
    "missing": sorted(expected - actual),
    "extra": sorted(actual - expected),
}
assert len(episodes) == len(actual), "duplicate episode numbers"

for item in items:
    if item["type"] != "episode":
        assert item["after_episode"] in actual, item

order_ids = [item["id"] for item in items]
assert order_ids.index("episode-426") > order_ids.index("episode-456")
assert order_ids.index("episode-291") > order_ids.index("episode-516")
assert order_ids.index("episode-1029") > order_ids.index("episode-1086")

print(f"ok: {len(items)} items, episodes 1-{LATEST_EPISODE}")
