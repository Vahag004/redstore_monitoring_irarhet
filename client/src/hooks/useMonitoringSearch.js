import { useState } from "react";

import { runListMonitoring } from "../api/monitoringApi";

export function useMonitoringSearch() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // The backend does the actual Playwright scraping for every product's
    // stored links; we just pass the list id and get rows back.
    const runSearch = async (listId) => {
        if (!listId) return;
        setLoading(true);
        setError(null);
        try {
            const rows = await runListMonitoring(listId);
            setResults(rows);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, results, error, runSearch };
}
