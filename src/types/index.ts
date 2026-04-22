export interface DataPoint {
    timestamp: number;
    value: number;
}

export interface GreenhouseState {
    humidity: number;
    waterPresent: boolean;
    windowOpen: boolean;
    pumpOn: boolean;
    lightOn: boolean;
    connected: boolean;
    connecting: boolean;
    lastUpdate: Date | null;
    history: {
        humidity: DataPoint[];
    };
}

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface HaStateChangedEvent {
    event_type: "state_changed";
    data: {
        entity_id: string;
        new_state: {
            state: string;
            attributes: Record<string, unknown>;
            last_updated: string;
        } | null;
        old_state: {
            state: string;
            attributes: Record<string, unknown>;
        } | null;
    };
}

export interface HaAuthRequired {
    type: "auth_required";
    ha_version: string;
}

export interface HaAuthOk {
    type: "auth_ok";
    ha_version: string;
}

export interface HaAuthInvalid {
    type: "auth_invalid";
    message: string;
}

export interface HaResultOk {
    id: number;
    type: "result";
    success: true;
    result: unknown;
}

export interface HaResultError {
    id: number;
    type: "result";
    success: false;
    error: { code: string; message: string };
}

export interface HaEvent {
    id: number;
    type: "event";
    event: HaStateChangedEvent;
}

export type HaMessage =
    | HaAuthRequired
    | HaAuthOk
    | HaAuthInvalid
    | HaResultOk
    | HaResultError
    | HaEvent;
