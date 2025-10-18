# views_ai.py
import openai
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Product
from django.utils import timezone   # ✅ correct one
from django.db.models import Sum, Count

openai.api_key = settings.OPENAI_API_KEY

class FlowmerceAssistantView(APIView):
    def post(self, request):
        import traceback

        print("✅ [AI Assistant] Endpoint hit")

        try:
            user_message = request.data.get('message', '')
            print("💬 User message:", user_message)

            # Basic business data for context
            today = timezone.now()
            print("🕒 Current time:", today)

            month_start = today.replace(day=1)
            month_orders = Order.objects.filter(created_at__gte=month_start)
            monthly_revenue = month_orders.aggregate(total=Sum('amount'))['total'] or 0
            order_count = month_orders.count()
            print(f"📊 Orders this month: {order_count}, Revenue: {monthly_revenue}")

            # Summarize data into context
            business_context = (
                f"This business has made {order_count} orders this month, "
                f"earning a total of ${monthly_revenue:.2f} in revenue. "
                f"The assistant should provide useful business insights "
                f"and answer general questions clearly and helpfully."
            )

            # Combine user message with context
            prompt = f"""
            Business Data:
            {business_context}

            User Message:
            {user_message}
            """

            print("🧠 Sending prompt to OpenAI...")

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful AI business assistant for internal use."},
                    {"role": "user", "content": prompt}
                ],
            )

            print("✅ Response received from OpenAI")

            ai_reply = response.choices[0].message.content.strip()
            print("🤖 AI reply:", ai_reply)

            return Response({"reply": ai_reply}, status=status.HTTP_200_OK)

        except Exception as e:
            print("❌ ERROR in FlowmerceAssistantView.post():", e)
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
