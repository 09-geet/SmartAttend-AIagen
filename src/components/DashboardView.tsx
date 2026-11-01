import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  UserX, 
  Clock, 
  AlertTriangle, 
  Award, 
  Building2, 
  CheckCircle2, 
  Send, 
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Student, AttendanceRecord, ClassSession } from '../types';

interface DashboardViewProps {
  students: Student[];
  records: AttendanceRecord[];
  sessions: ClassSession[];
  onOpenAiInsights: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  records,
  sessions,
  onOpenAiInsights,
}) => {
  const [warningSentStudentId, setWarningSentStudentId] = useState<string | null>(null);

  // Compute metrics
  const totalStudents = students.length;
  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const totalCheckedIn = presentCount + lateCount;
  const attendanceRate = totalStudents > 0 ? ((totalCheckedIn / totalStudents) * 100).toFixed(1) : '0';

  // Identify Defaulter Students (< 75% attendance rate)
  const defaulterStudents = students.filter(s => {
    const rate = (s.attendedClasses / s.totalClasses) * 100;
    return rate < 75;
  });

  // Top Attendees (> 95%)
  const topAttendees = students.filter(s => {
    const rate = (s.attendedClasses / s.totalClasses) * 100;
    return rate >= 95;
  });

  const handleSendWarning = (studentId: string) => {
    setWarningSentStudentId(studentId);
    setTimeout(() => {
      setWarningSentStudentId(null);
    }, 2500);
  };

  // Weekly data
  const weeklyTrends = [
    { day: 'Mon', rate: 94, present: 9, absent: 1 },
    { day: 'Tue', rate: 90, present: 9, absent: 1 },
    { day: 'Wed', rate: 86, present: 8, absent: 2 },
    { day: 'Thu', rate: 92, present: 9, absent: 1 },
    { day: 'Fri', rate: Number(attendanceRate) || 88, present: totalCheckedIn, absent: totalStudents - totalCheckedIn },
  ];

  // Department rates
  const deptStats = [
    { name: 'Computer Science & AI', count: 4, avgRate: 92 },
    { name: 'Data Science & Analytics', count: 2, avgRate: 94 },
    { name: 'Robotics & Automation', count: 2, avgRate: 86 },
    { name: 'Cybersecurity', count: 2, avgRate: 78 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Smart Summary */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider">
                Institutional Intelligence
              </span>
              <span className="text-xs text-slate-400">Term II • 2026 Academic Session</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Attendance Analytics & Executive Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time facial telemetry indicates strong campus punctuality today, with <span className="text-emerald-400 font-semibold">{attendanceRate}%</span> verified classroom attendance across active faculty sessions.
            </p>
          </div>

          <button
            onClick={onOpenAiInsights}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            AI Trend Forecaster
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Today's Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{attendanceRate}%</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">+2.4% vs last wk</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        {/* KPI 2: Present */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Present (On-Time)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{presentCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ {totalStudents} enrolled</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-mono">
            {totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(0) : 0}% on-time rate
          </p>
        </div>

        {/* KPI 3: Late */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tardy / Late</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{lateCount}</span>
            <span className="text-xs text-amber-400 font-mono">Grace period &gt;15m</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-mono">
            Logged with automated late flag
          </p>
        </div>

        {/* KPI 4: Defaulters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">At-Risk Students</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">{defaulterStudents.length}</span>
            <span className="text-xs text-slate-400 font-mono">Below 75% bar</span>
          </div>
          <p className="mt-2 text-[11px] text-rose-400/80 font-mono">
            Requires academic intervention
          </p>
        </div>

      </div>

      {/* Visual Analytics Grid: Weekly Chart & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Attendance Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-white">Weekly Attendance Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Aggregated percentage of student turnout per day</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Avg: 90%
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between h-44 gap-3 sm:gap-6 px-2">
              {weeklyTrends.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-slate-400 group-hover:text-indigo-300 transition-colors">
                    {item.rate}%
                  </span>
                  <div className="w-full max-w-[48px] bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-xl transition-all duration-500 group-hover:brightness-110 shadow-lg shadow-indigo-600/20"
                      style={{ height: `${item.rate}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 font-mono">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span>Verified Attendance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-700" />
              <span>Unverified / Absent</span>
            </div>
          </div>
        </div>

        {/* Department Attendance Ranks (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-white">Department Benchmarking</h3>
              <p className="text-xs text-slate-400 mt-0.5">Attendance compliance by academic wing</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-4 flex-1">
            {deptStats.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium truncate max-w-[200px]">{dept.name}</span>
                  <span className="font-mono text-slate-300 font-semibold">{dept.avgRate}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dept.avgRate >= 90
                        ? 'bg-emerald-500'
                        : dept.avgRate >= 80
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${dept.avgRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">High Punctuality Cohort:</span>
            <span className="font-semibold text-emerald-400">Data Science (94%)</span>
          </div>
        </div>

      </div>

      {/* Defaulter / At-Risk Attendance Alert Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">At-Risk Defaulter Watchlist (&lt;75% Attendance)</h3>
              <p className="text-xs text-slate-400">Students ineligible for semester exams unless remediation is recorded</p>
            </div>
          </div>
          <span className="text-xs text-rose-400 font-mono font-semibold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
            {defaulterStudents.length} Students Flagged
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-800/80">
          {defaulterStudents.map((student) => {
            const rate = ((student.attendedClasses / student.totalClasses) * 100).toFixed(1);
            const isSent = warningSentStudentId === student.id;

            return (
              <div key={student.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">{student.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {student.studentId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{student.department} • {student.batch}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {rate}% Attendance
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Attended {student.attendedClasses}/{student.totalClasses} classes
                    </p>
                  </div>

                  <button
                    onClick={() => handleSendWarning(student.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSent
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Warning Dispatched
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Notice
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
