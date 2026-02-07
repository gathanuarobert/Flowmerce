from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from django.db.models import Sum
from django.core.cache import cache
from .models import Order, OrderItem
from rest_framework.permissions import IsAuthenticated
from .permissions import CanUseAI
import requests, json, traceback
from rest_framework.response import Response
from rest_framework import status


class FlowmerceAssistantView(APIView):
    permission_classes = [IsAuthenticated, CanUseAI]

    def get_business_stats(self, user):
        cache_key = f"business_stats_{user.id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        today = timezone.now()
        month_start = today.replace(day=1)

        month_orders = Order.objects.filter(employee=user, created_at__gte=month_start)

        revenue = month_orders.aggregate(total=Sum("amount"))["total"] or 0
        order_count = month_orders.count()

        top_qs = (
            OrderItem.objects.filter(
                order__employee=user, order__created_at__gte=month_start
            )
            .values("product__title")
            .annotate(total_sold=Sum("quantity"))
            .order_by("-total_sold")[:5]
        )

        top = (
            ", ".join(f"{p['product__title']} ({p['total_sold']} sold)" for p in top_qs)
            if top_qs.exists()
            else "No sales data available yet."
        )

        stats = {
            "revenue": revenue,
            "orders": order_count,
            "top": top,
        }

        cache.set(cache_key, stats, timeout=1800)
        return stats

    def post(self, request):
        print("⚡ [Flowmerce AI] Fast request received")
        # Admin always allowed
        if request.user.is_staff or request.user.is_superuser:
            subscription = None
        else:
            try:
                subscription = request.user.subscription
            except:
                return Response(
                {"message": "You need an active subscription to use the AI assistant."},
                status=status.HTTP_403_FORBIDDEN,
                )

            if subscription.status != "active":
                return Response(
                    {"message": "Your subscription is not active."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            plan_code = subscription.plan.code.lower()

            if plan_code == "basic":
                return Response(
                    {
                        "message": "🚀 The AI assistant is available on Pro and Premium plans. Please upgrade to use it."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if plan_code == "pro" and subscription.ai_requests_used >= 50:
                return Response(
                    {
                        "message": "You’ve reached your monthly AI limit (50 requests). Upgrade to Premium for unlimited access."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )


        try:
            user_message = request.data.get("message", "").strip()

            # Load cached business stats (fixed 1 DB hit if cache expired)
            stats = self.get_business_stats(request.user)

            formatted_revenue = f"**KES {stats['revenue']:,.0f}**"
            formatted_orders = f"**{stats['orders']}**"

            # ULTRA-short prompt = super fast generation
            prompt = f"""
Flowmerce AI:

• Orders this month: {formatted_orders}
• Revenue: {formatted_revenue}
• Top products: {stats['top']}

Reply clearly, briefly, and professionally.
User: {user_message}
"""

            payload = {
                "model": "phi3:mini",
                "prompt": prompt.strip(),
                "stream": True,
                "options": {
                    "temperature": 0.25,
                    "top_p": 0.9,
                    "top_k": 40,
                    "num_predict": 180,
                    "num_ctx": 512,
                    "repeat_penalty": 1.05,
                    "stop": ["User:", "Flowmerce AI:", "\n\n"],
                    "seed": 3,
                },
            }

            session = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                stream=True,
                timeout=60,
            )

            def stream():
                yield "\u200b"

                # increment AI usage
                try:
                    sub = request.user.subscription
                    if sub.plan.code == "pro":
                        sub.ai_requests_used += 1
                        sub.save(update_fields=["ai_requests_used"])
                except:
                    pass

                try:
                    for raw in session.iter_lines(
                        decode_unicode=False, delimiter=b"\n"
                    ):

                        if not raw:
                            continue
                        try:
                            data = json.loads(raw.decode("utf-8"))
                            text = data.get("response", "")
                            if text:
                                yield text
                        except:
                            continue
                except Exception as e:
                    print("❌ Streaming crash:", e)
                    yield "\n⚠️ Streaming error."

            return StreamingHttpResponse(
                stream(), content_type="text/plain; charset=utf-8"
            )

        except Exception as e:
            print("❌ ERROR:", e)
            traceback.print_exc()
            return StreamingHttpResponse(
                f"⚠️ Internal Server Error: {str(e)}",
                content_type="text/plain",
                status=500,
            )
