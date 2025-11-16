import ChartView from "./components/chart/chart-view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ChartView />
        </QueryClientProvider>
    );
}

export default App;
