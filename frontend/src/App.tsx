import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Route, Switch } from "wouter-preact";
import { Footer } from "@/components/footer/Footer";
import { Disclaimer } from "@/components/header/Disclaimer";
import { HeaderBar } from "@/components/header/HeaderBar";
import { Home } from "@/routes/Home";
import { UserSettings } from "@/routes/UserSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HeaderBar />
      <Disclaimer />
      <main>
        <Switch>
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
    </QueryClientProvider>
  );
}
