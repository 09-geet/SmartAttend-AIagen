import React, { useState, useEffect } from 'react';
import { 
  ScanFace, 
  BarChart3, 
  Users, 
  CalendarCheck2, 
  GraduationCap, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { ClassSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSession: ClassSession | null;
  onOpenAiInsights: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeSession,
  onOpenAiInsights,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    soundFX.setSoundEnabled(nextState);
    if (nextState) soundFX.playBlip();
  };

  const navItems = [
    { id: 'kiosk', label: 'Live AI Scanner', icon: ScanFace },
    { id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students & Enrollment', icon: Users },
    { id: 'logs', label: 'Attendance Records', icon: CalendarCheck2 },
    { id: 'sessions', label: 'Class Sessions', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <ScanFace className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  SmartAttend<span className="text-indigo-400 font-extrabold">-AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  v2.4 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Facial Biometrics & Liveness Verification</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header Status Bar */}
          <div className="flex items-center gap-3">
            {/* Active Class Pill */}
            {activeSession && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-slate-400 font-mono">{activeSession.courseCode}:</span>
                <span className="text-slate-200 font-medium truncate max-w-[130px]">{activeSession.courseName}</span>
              </div>
            )}

            {/* AI Insights Button */}
            <button
              onClick={onOpenAiInsights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all cursor-pointer shadow-sm shadow-purple-500/10"
              title="Open AI Attendance Insights"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Insights</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-all text-xs ${
                audioEnabled
                  ? 'bg-slate-800/80 border-slate-700 text-indigo-400 hover:text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title={audioEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Live Clock */}
            <div className="hidden xl:flex flex-col text-right font-mono text-[11px] leading-tight text-slate-400 pl-2 border-l border-slate-800">
              <span className="text-slate-200 font-semibold">{currentTime}</span>
              <span className="text-slate-500 text-[10px]">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
