import { QueryClientProvider } from "@tanstack/react-query";
import { LucideProvider } from "lucide-preact";
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
import { NotificationCenter } from "@/routes/NotificationCenter";
import { paths } from "@/routes/paths";
import { SuggestionDetail } from "@/routes/SuggestionDetail";
import { SuggestionDetailByCve } from "@/routes/SuggestionDetailByCve";
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
      {/* NOTE(@florentc): Lucide types the provider size as a number, but any CSS length is passed through to the icons. */}
      <LucideProvider size={"1em" as unknown as number}>
        <Disclaimer />
        <HeaderBar />
        <main>
          <Switch>
            <Route path={paths.suggestionById} component={SuggestionDetail} />
            <Route path={paths.suggestionByCve} component={SuggestionDetailByCve} />
            <Route path={paths.suggestions} component={SuggestionList} />
            <Route path={paths.issue} component={IssueDetail} />
            <Route path={paths.issues} component={IssueList} />
            <Route path={paths.notifications} component={NotificationCenter} />
            <Route path={paths.home} component={Home} />
            <Route path={paths.user}>
              <Redirect to={paths.userSubscriptions} />
            </Route>
            <Route path={paths.userSubscriptions} component={UserSettings} />
            <Route path={paths.userTokens} component={UserSettings} />
            <Route>
              <p>Page not found</p>
            </Route>
          </Switch>
        </main>
        <Footer />
        <Toaster toaster={toaster} />
      </LucideProvider>
    </QueryClientProvider>
  );
}
