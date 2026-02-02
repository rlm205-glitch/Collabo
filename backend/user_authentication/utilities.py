import re

def valid_case_email(email: str) -> bool:
    return bool(re.search(r"^[A-Za-z0-9._%+-]+@case\.edu$", email))
