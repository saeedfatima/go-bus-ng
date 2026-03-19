from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_is_email_verified_user_otp_code_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='otp_failed_attempts',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='otp_last_sent_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
