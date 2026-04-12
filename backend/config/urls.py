from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.http import HttpResponse

def home_view(request):
    return HttpResponse("""
        <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8faff;">
            <div style="text-align: center; padding: 50px; background: white; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                <h1 style="color: #2563eb;">🚀 HealthCare Backend LIVE</h1>
                <p style="color: #64748b;">API Endpoint: <span style="color: #2563eb; font-weight: bold;">/api/ngos/</span></p>
                <p style="color: #10b981;">Frontend connection status: Ready</p>
            </div>
        </body>
    """)

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    # Core app ki saari URLs yahan link ho rahi hain
    path('api/', include('core.urls')),
    path('api/', include('core.ecosystem_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
