import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "preact/hooks";
import { Redirect, Route, Switch } from "wouter-preact";
import { queryClient } from "@/api/queryClient";
import { Footer } from "@/components/footer/Footer";
import { Disclaimer } from "@/components/header/Disclaimer";
import { HeaderBar } from "@/components/header/HeaderBar";
import { Toaster } from "@/components/ui/Toaster";
import { Home } from "@/routes/Home";
import { IssueDetail } from "@/routes/IssueDetail";
import { IssueList } from "@/routes/IssueList";
import { SuggestionDetail } from "@/routes/SuggestionDetail";
import { SuggestionList } from "@/routes/SuggestionList";
import { UserSettings } from "@/routes/UserSettings";
import { toaster } from "@/utils/toaster";

export function App() {
  // Fallback landing page when allauth's GitHub OAuth handshake fails
  // The url param is set in settings.py: HEADLESS_FRONTEND_URLS["socialaccount_login_error"]
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("login_error")) {
      toaster.error({
        title: "Login failed",
        description: "Something went wrong signing in with GitHub. Please try again.",
      });
      url.searchParams.delete("login_error");
      window.history.replaceState({}, "", url);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Disclaimer />
      <HeaderBar />
      <main>
        <Switch>
          <Route path="/ui-v2/suggestions/by-id/:id" component={SuggestionDetail} />
          <Route path="/ui-v2/suggestions" component={SuggestionList} />
          <Route path="/ui-v2/issues/:code" component={IssueDetail} />
          <Route path="/ui-v2/issues" component={IssueList} />
          <Route path="/ui-v2/" component={Home} />
          <Route path="/ui-v2/user">
            <Redirect to="/ui-v2/user/subscriptions" />
          </Route>
          <Route path="/ui-v2/user/subscriptions" component={UserSettings} />
          <Route path="/ui-v2/user/tokens" component={UserSettings} />
          <Route>
            <p>Page not found</p>
          </Route>
        </Switch>
      </main>
      <Footer />
      <Toaster toaster={toaster} />
    </QueryClientProvider>
  );
}
