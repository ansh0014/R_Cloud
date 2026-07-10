import { useMockDataStream, mockDataStore } from '../../hooks/useMockDataStream';
import {
  Sliders,
  Radio,
  Zap,
  Flame,
  RotateCcw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function SystemControls() {
  const { adminControls, wsConnected } = useMockDataStream();

  const handleToggleSpike = () => {
    mockDataStore.updateAdminControls({ isSpikeActive: !adminControls.isSpikeActive });
  };

  const handleToggleFailure = () => {
    mockDataStore.updateAdminControls({ isFailureActive: !adminControls.isFailureActive });
  };

  const handleToggleRestartLoop = () => {
    mockDataStore.updateAdminControls({ isRestartLoopActive: !adminControls.isRestartLoopActive });
  };

  const handleToggleWS = () => {
    mockDataStore.toggleWS();
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sliders className="size-6 text-[#7b39fc]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-manrope">Simulation Control Panel</h1>
          <p className="text-sm text-slate-400 mt-1">
            Trigger simulated platform events to test how the User Dashboard UI widgets and telemetry stream updates react.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white font-manrope">Event Injectors</h2>
          
          <div className="space-y-4">
            {/* Toggle 1: Traffic Spike */}
            <div className="flex items-start justify-between gap-4 p-3.5 bg-[#131126]/60 border border-[#2b2344]/40 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className={`size-4 ${adminControls.isSpikeActive ? 'text-amber-400 fill-current' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-white">Simulate Request Load Spike</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Spikes traffic volume by 5x, increases latency times, and elevates host cluster CPU utilization values.
                </p>
              </div>

              {/* Custom Switch Toggle */}
              <button
                onClick={handleToggleSpike}
                className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  adminControls.isSpikeActive ? 'bg-primary' : 'bg-[#2b2344]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    adminControls.isSpikeActive ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Railway Container Outage */}
            <div className="flex items-start justify-between gap-4 p-3.5 bg-[#131126]/60 border border-[#2b2344]/40 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className={`size-4 ${adminControls.isFailureActive ? 'text-rose-500 fill-current animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-white">Trigger Container Outage</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Forces `Customer-Support-Bot` to fail state instantly and relays fatal exception logs to its logs stream.
                </p>
              </div>

              <button
                onClick={handleToggleFailure}
                className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  adminControls.isFailureActive ? 'bg-rose-500' : 'bg-[#2b2344]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    adminControls.isFailureActive ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Auto-Restart CrashLoop */}
            <div className="flex items-start justify-between gap-4 p-3.5 bg-[#131126]/60 border border-[#2b2344]/40 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RotateCcw className={`size-4 ${adminControls.isRestartLoopActive ? 'text-blue-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '3s' }} />
                  <span className="text-xs font-semibold text-white">Simulate CrashLoopBackOff</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Forces `DevOps-Code-Reviewer` to transition to `Restarting` status and increments restart counts.
                </p>
              </div>

              <button
                onClick={handleToggleRestartLoop}
                className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  adminControls.isRestartLoopActive ? 'bg-blue-500' : 'bg-[#2b2344]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    adminControls.isRestartLoopActive ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: WebSocket Stream State */}
            <div className="flex items-start justify-between gap-4 p-3.5 bg-[#131126]/60 border border-[#2b2344]/40 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Radio className={`size-4 ${wsConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-white">WebSocket Stream Connectivity</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Toggles global updates stream connection. Disabling it pauses metrics generation and log stream.
                </p>
              </div>

              <button
                onClick={handleToggleWS}
                className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  wsConnected ? 'bg-emerald-500' : 'bg-[#2b2344]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    wsConnected ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Instructions/Documentation Panel */}
        <div className="bg-[#0d0b17] border border-[#2b2344]/40 rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white font-manrope">How to test this simulation</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              These switches interact directly with the client-side state machine memory. When you activate an event here:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Open the user avatar menu in top-right topbar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Click <strong>"Switch to User view"</strong> under the Reviewer Preview block.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Go to the <strong>Overview</strong>, <strong>Agent Metrics</strong>, or <strong>Runtime Logs</strong>. You will observe how status badges, logs stream, and graphs dynamically update in real-time based on the settings you configured here!</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#131126]/60 border border-[#2b2344]/40 rounded-xl p-4 mt-6 text-xs text-slate-400 leading-normal flex items-start gap-2">
            <HelpCircle className="size-4 text-[#7b39fc] shrink-0 mt-0.5" />
            <span>
              This feature allows validation of error UI fallbacks, colors mapping, and state stepping transitions without waiting for random infrastructure outages.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
