def is_placeholder_key(secret_key: str | None) -> bool:
    """
    Detect missing/placeholder-like keys that should not be used for real gateway calls.
    """
    if not secret_key:
        return True

    value = secret_key.strip()
    if not value:
        return True

    lower_value = value.lower()
    placeholder_markers = (
        'xxxx',
        'your_key',
        'your-secret',
        'sample',
        'changeme',
        'replace_me',
    )
    return any(marker in lower_value for marker in placeholder_markers)


def can_use_real_paystack(settings_obj) -> tuple[bool, str]:
    """
    Return whether real Paystack calls are safe to attempt and, if not, why.
    """
    secret_key = (getattr(settings_obj, 'PAYSTACK_SECRET_KEY', '') or '').strip()
    callback_template = (getattr(settings_obj, 'PAYSTACK_CALLBACK_URL', '') or '').strip()

    if not secret_key:
        return False, 'PAYSTACK_SECRET_KEY is missing.'

    if is_placeholder_key(secret_key):
        return False, 'PAYSTACK_SECRET_KEY looks like a placeholder/sample key.'

    if not callback_template:
        return False, 'PAYSTACK_CALLBACK_URL is missing.'

    return True, ''
