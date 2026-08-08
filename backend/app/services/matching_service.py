from datetime import date
import re


def _words(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower()))


def score_match(source: dict, candidate: dict) -> int:
    """Rule-based fallback. An AI provider can replace this implementation later."""
    score = 0
    if source.get("category", "").lower() == candidate.get("category", "").lower(): score += 30
    if source.get("location", "").lower() == candidate.get("location", "").lower(): score += 20
    for field, weight in (("brand", 12), ("color", 10)):
        a, b = source.get(field, "").lower(), candidate.get(field, "").lower()
        if a and a != "—" and a == b: score += weight
    source_words = _words(" ".join(str(source.get(k, "")) for k in ("title", "description", "details")))
    candidate_words = _words(" ".join(str(candidate.get(k, "")) for k in ("title", "description", "details")))
    if source_words and candidate_words:
        score += min(20, round(30 * len(source_words & candidate_words) / len(source_words | candidate_words)))
    try:
        gap = abs((date.fromisoformat(str(source["date"])) - date.fromisoformat(str(candidate["date"]))).days)
        if gap <= 1: score += 8
        elif gap <= 7: score += 4
    except (KeyError, ValueError):
        pass
    return min(score, 100)


def match_metadata(score: int) -> dict:
    return {"matchScore": score, "matchType": "rule_based", "message": "Possible match based on item details."}
