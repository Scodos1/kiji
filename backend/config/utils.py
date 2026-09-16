import html
import re


def sanitize_text(value):
    """Strip HTML tags and escape entities to prevent XSS in stored data."""
    if not isinstance(value, str):
        return value
    value = re.sub(r'<[^>]+>', '', value)
    value = html.unescape(value)
    value = value.strip()
    return value
