from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0008_sosrequest_urgency"),
    ]

    operations = [
        migrations.AddField(
            model_name="volunteerdonor",
            name="mission_started_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

