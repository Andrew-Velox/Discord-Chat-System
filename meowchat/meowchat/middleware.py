class SecureProxyMiddleware:
    """
    Middleware to properly detect HTTPS when behind a proxy (like Render).
    Some hosting platforms don't set request.is_secure() correctly.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check for common HTTPS headers set by proxies
        if (
            request.META.get('HTTP_X_FORWARDED_PROTO') == 'https'
            or request.META.get('HTTP_X_FORWARDED_SSL') == 'on'
            or request.META.get('HTTP_X_URL_SCHEME') == 'https'
            or request.META.get('HTTP_FORWARDED', '').startswith('proto=https')
        ):
            request.is_secure = lambda: True
        
        response = self.get_response(request)
        return response


class SessionCookieMiddleware:
    """
    Middleware to ensure session cookies are set with proper attributes
    for cross-origin HTTPS deployment
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # If response has a session cookie, ensure it has proper attributes
        if hasattr(response, 'cookies') and 'sessionid' in response.cookies:
            cookie = response.cookies['sessionid']
            
            # Force proper attributes for session persistence
            if request.is_secure():
                cookie['secure'] = True
                cookie['samesite'] = 'None'
            else:
                cookie['secure'] = False
                cookie['samesite'] = 'Lax'
            
            cookie['httponly'] = True
            cookie['path'] = '/'
            
            # Critical: Set Max-Age to ensure it's not a session cookie
            from django.conf import settings
            cookie['max-age'] = getattr(settings, 'SESSION_COOKIE_AGE', 30 * 24 * 60 * 60)
        
        return response