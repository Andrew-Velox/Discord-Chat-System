import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes")

# Get allowed hosts from environment variable or use default
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",") if os.environ.get("ALLOWED_HOSTS") else ["*"]

# Security settings for production
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin-allow-popups"
SECURE_REFERRER_POLICY = "same-origin"

# Additional HTTPS security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = False  # Render handles SSL termination
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_TLS = True

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # External
    "drf_spectacular",
    "rest_framework",
    "corsheaders",
    "channels",
    # Internal
    "account",
    "server",
    "webchat",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "meowchat.middleware.SecureProxyMiddleware",  # Add HTTPS detection for proxies
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "meowchat.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "meowchat.wsgi.application"
ASGI_APPLICATION = "meowchat.asgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATIC_URL = "static/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "media/"

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "account.Account"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # "rest_framework.authentication.SessionAuthentication",
        # "rest_framework_simplejwt.authentication.JWTAuthentication",
        "account.authenticate.JWTCookieAuthentication",
    ],
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Your Project API",
    "DESCRIPTION": "Your project description",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": True,
}


CORS_ALLOW_CREDENTIALS = True

# ✅ Only allow your frontend origin (Vercel). Do NOT add your backend domain here.
CORS_ALLOWED_ORIGINS = [
    "https://discord-chat-system.vercel.app",
]

# For localhost dev
if DEBUG:
    CORS_ALLOWED_ORIGINS += [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8000",
    ]


# Fallback for production - more restrictive than before
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only allow all origins in debug mode

# Explicit CORS configuration to ensure headers are set
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://discord-chat-system.*\.onrender\.com$",
    r"^http://localhost:\d+$",
]

# Additional CORS settings for production
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'pragma',
    'access-control-allow-origin',
]

CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-csrftoken',
    'access-control-allow-origin',
]

# Ensure preflight requests are handled
CORS_PREFLIGHT_MAX_AGE = 86400

# Allow all methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]


CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=30),  
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,  # Disable to prevent refresh issues

    # Cookie names
    "ACCESS_TOKEN_NAME": "access_token",
    "REFRESH_TOKEN_NAME": "refresh_token",

    # Cookie security - CRITICAL for HTTPS
    "JWT_COOKIE_SECURE": not DEBUG,                # True on HTTPS, False on HTTP
    "JWT_COOKIE_SAMESITE": "None" if not DEBUG else "Lax",  # "None" required for cross-origin HTTPS
    "JWT_COOKIE_HTTPONLY": True,

    # Let browser decide domain (no hardcoding)
    "JWT_COOKIE_DOMAIN": None,
}

# Session cookies (Django's built-in session authentication)
SESSION_COOKIE_SECURE = not DEBUG                     # HTTPS only in production
SESSION_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"  # Cross-origin for production
SESSION_COOKIE_HTTPONLY = True                        # Prevent JS access to session
SESSION_COOKIE_AGE = 30 * 24 * 60 * 60                # 30 days
SESSION_SAVE_EVERY_REQUEST = True                     # Refresh session on each request
SESSION_EXPIRE_AT_BROWSER_CLOSE = False               # Persist across browser restarts

# CSRF cookies (must match session settings for HTTPS)
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"
CSRF_COOKIE_HTTPONLY = False   # CSRF cookie must be readable by JS
