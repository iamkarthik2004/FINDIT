from datetime import datetime, timezone

from bson import ObjectId


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def frontend_status(status: str) -> str:
    return status.replace("_", "-")


def serialize_item(item: dict, reporter: dict | None = None) -> dict:
    image_url = item.get("imageUrl")
    gallery = [image_url] if image_url else []
    return {
        "id": str(item["_id"]), "userId": str(item["userId"]), "type": item["type"],
        "title": item["title"], "category": item["category"], "description": item["description"],
        "location": item["location"], "date": item["date"], "brand": item.get("brand", "—"),
        "color": item.get("color", "—"), "imageUrl": image_url, "image": image_url,
        "gallery": gallery, "details": item.get("details", ""), "status": frontend_status(item["status"]),
        "reportedBy": item.get("reportedBy") or (reporter or {}).get("name", "FINDIT user"),
        "reporterEmail": item.get("reporterEmail") or (reporter or {}).get("email"),
        "matchScore": item.get("matchScore", 0), "createdAt": item["createdAt"], "updatedAt": item["updatedAt"], "returnMessage": item.get("returnMessage"),
    }


def parse_object_id(value: str) -> ObjectId | None:
    return ObjectId(value) if ObjectId.is_valid(value) else None
