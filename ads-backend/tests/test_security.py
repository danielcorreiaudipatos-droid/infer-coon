"""Security Tests - Input validation, XSS, SQL injection, rate limiting"""

import unittest
from ads_backend.security.security_manager import SecurityManager


class TestInputValidation(unittest.TestCase):
    """Test input validation and sanitization"""

    def setUp(self):
        self.security = SecurityManager()

    def test_email_validation_valid(self):
        """Test valid email passes validation"""
        self.assertTrue(self.security.validate_email("user@example.com"))
        self.assertTrue(self.security.validate_email("test.user+tag@domain.co.uk"))

    def test_email_validation_invalid(self):
        """Test invalid emails fail validation"""
        self.assertFalse(self.security.validate_email("invalid"))
        self.assertFalse(self.security.validate_email("@example.com"))
        self.assertFalse(self.security.validate_email("user@"))

    def test_string_sanitization(self):
        """Test dangerous characters are removed"""
        malicious = "Hello<script>alert('xss')</script>World"
        sanitized = self.security.sanitize_string(malicious)

        self.assertNotIn("<script>", sanitized)
        self.assertIn("Hello", sanitized)

    def test_max_length_enforcement(self):
        """Test input length is limited"""
        long_string = "a" * 2000
        sanitized = self.security.sanitize_string(long_string, max_length=100)

        self.assertEqual(len(sanitized), 100)

    def test_null_byte_removal(self):
        """Test null bytes are removed"""
        text_with_null = "hello\x00world"
        sanitized = self.security.sanitize_string(text_with_null)

        self.assertNotIn("\x00", sanitized)


class TestSQLInjectionPrevention(unittest.TestCase):
    """Test SQL injection detection"""

    def setUp(self):
        self.security = SecurityManager()

    def test_union_select_detection(self):
        """Test UNION SELECT injection is detected"""
        payload = "' UNION SELECT * FROM users--"
        self.assertFalse(self.security.check_sql_injection(payload))

    def test_or_1_1_detection(self):
        """Test OR 1=1 injection is detected"""
        payload = "' OR '1'='1"
        self.assertFalse(self.security.check_sql_injection(payload))

    def test_drop_table_detection(self):
        """Test DROP TABLE injection is detected"""
        payload = "'; DROP TABLE users;--"
        self.assertFalse(self.security.check_sql_injection(payload))

    def test_normal_text_passes(self):
        """Test normal text passes SQL injection check"""
        normal = "John Doe"
        self.assertTrue(self.security.check_sql_injection(normal))


class TestXSSPrevention(unittest.TestCase):
    """Test XSS attack detection"""

    def setUp(self):
        self.security = SecurityManager()

    def test_script_tag_detection(self):
        """Test <script> tag is detected"""
        payload = "<script>alert('xss')</script>"
        self.assertFalse(self.security.check_xss(payload))

    def test_javascript_protocol_detection(self):
        """Test javascript: protocol is detected"""
        payload = '<a href="javascript:alert(1)">click</a>'
        self.assertFalse(self.security.check_xss(payload))

    def test_event_handler_detection(self):
        """Test event handler (onclick, onload) is detected"""
        payload = '<img src=x onerror="alert(1)">'
        self.assertFalse(self.security.check_xss(payload))

    def test_iframe_detection(self):
        """Test iframe injection is detected"""
        payload = '<iframe src="evil.com"></iframe>'
        self.assertFalse(self.security.check_xss(payload))

    def test_normal_content_passes(self):
        """Test normal content passes XSS check"""
        normal = "Hello World! Check out this link."
        self.assertTrue(self.security.check_xss(normal))

    def test_html_escaping(self):
        """Test HTML entities are escaped"""
        dangerous = '<script>alert("xss")</script>'
        escaped = self.security.escape_html(dangerous)

        self.assertNotIn("<script>", escaped)
        self.assertIn("&lt;", escaped)


class TestRateLimiting(unittest.TestCase):
    """Test rate limiting"""

    def setUp(self):
        self.security = SecurityManager()
        self.ip = "192.168.1.100"

    def test_initial_request_allowed(self):
        """Test first request is allowed"""
        self.assertTrue(self.security.check_rate_limit(self.ip))

    def test_multiple_requests_allowed(self):
        """Test multiple requests within limit are allowed"""
        for i in range(50):
            result = self.security.check_rate_limit(self.ip)
            self.assertTrue(result)

    def test_rate_limit_exceeded(self):
        """Test request is blocked after exceeding limit"""
        # Make 60 requests
        for i in range(60):
            self.security.check_rate_limit(self.ip)

        # 61st request should be blocked
        result = self.security.check_rate_limit(self.ip)
        self.assertFalse(result)


class TestJWTAuthentication(unittest.TestCase):
    """Test JWT token generation and verification"""

    def setUp(self):
        self.security = SecurityManager()

    def test_jwt_token_generation(self):
        """Test JWT token is generated"""
        token = self.security.generate_jwt_token("user_001")

        self.assertIsNotNone(token)
        self.assertIsInstance(token, str)
        self.assertGreater(len(token), 50)

    def test_jwt_token_verification(self):
        """Test generated token can be verified"""
        user_id = "user_001"
        token = self.security.generate_jwt_token(user_id)

        payload = self.security.verify_jwt_token(token)

        self.assertIsNotNone(payload)
        self.assertEqual(payload["user_id"], user_id)

    def test_invalid_token_rejected(self):
        """Test invalid token is rejected"""
        invalid_token = "invalid.token.here"
        payload = self.security.verify_jwt_token(invalid_token)

        self.assertIsNone(payload)


class TestWebhookSecurity(unittest.TestCase):
    """Test webhook signature verification"""

    def setUp(self):
        self.security = SecurityManager()

    def test_webhook_signature_verification(self):
        """Test webhook signature is verified correctly"""
        payload = '{"order_id": 12345}'
        secret = "webhook_secret_key"

        signature = self.security._generate_hmac(payload, secret)

        result = self.security.verify_webhook_signature(payload, signature, secret)
        self.assertTrue(result)

    def test_invalid_webhook_signature_rejected(self):
        """Test invalid webhook signature is rejected"""
        payload = '{"order_id": 12345}'
        secret = "webhook_secret_key"
        wrong_signature = "invalid_signature_12345"

        result = self.security.verify_webhook_signature(payload, wrong_signature, secret)
        self.assertFalse(result)

    def _generate_hmac(self, payload, secret):
        """Helper to generate HMAC signature"""
        import hmac
        import hashlib
        return hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()


class TestLoginAttemptTracking(unittest.TestCase):
    """Test login attempt protection"""

    def setUp(self):
        self.security = SecurityManager()

    def test_successful_login_resets_counter(self):
        """Test successful login resets failed attempts"""
        user_id = "user_001"

        # Record failed attempts
        self.security.track_login_attempt(user_id, False)
        self.security.track_login_attempt(user_id, False)

        # Success resets counter
        result = self.security.track_login_attempt(user_id, True)
        self.assertEqual(result["status"], "success")

    def test_account_locked_after_5_failures(self):
        """Test account is locked after 5 failed attempts"""
        user_id = "user_001"

        for i in range(5):
            result = self.security.track_login_attempt(user_id, False)

        # 5th attempt should lock account
        self.assertEqual(result["status"], "locked")


class TestIPBlocking(unittest.TestCase):
    """Test IP blocking functionality"""

    def setUp(self):
        self.security = SecurityManager()

    def test_ip_can_be_blocked(self):
        """Test IP address can be blocked"""
        ip = "192.168.1.100"

        self.security.block_ip(ip, "Suspicious activity")

        self.assertTrue(self.security.is_ip_blocked(ip))

    def test_non_blocked_ip_allowed(self):
        """Test non-blocked IP is allowed"""
        ip = "192.168.1.200"

        self.assertFalse(self.security.is_ip_blocked(ip))


class TestPasswordSecurity(unittest.TestCase):
    """Test password hashing and verification"""

    def setUp(self):
        self.security = SecurityManager()

    def test_password_hashing(self):
        """Test password is hashed"""
        password = "SecurePassword123"
        hashed = self.security.hash_password(password)

        self.assertNotEqual(password, hashed)
        self.assertEqual(len(hashed), 64)  # SHA256 hex = 64 chars

    def test_password_verification(self):
        """Test password can be verified"""
        password = "SecurePassword123"
        hashed = self.security.hash_password(password)

        result = self.security.verify_password(password, hashed)
        self.assertTrue(result)

    def test_wrong_password_fails(self):
        """Test wrong password fails verification"""
        password = "SecurePassword123"
        hashed = self.security.hash_password(password)

        result = self.security.verify_password("WrongPassword", hashed)
        self.assertFalse(result)


class TestSecurityHeaders(unittest.TestCase):
    """Test security headers"""

    def setUp(self):
        self.security = SecurityManager()

    def test_security_headers_present(self):
        """Test all required security headers are present"""
        headers = self.security.get_security_headers()

        self.assertIn("X-Content-Type-Options", headers)
        self.assertIn("X-Frame-Options", headers)
        self.assertIn("Strict-Transport-Security", headers)
        self.assertIn("Content-Security-Policy", headers)


if __name__ == "__main__":
    unittest.main()
