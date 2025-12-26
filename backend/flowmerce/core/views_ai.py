from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from django.db.models import Sum
from django.core.cache import cache
from .models import Order, OrderItem
import requests, json, traceback


class FlowmerceAssistantView(APIView):
    def post(self, request):
        print("✅ [AI Assistant] Streaming endpoint hit")

        try:
            user_message = request.data.get("message", "").strip()
            print("💬 User message:", user_message)

            # --- Cache monthly data to reduce DB hits ---
            monthly_data = cache.get("monthly_data")
            if not monthly_data:
                today = timezone.now()
                month_start = today.replace(day=1)
                month_orders = Order.objects.filter(created_at__gte=month_start)
                monthly_revenue = month_orders.aggregate(total=Sum("amount"))["total"] or 0
                order_count = month_orders.count()
                monthly_data = {"revenue": monthly_revenue, "orders": order_count}
                cache.set("monthly_data", monthly_data, 300)
            else:
                print("⚡ Using cached monthly data")

            formatted_revenue = f"**KES {monthly_data['revenue']:,.0f}**"
            formatted_orders = f"**{monthly_data['orders']}**"

            # --- Top 5 best-selling products (current month) ---
            today = timezone.now()
            month_start = today.replace(day=1)
            top_products_qs = (
                OrderItem.objects.filter(order__created_at__gte=month_start)
                .values("product__title")
                .annotate(total_sold=Sum("quantity"))
                .order_by("-total_sold")[:5]
            )

            if top_products_qs.exists():
                formatted_top_products = ", ".join(
                    [f"{p['product__title']} (**{p['total_sold']} sold**)" for p in top_products_qs]
                )
            else:
                formatted_top_products = "No sales data available yet."

            # --- Business context for AI ---
            business_context = (
                f"The business has processed {formatted_orders} orders this month "
                f"and generated {formatted_revenue} in total revenue. "
                f"The top 5 best-selling products this month are: {formatted_top_products}. "
                f"Use KES as the currency symbol. When writing numbers, surround them with double asterisks for bold formatting "
                f"(for example: **KES 27,150**). Do not write the word 'bold'. "
                f"Be concise, insightful, and business-professional."
            )

            prompt = f"""
You are Flowmerce AI — a smart, fast business assistant.
Use the context below to answer clearly and directly.

Business Context:
{business_context}

User Message:
{user_message}
"""

            print("🧠 Sending optimized streaming request to Ollama...")

            payload = {
                "model": "phi3:mini",
                "prompt": prompt.strip(),
                "stream": True,
                "options": {"temperature": 0.3, "num_ctx": 1024},
            }

            ollama_response = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                stream=True,
                timeout=None,
            )

            def stream_ollama():
                try:
                    for line in ollama_response.iter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line.decode("utf-8"))
                            chunk = data.get("response", "")
                            if chunk:
                                yield chunk
                        except json.JSONDecodeError:
                            continue
                    print("✅ Stream completed successfully")
                except Exception as e:
                    print("❌ Stream error:", e)
                    traceback.print_exc()
                    yield "\n⚠️ Streaming error occurred."

            return StreamingHttpResponse(
                stream_ollama(),
                content_type="text/plain; charset=utf-8",
            )

        except Exception as e:
            print("❌ ERROR in FlowmerceAssistantView.post():", e)
            traceback.print_exc()
            return StreamingHttpResponse(
                f"⚠️ Internal server error: {str(e)}",
                content_type="text/plain; charset=utf-8",
                status=500,
            )
