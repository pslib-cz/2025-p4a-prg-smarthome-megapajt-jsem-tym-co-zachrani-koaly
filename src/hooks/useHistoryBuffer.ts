import { useRef, useCallback } from "react";
import type { DataPoint } from "../types";
import { HISTORY_MAX_ENTRIES } from "../config";

export function useHistoryBuffer() {
    const buffers = useRef<{
        humidity: DataPoint[];
    }>({
        humidity: [],
    });

    const pushHumidity = useCallback((value: number) => {
        const buf = buffers.current.humidity;
        buf.push({ timestamp: Date.now(), value });
        if (buf.length > HISTORY_MAX_ENTRIES) buf.shift();
    }, []);

    const getSlice = useCallback((rangeMs: number) => {
        const cutoff = Date.now() - rangeMs;
        return {
            humidity: buffers.current.humidity.filter(
                (p) => p.timestamp >= cutoff,
            ),
        };
    }, []);

    return { pushHumidity, getSlice };
}
