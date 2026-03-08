from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('reference', 'booking', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('reference', 'booking__ticket_code')
    ordering = ('-created_at',)
