export const haConfig = {
    url: import.meta.env.VITE_HA_URL ?? "http://homeassistant.local:8123",
    token: import.meta.env.VITE_HA_TOKEN ?? "",
    entities: {
        humidity:
            import.meta.env.VITE_ENTITY_HUMIDITY ??
            "sensor.esp_sklenik_vlhkost_pudy",
        waterPresent:
            import.meta.env.VITE_ENTITY_WATER_LEVEL ??
            "binary_sensor.esp_sklenik_hladina_vody",
        window: import.meta.env.VITE_ENTITY_WINDOW ?? "switch.esp_sklenik_okno",
        pump: import.meta.env.VITE_ENTITY_PUMP ?? "switch.esp_sklenik_cerpadlo",
        light: import.meta.env.VITE_ENTITY_LIGHT ?? "switch.esp_sklenik_svetlo",
    },
};

export const wsUrl = haConfig.url.replace(/^http/, "ws") + "/api/websocket";

export const HISTORY_MAX_ENTRIES = 10080;
