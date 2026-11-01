import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  Users, 
  Radio
} from 'lucide-react';
import { ClassSession } from '../types';
import { soundFX } from '../utils/audio';

interface SessionManagerProps {
  sessions: ClassSession[];
  activeSession: ClassSession | null;
  onSelectActiveSession: (session: ClassSession) => void;
  onCreateSession: (newSession: ClassSession) => void;
  onEndSession: (sessionId: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  activeSession,
  onSelectActiveSession,
  onCreateSession,
  onEndSession,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('CS-');
  const [facultyName, setFacultyName] = useState<string>('Prof. ');
  const [room, setRoom] = useState<string>('Lab 101');
  const [startTime, setStartTime] = useState<string>('10:00 AM');
  const [endTime, setEndTime] = useState<string>('11:30 AM');
  const [department, setDepartment] = useState<string>('Computer Science & AI');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    const newSess: ClassSession = {
      id: `sess-${Date.now()}`,
      courseName,
      courseCode,
      facultyName,
      room,
      startTime,
      endTime,
      date: new Date().toISOString().split('T')[0],
      department,
      status: 'active',
      totalStudents: 10,
      presentCount: 0,
      lateCount: 0,
      absentCount: 10,
    };

    onCreateSession(newSess);
    soundFX.playSuccess();
    setShowModal(false);
    setCourseName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Classroom & Lecture Session Manager
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Initialize and supervise active class sessions linked to biometric optical terminals
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Start New Class Session
        </button>
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => {
          const isCurrentlyActive = activeSession?.id === session.id;

          return (
            <div
              key={session.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isCurrentlyActive
                  ? 'border-indigo-500 shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {session.courseCode}
                      </span>
                      {isCurrentlyActive ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Terminal Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                          {session.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{session.courseName}</h3>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{session.facultyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{session.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{session.startTime} - {session.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{session.totalStudents} Registered</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Turnout Progress</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {session.presentCount + session.lateCount} / {session.totalStudents} Present
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(session.presentCount / session.totalStudents) * 100}%` }}
                      title="Present on time"
                    />
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(session.lateCount / session.totalStudents) * 100}%` }}
                      title="Late arrival"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                {isCurrentlyActive ? (
                  <>
                    <span className="text-xs text-indigo-300 font-medium flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Live Feed Optical Target
                    </span>
                    <button
                      onClick={() => onEndSession(session.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Square className="w-3.5 h-3.5" />
                      End Session
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onSelectActiveSession(session);
                      soundFX.playSuccess();
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    Activate on Camera Terminal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Session */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Schedule New Lecture Session</h3>
            <p className="text-xs text-slate-400 mb-4">Set course and classroom coordinates for attendance tracking</p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Natural Language Processing"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Lecturer / Faculty
                </label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
