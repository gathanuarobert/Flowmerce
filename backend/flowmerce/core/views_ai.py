from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from django.db.models import Sum
from .models import Order
import requests, json, traceback


class FlowmerceAssistantView(APIView):
    def post(self, request):
        print("✅ [AI Assistant] Streaming endpoint hit")

        try:
            user_message = request.data.get("message", "")
            print("💬 User message:", user_message)

            # --- Business context ---
            today = timezone.now()
            month_start = today.replace(day=1)
            month_orders = Order.objects.filter(created_at__gte=month_start)
            monthly_revenue = month_orders.aggregate(total=Sum("amount"))["total"] or 0
            order_count = month_orders.count()

            business_context = (
                f"This business has made {order_count} orders this month, "
                f"earning a total of ${monthly_revenue:.2f} in revenue. "
                f"The assistant should provide useful business insights "
                f"and answer general questions clearly and helpfully."
            )

            prompt = f"""
Business Data:
{business_context}

User Message:
{user_message}
            """

            print("🧠 Sending streaming request to Ollama...")

            payload = {
                "model": "phi3:mini",  # you can switch models here
                "prompt": prompt,
                "stream": True,         # ✅ important for live output
            }

            # Make streaming request to Ollama
            ollama_response = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                stream=True,
                timeout=None,  # ⏱️ no timeout for long answers
            )

            def stream_ollama():
                """Yield tokens from Ollama in real time"""
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

                    print("✅ Stream ended successfully")
                except Exception as e:
                    print("❌ Stream error:", e)
                    traceback.print_exc()
                    yield "\n\n⚠️ An error occurred while streaming from Ollama."

            # Return streaming HTTP response
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
