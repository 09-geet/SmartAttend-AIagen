import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BiometricScanner } from './components/BiometricScanner';
import { DashboardView } from './components/DashboardView';
import { StudentDirectory } from './components/StudentDirectory';
import { AttendanceLog } from './components/AttendanceLog';
import { SessionManager } from './components/SessionManager';
import { AiInsightsModal } from './components/AiInsightsModal';

import { Student, AttendanceRecord, ClassSession, AttendanceStatus } from './types';
import { INITIAL_STUDENTS, INITIAL_SESSIONS, INITIAL_RECORDS } from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('kiosk');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Persistent State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smartattend_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [sessions, setSessions] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('smartattend_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('smartattend_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [activeSession, setActiveSession] = useState<ClassSession | null>(() => {
    return sessions.find(s => s.status === 'active') || sessions[0] || null;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('smartattend_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('smartattend_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('smartattend_records', JSON.stringify(records));
  }, [records]);

  // Record Attendance Logic
  const handleRecordAttendance = (
    student: Student,
    confidence: number,
    livenessPassed: boolean,
    notes?: string
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    // Determine status (if past 9:15 AM, mark late; else present)
    const isLate = now.getMinutes() > 15;
    const status: AttendanceStatus = isLate ? 'late' : 'present';

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.name,
      department: student.department,
      courseId: activeSession?.id || 'sess-1',
      courseName: activeSession?.courseName || 'Deep Learning & Neural Networks',
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
      status,
      method: 'facial_ai',
      confidenceScore: Math.round(confidence * 10) / 10,
      livenessPassed,
      photoSnapshot: student.avatarUrl,
      notes: notes || 'Optical biometric scan verified with 3D liveness test.',
    };

    setRecords(prev => [newRecord, ...prev]);

    // Update Student's stats
    setStudents(prev =>
      prev.map(s => {
        if (s.id === student.id || s.studentId === student.studentId) {
          return {
            ...s,
            attendedClasses: s.attendedClasses + 1,
            lastSeen: `Today at ${timeStr}`,
          };
        }
        return s;
      })
    );

    // Update Session counters
    if (activeSession) {
      setSessions(prev =>
        prev.map(sess => {
          if (sess.id === activeSession.id) {
            return {
              ...sess,
              presentCount: status === 'present' ? sess.presentCount + 1 : sess.presentCount,
              lateCount: status === 'late' ? sess.lateCount + 1 : sess.lateCount,
              absentCount: Math.max(0, sess.absentCount - 1),
            };
          }
          return sess;
        })
      );
    }
  };

  // Update Record Status Override
  const handleUpdateRecordStatus = (recordId: string, newStatus: AttendanceStatus) => {
    setRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, status: newStatus } : r))
    );
  };

  // Add Enrolled Student
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  // Update Student
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  // Create Session
  const handleCreateSession = (newSession: ClassSession) => {
    setSessions(prev => [newSession, ...prev]);
    setActiveSession(newSession);
  };

  // End Session
  const handleEndSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, status: 'completed' } : s))
    );
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSession={activeSession}
        onOpenAiInsights={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'kiosk' && (
          <BiometricScanner
            students={students}
            records={records}
            activeSession={activeSession}
            onRecordAttendance={handleRecordAttendance}
            onNavigateEnrollment={() => setActiveTab('students')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            records={records}
            sessions={sessions}
            onOpenAiInsights={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'students' && (
          <StudentDirectory
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
          />
        )}

        {activeTab === 'logs' && (
          <AttendanceLog
            records={records}
            sessions={sessions}
            onUpdateRecordStatus={handleUpdateRecordStatus}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionManager
            sessions={sessions}
            activeSession={activeSession}
            onSelectActiveSession={setActiveSession}
            onCreateSession={handleCreateSession}
            onEndSession={handleEndSession}
          />
        )}
      </main>

      {/* AI Insights Modal */}
      <AiInsightsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        students={students}
        records={records}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        SmartAttend-AI • Biometric Facial Recognition Attendance Terminal • Campus Vision Systems
      </footer>

    </div>
  );
}
export default App;
