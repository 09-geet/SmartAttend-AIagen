import React, { useState, useRef } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Camera, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Phone, 
  Mail, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle,
  Scan
} from 'lucide-react';
import { Student } from '../types';
import { DEPARTMENTS } from '../data/mockData';
import { soundFX } from '../utils/audio';

interface StudentDirectoryProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (student: Student) => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);

  // New Student Form State
  const [formName, setFormName] = useState<string>('');
  const [formId, setFormId] = useState<string>(`CS-2024-${String(students.length + 1).padStart(3, '0')}`);
  const [formEmail, setFormEmail] = useState<string>('');
  const [formDept, setFormDept] = useState<string>('Computer Science & AI');
  const [formBatch, setFormBatch] = useState<string>('Batch 2024 - Sem 6');
  const [formPhone, setFormPhone] = useState<string>('+1 (555) 000-1122');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All Departments' || student.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Start enrollment camera
  const startEnrollCamera = async () => {
    setIsCapturing(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch {
      // Fallback
    }
  };

  const stopEnrollCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const snapPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        soundFX.playSuccess();
      }
    } else {
      // Use demo photo
      setCapturedPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
      soundFX.playSuccess();
    }
    stopEnrollCamera();
  };

  const handleSubmitEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      studentId: formId.trim() || `CS-2024-${String(students.length + 1).padStart(3, '0')}`,
      name: formName.trim(),
      email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@smartattend.edu`,
      department: formDept,
      batch: formBatch,
      avatarUrl:
        capturedPhoto ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      faceRegistered: true,
      faceFeatures: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
      status: 'active',
      totalClasses: 48,
      attendedClasses: 47,
      lastSeen: 'Just Enrolled',
      phone: formPhone,
    };

    onAddStudent(newStudent);
    soundFX.playSuccess();
    setShowEnrollModal(false);

    // Reset Form
    setFormName('');
    setCapturedPhoto(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Search and Enroll Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Student Directory & Biometric Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage student records and enroll facial biometric vectors for AI matching
          </p>
        </div>

        <button
          onClick={() => {
            setShowEnrollModal(true);
            setFormId(`CS-2024-${String(students.length + 1).padStart(3, '0')}`);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or institutional email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-500 ml-1" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const attendancePercent = ((student.attendedClasses / student.totalClasses) * 100).toFixed(0);
          const isDefaulter = Number(attendancePercent) < 75;

          return (
            <div
              key={student.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-indigo-500/60 transition-colors"
                    />
                    {student.faceRegistered ? (
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow"
                        title="Biometric Face Enrolled"
                      >
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </span>
                    ) : (
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow"
                        title="Biometric Pending Enrollment"
                      >
                        <AlertCircle className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                        isDefaulter
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {attendancePercent}% Turnout
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {student.attendedClasses} of {student.totalClasses} classes
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-xs font-mono text-indigo-400 mt-0.5">{student.studentId}</p>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{student.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{student.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>{student.faceRegistered ? 'Biometrics Active' : 'Enrollment Needed'}</span>
                <span>{student.lastSeen || 'Active'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Enroll New Student / Face */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Scan className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Enroll Student Biometric Profile</h3>
                  <p className="text-xs text-slate-400">Capture optical face embeddings & register student</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopEnrollCamera();
                  setShowEnrollModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEnroll} className="p-5 space-y-4">
              
              {/* Photo Capture & Preview Section */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
                {isCapturing ? (
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    <button
                      type="button"
                      onClick={snapPhoto}
                      className="absolute bottom-3 inset-x-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer text-center"
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-700 mb-3 bg-slate-900 flex items-center justify-center">
                      {capturedPhoto ? (
                        <img src={capturedPhoto} alt="Captured face" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={startEnrollCamera}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer shadow-sm transition-all"
                      >
                        {capturedPhoto ? 'Retake Photo' : 'Open Camera to Capture Face'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
                          soundFX.playSuccess();
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-all"
                      >
                        Use Sample Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Student ID / Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Academic Department
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {DEPARTMENTS.filter(d => d !== 'All Departments').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Batch / Semester
                  </label>
                  <input
                    type="text"
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="name@smartattend.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopEnrollCamera();
                    setShowEnrollModal(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Enroll Face
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
