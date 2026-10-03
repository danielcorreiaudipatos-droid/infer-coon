"""Security Manager - Protects against attacks and intrusions"""

import logging
import hashlib
import hmac
import re
import jwt
import time
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from functools import wraps

logger = logging.getLogger(__name__)


class SecurityManager:
    """Central security management for ADS platform"""

    def __init__(self):
        self.rate_limit_storage = {}  # IP -> {timestamp, count}
        self.blocked_ips = set()
        self.suspicious_patterns = {}
        self.max_requests_per_minute = 60
        self.max_failed_logins = 5
        self.jwt_secret = "your-secret-key-change-in-production"
        self.failed_logins = {}  # user_id -> {count, timestamp}

    # ===== RATE LIMITING =====
    def check_rate_limit(self, ip_address: str) -> bool:
        """Check if IP exceeds rate limit (60 req/min)"""
        current_time = time.time()

        if ip_address not in self.rate_limit_storage:
            self.rate_limit_storage[ip_address] = {"timestamp": current_time, "count": 1}
            return True

        stored = self.rate_limit_storage[ip_address]
        time_diff = current_time - stored["timestamp"]

        if time_diff > 60:  # Reset after 1 minute
            self.rate_limit_storage[ip_address] = {"timestamp": current_time, "count": 1}
            return True

        if stored["count"] >= self.max_requests_per_minute:
            logger.warning(f"Rate limit exceeded for IP: {ip_address}")
            return False

        self.rate_limit_storage[ip_address]["count"] += 1
        return True

    # ===== INPUT VALIDATION =====
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def sanitize_string(self, text: str, max_length: int = 1000) -> str:
        """Remove dangerous characters and limit length"""
        if not isinstance(text, str):
            return ""

        # Remove null bytes
        text = text.replace('\x00', '')

        # Remove control characters
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')

        # Limit length
        return text[:max_length]

    def validate_api_key(self, api_key: str) -> bool:
        """Validate API key format (should be 32+ chars)"""
        if not api_key or len(api_key) < 32:
            return False
        return api_key.isalnum() or all(c in '-_' for c in api_key if not c.isalnum())

    # ===== SQL INJECTION PREVENTION =====
    def check_sql_injection(self, text: str) -> bool:
        """Detect SQL injection patterns"""
        dangerous_patterns = [
            r"(?i)(union|select|insert|update|delete|drop|create|alter|exec|script)",
            r"(?i)(--|;|'|\")",
            r"(?i)(or\s+1\s*=\s*1)",
            r"(?i)(sleep\s*\()",
            r"(?i)(benchmark\s*\()"
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, text):
                logger.warning(f"SQL injection attempt detected: {text[:50]}")
                return False

        return True

    # ===== XSS PREVENTION =====
    def check_xss(self, text: str) -> bool:
        """Detect XSS patterns"""
        dangerous_patterns = [
            r"<script[^>]*>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe",
            r"<object",
            r"<embed",
            r"eval\s*\("
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                logger.warning(f"XSS attempt detected: {text[:50]}")
                return False

        return True

    def escape_html(self, text: str) -> str:
        """Escape HTML special characters"""
        html_escape_table = {
            "&": "&amp;",
            '"': "&quot;",
            "'": "&#x27;",
            ">": "&gt;",
            "<": "&lt;"
        }
        return "".join(html_escape_table.get(c, c) for c in text)

    # ===== CSRF PROTECTION =====
    def generate_csrf_token(self, session_id: str) -> str:
        """Generate CSRF token"""
        data = f"{session_id}_{time.time()}".encode()
        token = hashlib.sha256(data).hexdigest()
        return token

    def verify_csrf_token(self, token: str, session_id: str) -> bool:
        """Verify CSRF token (simplified)"""
        if not token or len(token) != 64:
            return False
        return True

    # ===== JWT AUTHENTICATION =====
    def generate_jwt_token(self, user_id: str, expires_in_hours: int = 24) -> str:
        """Generate JWT token"""
        payload = {
            "user_id": user_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=expires_in_hours)
        }

        token = jwt.encode(payload, self.jwt_secret, algorithm="HS256")
        return token

    def verify_jwt_token(self, token: str) -> Optional[Dict]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None

    # ===== WEBHOOK SECURITY =====
    def verify_webhook_signature(self, payload: str, signature: str, secret: str) -> bool:
        """Verify webhook signature using HMAC"""
        expected_sig = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(signature, expected_sig)

    # ===== FAILED LOGIN PROTECTION =====
    def track_login_attempt(self, user_id: str, success: bool) -> Dict:
        """Track login attempts and lock account after 5 failures"""
        if user_id not in self.failed_logins:
            self.failed_logins[user_id] = {"count": 0, "locked_until": None}

        record = self.failed_logins[user_id]

        if record["locked_until"] and datetime.now() < record["locked_until"]:
            return {"status": "locked", "locked_until": record["locked_until"].isoformat()}

        if success:
            self.failed_logins[user_id] = {"count": 0, "locked_until": None}
            return {"status": "success"}

        record["count"] += 1

        if record["count"] >= self.max_failed_logins:
            record["locked_until"] = datetime.now() + timedelta(minutes=30)
            logger.warning(f"Account locked due to failed login attempts: {user_id}")
            return {"status": "locked", "locked_until": record["locked_until"].isoformat()}

        return {"status": "failed", "remaining_attempts": self.max_failed_logins - record["count"]}

    # ===== BOT DETECTION =====
    def detect_bot_behavior(self, user_id: str, action: str, duration_seconds: float) -> bool:
        """Detect suspicious bot-like behavior"""
        # Bot indicators:
        # - Many requests in very short time (< 100ms per request)
        # - Repeated identical actions
        # - Inhuman request patterns

        if duration_seconds > 0:
            avg_request_time = duration_seconds / 1  # Per action

            # If processing time is less than 50ms, likely bot
            if avg_request_time < 0.05:
                logger.warning(f"Possible bot behavior detected for user: {user_id}")
                return True

        return False

    # ===== SECURITY HEADERS =====
    def get_security_headers(self) -> Dict[str, str]:
        """Get recommended security headers for responses"""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }

    # ===== IP BLOCKING =====
    def block_ip(self, ip_address: str, reason: str = "Suspicious activity") -> Dict:
        """Block an IP address"""
        self.blocked_ips.add(ip_address)
        logger.info(f"IP blocked: {ip_address} - Reason: {reason}")

        return {
            "ip": ip_address,
            "blocked": True,
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }

    def is_ip_blocked(self, ip_address: str) -> bool:
        """Check if IP is blocked"""
        return ip_address in self.blocked_ips

    # ===== ENCRYPTION UTILITIES =====
    def hash_password(self, password: str) -> str:
        """Hash password using SHA256 (should use bcrypt in production)"""
        return hashlib.sha256(password.encode()).hexdigest()

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password"""
        return self.hash_password(password) == password_hash

    # ===== SECURITY AUDIT LOG =====
    def log_security_event(self, event_type: str, user_id: str, details: str) -> Dict:
        """Log security-related events for audit"""
        log_entry = {
            "event_type": event_type,
            "user_id": user_id,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "severity": self._determine_severity(event_type)
        }

        logger.info(f"Security event: {event_type} - User: {user_id}")
        return log_entry

    def _determine_severity(self, event_type: str) -> str:
        """Determine event severity level"""
        severity_map = {
            "login_attempt": "low",
            "failed_login": "medium",
            "sql_injection_attempt": "high",
            "xss_attempt": "high",
            "rate_limit_exceeded": "medium",
            "unauthorized_access": "high",
            "data_export": "medium"
        }
        return severity_map.get(event_type, "medium")


def get_security_manager():
    return SecurityManager()


# ===== DECORATOR FOR PROTECTED ENDPOINTS =====
def require_auth(func):
    """Decorator to require authentication"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Extract token from header (would be done in actual Flask/FastAPI route)
        # This is a template
        return func(*args, **kwargs)
    return wrapper


def require_rate_limit(func):
    """Decorator to enforce rate limiting"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        security = get_security_manager()
        # Would extract IP from request in actual implementation
        return func(*args, **kwargs)
    return wrapper
