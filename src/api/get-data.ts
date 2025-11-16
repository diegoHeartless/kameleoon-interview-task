import { useQuery } from "@tanstack/react-query";

/**
 * Hook для получения данных графика.
 * Пытается подключиться к локальному серверу (для разработки),
 * если не удается - использует статический JSON файл (для GitHub Pages).
 */
function useGetData() {
    const { data } = useQuery({
        queryKey: ["getdata"],
        queryFn: async () => {
            // Пытаемся подключиться к локальному серверу
            const useLocalServer = import.meta.env.DEV && !import.meta.env.VITE_USE_JSON_DATA;

            if (useLocalServer) {
                try {
                    const response = await fetch("http://localhost:3001/data");
                    if (response.ok) {
                        return await response.json();
                    }
                } catch (e) {
                    // Если сервер недоступен, используем JSON файл
                    console.warn("Local server not available, using static JSON file", e);
                }
            }

            // Используем статический JSON файл (работает на GitHub Pages)
            const base = import.meta.env.BASE_URL || "/";
            const jsonPath = `${base}data.json`;
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            return await response.json();
        },
    });

    return data;
}

export default useGetData;
