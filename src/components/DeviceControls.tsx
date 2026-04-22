import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "./Card";

interface DeviceButtonProps {
    label: string;
    activeLabel: string;
    isOn: boolean;
    connected: boolean;
    onToggle: () => void;
    color: string;
    icon: string;
}

const DeviceButton = ({
    label,
    activeLabel,
    isOn,
    connected,
    onToggle,
    color,
    icon,
}: DeviceButtonProps) => {
    const [armed, setArmed] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleClick = () => {
        if (!connected) return;
        if (!armed) {
            setArmed(true);
            timerRef.current = setTimeout(() => setArmed(false), 3000);
        } else {
            setArmed(false);
            if (timerRef.current) clearTimeout(timerRef.current);
            onToggle();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span
                        className="font-mono text-xs tracking-[0.15em] uppercase font-semibold"
                        style={{ color: isOn ? color : "#6b7e6b" }}
                    >
                        {isOn ? activeLabel : label}
                    </span>
                </div>
                <div
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                        backgroundColor: isOn ? color : "#2d3d2d",
                        boxShadow: isOn ? `0 0 8px ${color}` : "none",
                    }}
                />
            </div>

            <motion.button
                onClick={handleClick}
                disabled={!connected}
                whileTap={{ scale: connected ? 0.97 : 1 }}
                className={[
                    "w-full py-2 px-3 rounded-lg border font-mono text-xs tracking-[0.12em] uppercase font-medium",
                    "transition-colors duration-200",
                    !connected
                        ? "border-border text-text-dim cursor-not-allowed"
                        : armed
                          ? "border-warm text-warm bg-warm/10"
                          : isOn
                            ? "border-border-active text-text-secondary hover:border-danger hover:text-danger"
                            : "border-border-active text-text-secondary hover:border-primary hover:text-primary hover:bg-primary-glow",
                ].join(" ")}
            >
                {!connected
                    ? "Nepripojeno"
                    : armed
                      ? "Potvrdit?"
                      : isOn
                        ? "Vypnout"
                        : "Zapnout"}
            </motion.button>
        </div>
    );
};

interface DeviceControlsProps {
    pumpOn: boolean;
    lightOn: boolean;
    waterPresent: boolean;
    connected: boolean;
    onTogglePump: () => void;
    onToggleLight: () => void;
    delay?: number;
}

export const DeviceControls = ({
    pumpOn,
    lightOn,
    waterPresent,
    connected,
    onTogglePump,
    onToggleLight,
    delay = 0,
}: DeviceControlsProps) => (
    <Card delay={delay} className="flex flex-col gap-5">
        <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
            Zarizeni
        </span>

        <DeviceButton
            label="Cerpadlo"
            activeLabel="Cerpadlo bezi"
            isOn={pumpOn}
            connected={connected && waterPresent}
            onToggle={onTogglePump}
            color="#0ea5e9"
            icon="~"
        />

        {!waterPresent && (
            <p className="font-mono text-[10px] text-danger tracking-[0.1em] uppercase -mt-3">
                Zamknuto - nizka hladina vody
            </p>
        )}

        <div className="border-t border-border" />

        <DeviceButton
            label="Svetlo"
            activeLabel="Svetlo sviti"
            isOn={lightOn}
            connected={connected}
            onToggle={onToggleLight}
            color="#f59e0b"
            icon="*"
        />
    </Card>
);
