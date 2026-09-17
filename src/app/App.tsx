import { ViewModeFrame } from "./layouts/ViewModeFrame";
import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./router/AppRouter";

export function App() {
  return (
    <AppProviders>
      <ViewModeFrame>
        <AppRouter />
      </ViewModeFrame>
    </AppProviders>
  );
}
