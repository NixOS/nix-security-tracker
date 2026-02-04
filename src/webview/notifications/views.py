from typing import Any

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import QuerySet
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.views.generic import ListView, TemplateView, View

from webview.models import Notification, Profile


class NotificationCenterView(LoginRequiredMixin, ListView):
    template_name = "notifications/notification_center.html"
    model = Notification
    context_object_name = "notifications"
    paginate_by = 10

    def get_queryset(self) -> QuerySet[Notification]:
        return (
            Notification.objects.filter(user=self.request.user)
            .select_related("user__profile", "suggestionnotification__suggestion__cve")
            .order_by("-created_at")
            .select_subclasses()
        )

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)

        context["adjusted_elided_page_range"] = context[
            "paginator"
        ].get_elided_page_range(context["page_obj"].number)

        return context


class ToggleNotificationReadView(LoginRequiredMixin, TemplateView):
    template_name = "notifications/components/notification.html"

    def post(self, request: HttpRequest, notification_id: int) -> HttpResponse:
        notification = get_object_or_404(
            Notification.objects.select_related("user__profile").select_subclasses(),
            id=notification_id,
            user=request.user,
        )
        new_unread_count = notification.toggle_read()

        if request.headers.get("HX-Request"):
            return self.render_to_response(
                {"notification": notification, "new_unread_count": new_unread_count}
            )
        else:
            page = request.POST.get("page", "1")
            url = reverse("webview:notifications:center")
            return redirect(f"{url}?page={page}")


class MarkAllNotificationsReadView(LoginRequiredMixin, View):
    def post(self, request: HttpRequest) -> HttpResponse:
        Profile.objects.get(user=request.user).mark_all_read_for_user()

        if request.headers.get("HX-Request"):
            return HttpResponse(headers={"HX-Refresh": "true"})
        else:
            page = request.POST.get("page", "1")
            url = reverse("webview:notifications:center")
            return redirect(f"{url}?page={page}")


class RemoveAllReadNotificationsView(LoginRequiredMixin, View):
    def post(self, request: HttpRequest) -> HttpResponse:
        # Use manager method to clear read notifications

        Profile.objects.get(user=request.user).clear_read_for_user()

        # Let's redirect to first page as were we are might no longer exist
        url = reverse("webview:notifications:center")
        if request.headers.get("HX-Request"):
            return HttpResponse(headers={"HX-Redirect": url})
        else:
            return redirect(url)
