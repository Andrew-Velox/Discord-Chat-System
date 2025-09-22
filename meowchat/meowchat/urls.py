from account.views import (
    AccountViewSet,
    UserRegistrationApiView,
    UserLoginApiView, 
    UserLogoutApiView,
    VerifyAuthAPIView,
    # Legacy views for backwards compatibility
    LogOutAPIView,
    RegisterView,
)
# Import simple authentication views for backwards compatibility
from account.simple_auth import simple_login, simple_logout, simple_verify, simple_register
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
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
    
    # Token-based Authentication (Primary - like e-commerce project)
    path("api/auth/login/", UserLoginApiView.as_view(), name="user_login"),
    path("api/auth/logout/", UserLogoutApiView.as_view(), name="user_logout"), 
    path("api/auth/verify/", VerifyAuthAPIView.as_view(), name="verify_auth"),
    path("api/auth/register/", UserRegistrationApiView.as_view(), name="user_register"),
    
    # Legacy Session Authentication (backwards compatibility)
    path("api/session/login/", simple_login, name="simple_login"),
    path("api/session/logout/", simple_logout, name="simple_logout"), 
    path("api/session/verify/", simple_verify, name="simple_verify"),
    path("api/session/register/", simple_register, name="simple_register"),
    
    # Other legacy endpoints
    path("api/logout/", LogOutAPIView.as_view(), name="logout"),
    path("api/register/", RegisterView.as_view(), name="register"),
    
    path("api/cors-test/", cors_test, name="cors_test"),
] + router.urls

# Serve React app for all non-API routes (catch-all)
urlpatterns += [
    re_path(r'^(?!api|admin|ws).*$', TemplateView.as_view(template_name='index.html'), name='react_app'),
]

websocket_urlpatterns = [path("ws/<str:serverId>/<str:channelId>", WebChatConsumer.as_asgi())]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
