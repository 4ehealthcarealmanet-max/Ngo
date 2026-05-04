from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0007_volunteerdonor_lat_volunteerdonor_lng"),
    ]

    operations = [
        migrations.AddField(
            model_name="sosrequest",
            name="urgency",
            field=models.CharField(
                choices=[("Normal", "Normal"), ("Critical", "Critical")],
                default="Normal",
                max_length=20,
            ),
        ),
    ]

