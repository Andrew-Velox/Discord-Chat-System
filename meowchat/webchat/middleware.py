import jwt
from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_user(scope):
    token = scope["token"]
    model = get_user_model()

    try:
        if token:
            print(f"WebSocket: Attempting to decode token: {token[:20]}...")
            user_id = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])["user_id"]
            user = model.objects.get(id=user_id)
            print(f"WebSocket: User authenticated: {user.username}")
            return user
        else:
            print("WebSocket: No token provided")
            return AnonymousUser()
    except jwt.exceptions.DecodeError as e:
        print(f"WebSocket: JWT decode error: {e}")
        return AnonymousUser()
    except model.DoesNotExist:
        print("WebSocket: User not found")
        return AnonymousUser()
    except Exception as e:
        print(f"WebSocket: Unexpected auth error: {e}")
        return AnonymousUser()


class JWTAuthMiddleWare:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, recieve, send):
        headers_dict = dict(scope["headers"])
        cookies_str = headers_dict.get(b"cookie", b"").decode()
        access_token = None
        
        # Parse cookies safely
        try:
            if cookies_str:
                cookies = {}
                for cookie in cookies_str.split("; "):
                    if "=" in cookie:
                        key, value = cookie.split("=", 1)
                        cookies[key] = value
                access_token = cookies.get("access_token")
        except Exception as e:
            print(f"Cookie parsing error: {e}")
            access_token = None

        scope["token"] = access_token
        scope["user"] = await get_user(scope)

        return await self.app(scope, recieve, send)
