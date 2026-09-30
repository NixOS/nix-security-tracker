"""
Route definitions for UI v2 tests.
Mirrors the client-side routes from the frontend App.
To be kept in sync.
"""
# FIXME(@fricklerhandwerk): Read the routes from a single source of truth.

PREFIX = ""
HOME = f"{PREFIX}/"
USER_SETTINGS_SUBSCRIPTIONS = f"{PREFIX}/user/subscriptions"
USER_SETTINGS_TOKENS = f"{PREFIX}/user/tokens"
PACKAGE_SUBSCRIPTION = f"{PREFIX}/user/subscriptions/packages"
SUGGESTION_LIST = f"{PREFIX}/suggestions"
SUGGESTION_DETAIL = f"{PREFIX}/suggestions/by-id"
SUGGESTION_DETAIL_BY_CVE = f"{PREFIX}/suggestions/by-cve"
ISSUE_LIST = f"{PREFIX}/issues"
ISSUE_DETAIL = f"{PREFIX}/issues"
NOTIFICATIONS = f"{PREFIX}/notifications"
