from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0015_bloodrequest_bloodstock"),
    ]

    operations = [
        migrations.AddField(
            model_name="bloodstock",
            name="last_updated",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.CreateModel(
            name="DonorRegistry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                (
                    "blood_group",
                    models.CharField(
                        choices=[
                            ("A+", "A+"),
                            ("A-", "A-"),
                            ("B+", "B+"),
                            ("B-", "B-"),
                            ("O+", "O+"),
                            ("O-", "O-"),
                            ("AB+", "AB+"),
                            ("AB-", "AB-"),
                        ],
                        max_length=5,
                    ),
                ),
                ("contact", models.CharField(blank=True, default="", max_length=40)),
                ("last_donation_date", models.DateField(blank=True, null=True)),
                (
                    "status",
                    models.CharField(
                        choices=[("Available", "Available"), ("Pending", "Pending")],
                        default="Available",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Blood Donor",
                "verbose_name_plural": "Blood Donors",
                "db_table": "NGO_DonorRegistry",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="TransferLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("units_transferred", models.PositiveIntegerField()),
                ("destination_hospital", models.CharField(max_length=255)),
                (
                    "blood_group",
                    models.CharField(
                        choices=[
                            ("A+", "A+"),
                            ("A-", "A-"),
                            ("B+", "B+"),
                            ("B-", "B-"),
                            ("O+", "O+"),
                            ("O-", "O-"),
                            ("AB+", "AB+"),
                            ("AB-", "AB-"),
                        ],
                        max_length=5,
                    ),
                ),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("Request Received", "Request Received"),
                            ("Dispatched", "Dispatched"),
                            ("In Transit", "In Transit"),
                            ("Delivered", "Delivered"),
                        ],
                        default="Request Received",
                        max_length=30,
                    ),
                ),
                ("current_lat", models.FloatField(blank=True, null=True)),
                ("current_lng", models.FloatField(blank=True, null=True)),
                ("rider_contact", models.CharField(blank=True, default="", max_length=20)),
            ],
            options={
                "verbose_name": "Transfer Log",
                "verbose_name_plural": "Transfer Logs",
                "db_table": "NGO_TransferLogs",
                "ordering": ["-timestamp"],
            },
        ),
        migrations.CreateModel(
            name="BloodDonation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "blood_group",
                    models.CharField(
                        choices=[
                            ("A+", "A+"),
                            ("A-", "A-"),
                            ("B+", "B+"),
                            ("B-", "B-"),
                            ("O+", "O+"),
                            ("O-", "O-"),
                            ("AB+", "AB+"),
                            ("AB-", "AB-"),
                        ],
                        max_length=5,
                    ),
                ),
                ("units_donated", models.PositiveIntegerField()),
                ("donated_at", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "donor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="donations",
                        to="core.donorregistry",
                    ),
                ),
            ],
            options={
                "verbose_name": "Blood Donation",
                "verbose_name_plural": "Blood Donations",
                "db_table": "NGO_BloodDonations",
                "ordering": ["-donated_at"],
            },
        ),
    ]
