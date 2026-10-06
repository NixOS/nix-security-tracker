import pytest
from django.test import Client


@pytest.mark.django_db(transaction=True)
def test_metrics_endpoint_exposes_django_prometheus_metrics() -> None:
    client = Client()
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "django_http_requests_total_by_method_total" in response.content.decode()
