from account.views import (
    AccountViewSet,
    JWTCookieTokenObtainPairView,
    JWTCookieTokenRefreshView,
    LogOutAPIView,
    RegisterView,
    VerifyAuthAPIView,
)
# Import simple authentication views
from account.simple_auth import simple_login, simple_logout, simple_verify, simple_register
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from server.views import CategoryListViewSet, ServerListViewSet, ServerMemebershipViewSet, cors_test
from webchat.consumer import WebChatConsumer
from webchat.views import MessageViewSet

router = DefaultRouter()
router.register("api/server/select", ServerListViewSet)
router.register("api/server/category", CategoryListViewSet)
router.register("api/messages", MessageViewSet, basename="message")
router.register("api/account", AccountViewSet, basename="account")
router.register(
    r"api/membership/(?P<server_id>\d+)", ServerMemebershipViewSet, basename="server-membership"
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/docs/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/schema/ui/", SpectacularSwaggerView.as_view()),
    
    # Simple Django session-based authentication (NEW - reliable for deployment)
    path("api/auth/login/", simple_login, name="simple_login"),
    path("api/auth/logout/", simple_logout, name="simple_logout"), 
    path("api/auth/verify/", simple_verify, name="simple_verify"),
    path("api/auth/register/", simple_register, name="simple_register"),
    
    # Legacy JWT routes (keep for backwards compatibility)
    path("api/token/", JWTCookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", JWTCookieTokenRefreshView.as_view(), name="token_refresh"),
    path("api/logout/", LogOutAPIView.as_view(), name="logout"),
    path("api/register/", RegisterView.as_view(), name="register"),
    
    path("api/cors-test/", cors_test, name="cors_test"),
] + router.urls

websocket_urlpatterns = [path("ws/<str:serverId>/<str:channelId>", WebChatConsumer.as_asgi())]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
