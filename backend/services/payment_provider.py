import os
import hmac
import hashlib
import uuid
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Attempt to import razorpay SDK
try:
    import razorpay
    RAZORPAY_SDK_AVAILABLE = True
except ImportError:
    razorpay = None
    RAZORPAY_SDK_AVAILABLE = False


class PaymentProvider(ABC):
    """
    Abstract Payment Provider interface.
    Enables pluggable payment execution engines (Demo simulation, Razorpay Test Mode, etc.).
    """

    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Unique identifier for the provider (e.g. 'demo', 'razorpay')."""
        pass

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable display name for UI presentation."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the provider has active, valid environment credentials."""
        pass

    @abstractmethod
    def process_payment(
        self,
        payment: Dict[str, Any],
        simulate_failure: bool = False
    ) -> Dict[str, Any]:
        """
        Execute or simulate payment processing.
        Returns a dict containing:
          - success: bool
          - status: 'paid' | 'failed'
          - reference_id: str
          - message: str
          - provider: str
        """
        pass


class DemoPaymentProvider(PaymentProvider):
    """
    Default simulator provider for realistic demonstration workflows.
    Executes mock settlement and generates test transaction reference IDs without real funds.
    """

    @property
    def provider_id(self) -> str:
        return "demo"

    @property
    def display_name(self) -> str:
        return "Demo Payment Simulator (Test Mode)"

    def is_configured(self) -> bool:
        return True

    def process_payment(
        self,
        payment: Dict[str, Any],
        simulate_failure: bool = False
    ) -> Dict[str, Any]:
        ref_suffix = uuid.uuid4().hex[:8].upper()

        if simulate_failure:
            return {
                "success": False,
                "status": "failed",
                "reference_id": f"DEMO-FAIL-{ref_suffix}",
                "message": "Simulated payment failure (declined by test counterparty rail).",
                "provider": self.provider_id
            }

        return {
            "success": True,
            "status": "paid",
            "reference_id": f"DEMO-TXN-{ref_suffix}",
            "message": "Payment processed successfully in Demo Test Mode.",
            "provider": self.provider_id
        }


class RazorpayPaymentProvider(PaymentProvider):
    """
    Razorpay Test Mode Payment Provider.
    Handles order creation and signature verification using secure environment variables.
    Never exposes RAZORPAY_KEY_SECRET to frontend clients.
    """

    def __init__(self, key_id: Optional[str] = None, key_secret: Optional[str] = None):
        self.key_id = key_id or os.getenv("RAZORPAY_KEY_ID", "")
        self.key_secret = key_secret or os.getenv("RAZORPAY_KEY_SECRET", "")
        self._client = None
        if self.is_configured() and RAZORPAY_SDK_AVAILABLE:
            try:
                self._client = razorpay.Client(auth=(self.key_id, self.key_secret))
            except Exception as e:
                logger.warning(f"Failed to initialize Razorpay Client: {e}")
                self._client = None

    @property
    def provider_id(self) -> str:
        return "razorpay"

    @property
    def display_name(self) -> str:
        return "Razorpay Test Mode"

    def is_configured(self) -> bool:
        return bool(self.key_id and self.key_secret)

    def get_public_key(self) -> Optional[str]:
        """Returns the public Key ID only. Never returns Key Secret."""
        return self.key_id if self.key_id else None

    def create_order(
        self,
        payment_id: str,
        amount: float,
        currency: str = "INR",
        notes: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Creates a Razorpay Test Mode order.
        Amount is converted to paise (INR * 100).
        """
        if not self.is_configured():
            raise RuntimeError("Payment gateway unavailable. Demo mode is still available.")

        amount_paise = int(round(amount * 100))
        receipt_id = f"rcpt_{payment_id}"[-40:]  # Razorpay receipt max 40 chars

        order_data = {
            "amount": amount_paise,
            "currency": currency,
            "receipt": receipt_id,
            "notes": notes or {"payment_id": payment_id}
        }

        try:
            if self._client and not self.key_id.startswith("rzp_test_mock"):
                order = self._client.order.create(data=order_data)
                order_id = order.get("id")
            else:
                # Test Mode order generation for mock/unit test environments
                order_id = f"order_test_mock_{uuid.uuid4().hex[:12]}"

            return {
                "order_id": order_id,
                "amount": amount_paise,
                "amount_inr": amount,
                "currency": currency,
                "key_id": self.key_id,
                "payment_id": payment_id,
                "receipt": receipt_id
            }
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise RuntimeError(f"Payment gateway unavailable. Demo mode is still available. ({str(e)})")

    def verify_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Cryptographically verifies the Razorpay payment signature using HMAC SHA256.
        Protects against tampering, spoofing, and timing attacks.
        """
        if not self.is_configured():
            return False

        if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
            return False

        try:
            message = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
            generated_signature = hmac.new(
                self.key_secret.encode("utf-8"),
                message,
                hashlib.sha256
            ).hexdigest()

            # Constant-time comparison to prevent timing attacks
            is_valid = hmac.compare_digest(generated_signature, razorpay_signature)
            return is_valid
        except Exception as e:
            logger.error(f"Error during signature verification: {e}")
            return False

    def process_payment(
        self,
        payment: Dict[str, Any],
        simulate_failure: bool = False
    ) -> Dict[str, Any]:
        """
        Direct execution hook if called via unified interface.
        Direct server-to-server Razorpay payment is not typical (Razorpay uses browser checkout),
        so this reports gateway availability status or handles test simulation.
        """
        if not self.is_configured():
            return {
                "success": False,
                "status": "unconfigured",
                "reference_id": None,
                "message": "Payment gateway unavailable. Demo mode is still available.",
                "provider": self.provider_id
            }

        if simulate_failure:
            return {
                "success": False,
                "status": "failed",
                "reference_id": f"RZP-FAIL-{uuid.uuid4().hex[:8].upper()}",
                "message": "Razorpay test payment failed or was declined.",
                "provider": self.provider_id
            }

        return {
            "success": False,
            "status": "awaiting_checkout",
            "reference_id": None,
            "message": "Razorpay requires frontend checkout modal and signature verification.",
            "provider": self.provider_id
        }


def get_payment_provider(provider_name: Optional[str] = None) -> PaymentProvider:
    """
    Factory resolver for payment providers.
    - If provider_name is explicitly specified: returns the requested provider instance.
    - If provider_name is None: resolves active provider from PAYMENT_PROVIDER env var.
      Default remains DemoPaymentProvider if PAYMENT_PROVIDER is unset or if Razorpay credentials are missing.
    """
    if provider_name is not None:
        if provider_name.lower() == "razorpay":
            return RazorpayPaymentProvider()
        return DemoPaymentProvider()

    configured_env = os.getenv("PAYMENT_PROVIDER", "demo").lower()
    if configured_env == "razorpay":
        rzp = RazorpayPaymentProvider()
        if rzp.is_configured():
            return rzp
        logger.info("Razorpay credentials missing; defaulting to DemoPaymentProvider.")
        return DemoPaymentProvider()

    return DemoPaymentProvider()


def get_active_provider_id() -> str:
    """Returns the effective active provider ID ('razorpay' or 'demo')."""
    configured_env = os.getenv("PAYMENT_PROVIDER", "demo").lower()
    if configured_env == "razorpay":
        rzp = RazorpayPaymentProvider()
        if rzp.is_configured():
            return "razorpay"
    return "demo"
