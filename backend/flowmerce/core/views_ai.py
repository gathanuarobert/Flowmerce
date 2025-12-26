from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from django.db.models import Sum
from django.core.cache import cache
from .models import Order, OrderItem
import requests, json, traceback


class FlowmerceAssistantView(APIView):

    def get_business_stats(self):
        """Fetch or cache business stats with minimal DB work."""

        cached = cache.get("business_stats")
        if cached:
            return cached

        print("📊 Refreshing business stats cache...")

        today = timezone.now()
        month_start = today.replace(day=1)

        # Single DB hit for monthly orders + revenue
        month_orders = Order.objects.filter(created_at__gte=month_start)
        revenue = month_orders.aggregate(total=Sum("amount"))["total"] or 0
        order_count = month_orders.count()

        # Top 5 products
        top_qs = (
            OrderItem.objects.filter(order__created_at__gte=month_start)
            .values("product__title")
            .annotate(total_sold=Sum("quantity"))
            .order_by("-total_sold")[:5]
        )

        top = (
            ", ".join(
                f"{p['product__title']} (**{p['total_sold']} sold**)"
                for p in top_qs
            )
            if top_qs.exists()
            else "No sales data available yet."
        )

        stats = {
            "revenue": revenue,
            "orders": order_count,
            "top": top,
        }

        cache.set("business_stats", stats, timeout=3600)  # 1 hour cache
        return stats

    def post(self, request):
        print("⚡ [Flowmerce AI] Fast request received")

        try:
            user_message = request.data.get("message", "").strip()

            # Load cached business stats (fixed 1 DB hit if cache expired)
            stats = self.get_business_stats()

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

   
    "seed": 3
}
            }

            session = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                stream=True,
                timeout=60
            )

            def stream():
                # Send first byte instantly so frontend feels instant
                yield "\u200b"

                try:
                    for raw in session.iter_lines(decode_unicode=False, delimiter=b"\n"):
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

            return StreamingHttpResponse(stream(), content_type="text/plain; charset=utf-8")

        except Exception as e:
            print("❌ ERROR:", e)
            traceback.print_exc()
            return StreamingHttpResponse(
                f"⚠️ Internal Server Error: {str(e)}",
                content_type="text/plain",
                status=500,
            )
