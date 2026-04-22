import { useHomeAssistant } from "./hooks/useHomeAssistant";
import { StatusHeader } from "./components/StatusHeader";
import { WaterTank } from "./components/WaterTank";
import { HumidityPanel } from "./components/HumidityPanel";
import { WindowControl } from "./components/WindowControl";
import { DeviceControls } from "./components/DeviceControls";
import { HistoryCharts } from "./components/HistoryCharts";

export default function App() {
    const { state, toggleWindow, togglePump, toggleLight, getSlice } =
        useHomeAssistant();

    return (
        <div className="min-h-screen flex flex-col bg-bg">
            <StatusHeader
                connected={state.connected}
                connecting={state.connecting}
                lastUpdate={state.lastUpdate}
            />

            <main className="flex-1 p-5 flex flex-col gap-5">
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    <WaterTank waterPresent={state.waterPresent} delay={0} />

                    <HumidityPanel humidity={state.humidity} delay={0.08} />

                    <WindowControl
                        isOpen={state.windowOpen}
                        connected={state.connected}
                        onToggle={toggleWindow}
                        delay={0.08}
                    />

                    <DeviceControls
                        pumpOn={state.pumpOn}
                        lightOn={state.lightOn}
                        waterPresent={state.waterPresent}
                        connected={state.connected}
                        onTogglePump={togglePump}
                        onToggleLight={toggleLight}
                        delay={0.16}
                    />
                </div>

                <HistoryCharts getSlice={getSlice} delay={0.24} />
            </main>
        </div>
    );
}
