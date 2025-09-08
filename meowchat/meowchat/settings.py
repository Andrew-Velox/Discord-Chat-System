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
DEBUG = os.environ.get("DEBUG")

ALLOWED_HOSTS = ["*"]

# Security settings for production
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin-allow-popups"
SECURE_REFERRER_POLICY = "same-origin"

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
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://discord-chat-system.vercel.app",
]

# Fallback for production - allow all origins temporarily for debugging
CORS_ALLOW_ALL_ORIGINS = True

# Explicit CORS configuration to ensure headers are set
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://discord-chat-system\.onrender\.com$",
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
    "ACCESS_TOKEN_LIFETIME": timedelta(days=30),  # Extended to 1 hour for better UX
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,  # Generate new refresh token on each refresh
    "BLACKLIST_AFTER_ROTATION": True,  # Blacklist old refresh tokens
    # JWTCookie settings
    "ACCESS_TOKEN_NAME": "access_token",
    "REFRESH_TOKEN_NAME": "refresh_token",
    "JWT_COOKIE_SAMESITE": "Lax",
    "JWT_COOKIE_SECURE": True,  # True for production HTTPS
    "JWT_COOKIE_HTTPONLY": True,
}
