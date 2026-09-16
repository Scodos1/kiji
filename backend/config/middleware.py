import re

from django.conf import settings


class SecurityHeadersMiddleware:
    """Add security headers to every response."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        response.setdefault('X-Content-Type-Options', 'nosniff')
        response.setdefault('X-Frame-Options', 'DENY')
        response.setdefault('X-XSS-Protection', '1; mode=block')
        response.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.setdefault(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=()',
        )

        csp_parts = [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response.setdefault('Content-Security-Policy', '; '.join(csp_parts))

        if getattr(settings, 'IS_PRODUCTION', False):
            response['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains; preload'
            )

        return response


_admin_secret = getattr(settings, 'ADMIN_SECRET_KEY', '')


class AdminIPGuardMiddleware:
    """Optionally restrict /admin/ to a secret path segment.

    In production, set ADMIN_SECRET_KEY in .env. The admin URL becomes
    /admin/<secret>/ — without the secret, requests get 404.
    In development, /admin/ is accessible normally.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self._admin_re = re.compile(r'^/admin/')

    def __call__(self, request):
        if (
            getattr(settings, 'IS_PRODUCTION', False)
            and _admin_secret
            and self._admin_re.match(request.path)
        ):
            expected = f'/admin/{_admin_secret}/'
            if not request.path.startswith(expected):
                from django.http import Http404
                raise Http404

        return self.get_response(request)
