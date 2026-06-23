#!/usr/bin/env python3
import json
import re
from pathlib import Path

LATEST_EPISODE = 1163

MOVED_EPISODES = {
    291,
    292,
    303,
    406,
    407,
    426,
    427,
    428,
    429,
    492,
    542,
    590,
    895,
    896,
    907,
    1029,
    1030,
}


def episode(number):
    return {"id": f"episode-{number}", "type": "episode", "number": number}


def named(kind, name, after_episode):
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    item_type = "movie" if kind == "movie" else "special"
    return {
        "id": f"{item_type}-{slug}",
        "type": item_type,
        "name": name,
        "after_episode": after_episode,
    }


EXTRAS = {
    8: [
        named("ova", "Defeat Him! The Pirate Ganzack", 8),
    ],
    18: [
        named("movie", "Movie 1: One Piece: The Movie", 18),
    ],
    53: [
        named("special", "TV Special 1: Adventure in the Ocean's Navel", 53),
        named("short", "Jango's Dance Carnival", 53),
        named("movie", "Movie 2: Clockwork Island Adventure", 53),
    ],
    91: [
        named("movie", "Movie 3: Chopper's Kingdom on the Island of Strange Animals", 91),
    ],
    92: [
        named("short", "Dream Soccer King", 92),
        named("cover_story", "Jango Cover Story", 92),
    ],
    138: [
        named("movie", "Movie 4: Dead End Adventure", 138),
        named("special", "TV Special 2: Open Upon the Great Sea! A Father's Huge, HUGE Dream!", 138),
        named("cover_story", "Hatchan Cover Story", 138),
    ],
    195: [
        named("cover_story", "Wapol Cover Story", 195),
    ],
    206: [
        named("cover_story", "Ace Cover Story", 206),
    ],
    219: [
        named("special", "TV Special 3: Protect! The Last Great Performance", 219),
        named("short", "Take Aim! The Pirate Baseball King", 219),
        named("movie", "Movie 5: The Cursed Holy Sword", 219),
    ],
    224: [
        named("movie", "Movie 6: Baron Omatsuri and the Secret Island", 224),
        named("movie", "Movie 7: The Giant Mechanical Soldier of the Karakuri Castle", 224),
        named("cover_story", "Gedatsu Cover Story", 224),
    ],
    325: [
        named("cover_story", "Baroque Works Cover Story", 325),
    ],
    384: [
        named("ova", "Monsters 103 Mercies Dragon Damnation", 384),
        named("ova", "Romance Dawn Story", 384),
        named("cover_story", "Skypeia Cover Story", 384),
        named("movie", "Movie 11: One Piece 3D: Straw Hat Chase", 384),
        named("short", "One Piece 3D: Trap Coaster", 384),
        named("crossover", "Toriko Crossover 1: Toriko Episode 1", 384),
        episode(492),
        named("cover_story", "Water 7 Cover Story", 384),
    ],
    456: [
        named("short", "Strong World Episode 0", 456),
        episode(426),
        episode(427),
        episode(428),
        episode(429),
        named("movie", "Movie 10: Strong World", 456),
    ],
    516: [
        named("special", "TV Special 4: End of Year Special Project! The Detective Memoirs of Chief", 516),
        episode(291),
        episode(292),
        episode(303),
        episode(406),
        episode(407),
        named("special", "TV Special 12: Episode of East Blue", 516),
        named("movie", "Movie 8: Desert Princess and the Pirates", 516),
        named("special", "TV Special 13: Episode of Skypeia", 516),
        named("movie", "Movie 9: Episode of Chopper Plus: Bloom in Winter, Miracle Sakura", 516),
        named("special", "TV Special 8: 3D2Y", 516),
    ],
    522: [
        named("special", "One Piece Fan Letter", 522),
        named("special", "TV Special 5: Episode of Nami", 522),
    ],
    578: [
        named("special", "TV Special 7: Episode of Merry", 578),
        named("short", "Glorious Island", 578),
        named("movie", "Movie 12: Film Z", 578),
        named("cover_story", "Decks of the World Cover Story", 578),
        named("crossover", "Toriko Crossover 2: Toriko Episode 51", 578),
        episode(542),
        named("special", "TV Special 6: Episode of Luffy", 578),
        named("special", "TV Special 10: Adventure in Nebulandia", 578),
        named("light_novel", "One Piece: Ace's Story light novel volumes 1 & 2", 578),
        named("crossover", "Toriko Crossover 3: Toriko Episode 99", 578),
        episode(590),
    ],
    625: [
        named("cover_story", "Caribou Cover Story", 625),
    ],
    679: [
        named("special", "TV Special 9: Episode of Sabo", 679),
    ],
    739: [
        named("cover_story", "Jimbei Cover Story", 739),
    ],
    746: [
        named("cover_story", "Bounty Cover Story", 746),
    ],
    750: [
        named("special", "TV Special 11: Heart of Gold", 750),
        named("short", "Gold Episode 0", 750),
        named("movie", "Movie 13: Film Gold", 750),
    ],
    877: [
        named("cover_story", "Grand Fleet Cover Story", 877),
    ],
    916: [
        named("cover_story", "Bege Cover Story", 916),
        episode(895),
        episode(896),
        named("movie", "Movie 14: Stampede", 916),
    ],
    956: [
        episode(907),
    ],
    1086: [
        episode(1029),
        episode(1030),
        named("special", "The Captain's Log of the Legend! Red-Haired Shanks!", 1086),
        named("movie", "Movie 15: Film Red", 1086),
        named("cover_story", "Germa Cover Story, Part 1", 1086),
    ],
}


def build():
    order = []
    for number in range(1, LATEST_EPISODE + 1):
        if number not in MOVED_EPISODES:
            order.append(episode(number))
        order.extend(EXTRAS.get(number, []))
    return order


if __name__ == "__main__":
    out = Path(__file__).resolve().parents[1] / "watch-order.json"
    out.write_text(json.dumps(build(), indent=2) + "\n")
