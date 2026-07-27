import { useState } from "react";

import { runShopMonitoring } from "../api/monitoringApi";

export function useShopSearch(shop) {
    const [selectedListId, setSelectedListId] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const runSearch = async () => {
        if (!shop || !selectedListId) return;

        setLoading(true);
        setError(null);
        try {
            const rows = await runShopMonitoring(shop.id, selectedListId);
            setResults(rows);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        results,
        error,
        selectedListId,
        setSelectedListId,
        runSearch,
    };
}
