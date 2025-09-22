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