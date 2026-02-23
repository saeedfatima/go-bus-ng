import uuid
from django.db import models
# We import from apps.accounts.models but handle circular import if needed (here User doesn't import Profile so it is safe)
from apps.accounts.models import User


class Profile(models.Model):
    """
    Separate profile model for additional user data.
    Matches frontend ApiProfile interface.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'

    def __str__(self):
        return f"Profile: {self.user.email}"
