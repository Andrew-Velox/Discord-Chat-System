from rest_framework.authentication import SessionAuthentication


class CSRFExemptSessionAuthentication(SessionAuthentication):
    """
    Custom SessionAuthentication that bypasses CSRF checking for API endpoints.
    This is necessary for cross-origin requests where CSRF tokens are problematic.
    """
    
    def enforce_csrf(self, request):
        """
        Override to skip CSRF validation for API endpoints.
        """
        return  # Skip CSRF check