import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Layers, 
  UserPlus, 
  Eye, 
  Search,
  Check,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, AttendanceRecord, ClassSession, BiometricDetection } from '../types';
import { soundFX } from '../utils/audio';
import { drawBiometricHUD, generateLandmarks } from '../utils/faceRecognition';

interface BiometricScannerProps {
  students: Student[];
  records: AttendanceRecord[];
  activeSession: ClassSession | null;
  onRecordAttendance: (student: Student, confidence: number, livenessPassed: boolean, notes?: string) => void;
  onNavigateEnrollment: () => void;
}

export const BiometricScanner: React.FC<BiometricScannerProps> = ({
  students,
  records,
  activeSession,
  onRecordAttendance,
  onNavigateEnrollment,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [antiSpoofEnabled, setAntiSpoofEnabled] = useState<boolean>(true);
  const [detection, setDetection] = useState<BiometricDetection | null>(null);
  const [lastMarkedStudent, setLastMarkedStudent] = useState<Student | null>(null);
  const [scanCooldown, setScanCooldown] = useState<boolean>(false);
  const [manualSearch, setManualSearch] = useState<string>('');
  const [streamObj, setStreamObj] = useState<MediaStream | null>(null);

  // Start real webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setStreamObj(stream);
        setCameraActive(true);
        setSimulationMode(false);
      } else {
        throw new Error('Webcam not supported in this browser environment');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
      setCameraError(errorMsg);
      // Auto-fallback to simulation preview
      setSimulationMode(true);
      setCameraActive(true);
    }
  };

  // Stop real webcam
  const stopCamera = useCallback(() => {
    if (streamObj) {
      streamObj.getTracks().forEach((track) => track.stop());
      setStreamObj(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDetection(null);
  }, [streamObj]);

  useEffect(() => {
    // Attempt auto-start on mount
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Biometric HUD render loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      if (canvasRef.current) {
        drawBiometricHUD(canvasRef.current, detection, cameraActive);
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [detection, cameraActive]);

  // Execute attendance recording with celebration & audio feedback
  const handleConfirmAttendance = useCallback((
    student: Student,
    confidence: number,
    livenessPassed: boolean,
    notes?: string
  ) => {
    if (scanCooldown) return;

    // Check if already checked in today for this session
    const existing = records.find(
      (r) => r.studentId === student.studentId && r.courseId === (activeSession?.id || 'sess-1')
    );

    if (existing) {
      soundFX.playBlip();
      setLastMarkedStudent(student);
      return;
    }

    soundFX.playSuccess();
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#38bdf8']
      });
    } catch {
      // confetti fallback
    }

    onRecordAttendance(student, confidence, livenessPassed, notes);
    setLastMarkedStudent(student);
    setScanCooldown(true);

    setTimeout(() => {
      setScanCooldown(false);
    }, 3000);
  }, [scanCooldown, records, activeSession, onRecordAttendance]);

  // Simulate scanning a specific student or edge-case
  const triggerSimulation = (scenario: 'student' | 'unknown' | 'spoof', targetStudent?: Student) => {
    setCameraActive(true);
    soundFX.playBlip();

    const canvas = canvasRef.current;
    const w = canvas?.width || 640;
    const h = canvas?.height || 480;

    const boxW = w * 0.4;
    const boxH = h * 0.52;
    const boxX = (w - boxW) / 2;
    const boxY = (h - boxH) / 2.3;

    if (scenario === 'student' && targetStudent) {
      const confidence = 96.5 + Math.random() * 3.2;
      const det: BiometricDetection = {
        faceDetected: true,
        boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
        matchedStudent: targetStudent,
        confidence,
        livenessScore: 98.4,
        isLivenessValid: true,
        antiSpoofStatus: 'passed',
        landmarks: generateLandmarks(boxX, boxY, boxW, boxH),
      };
      setDetection(det);

      setTimeout(() => {
        handleConfirmAttendance(targetStudent, confidence, true, 'Real-time Facial Biometrics Verified');
      }, 700);
    } else if (scenario === 'unknown') {
      soundFX.playAlert();
      const det: BiometricDetection = {
        faceDetected: true,
        boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
        matchedStudent: null,
        confidence: 42.1,
        livenessScore: 94.0,
        isLivenessValid: true,
        antiSpoofStatus: 'none',
        landmarks: generateLandmarks(boxX, boxY, boxW, boxH),
      };
      setDetection(det);
    } else if (scenario === 'spoof') {
      soundFX.playAlert();
      const det: BiometricDetection = {
        faceDetected: true,
        boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
        matchedStudent: targetStudent || students[0],
        confidence: 88.0,
        livenessScore: 23.5, // Failed liveness!
        isLivenessValid: false,
        antiSpoofStatus: 'failed',
        landmarks: generateLandmarks(boxX, boxY, boxW, boxH),
      };
      setDetection(det);
    }
  };

  // Filter today's recent check-ins
  const recentRecords = [...records].reverse().slice(0, 6);

  // Filter students for manual check-in search
  const filteredStudents = manualSearch.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(manualSearch.toLowerCase()) ||
          s.studentId.toLowerCase().includes(manualSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      
      {/* Top Session Alert Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                ● Live Attendance Terminal
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-400 font-mono">Room: {activeSession?.room || 'Hall B-204'}</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {activeSession?.courseName || 'Deep Learning & Neural Networks'} 
              <span className="text-slate-400 text-sm font-normal ml-2">({activeSession?.courseCode || 'CS-401'})</span>
            </h2>
          </div>
        </div>

        {/* Quick Kiosk Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setAntiSpoofEnabled(!antiSpoofEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              antiSpoofEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Liveness & 3D Anti-Spoofing Detection"
          >
            {antiSpoofEnabled ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            )}
            Anti-Spoofing: {antiSpoofEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              cameraActive
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
            }`}
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                Stop Feed
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Start Camera
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Biometric Viewport & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Biometric Camera Viewport (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group">
            
            {/* Live Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                simulationMode || !cameraActive ? 'hidden' : 'block'
              }`}
            />

            {/* Virtual Simulation Stream (Fallback if real camera unavailable or testing) */}
            {simulationMode && cameraActive && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-indigo-500/40 flex items-center justify-center p-2 mb-4 animate-pulse">
                  {detection?.matchedStudent ? (
                    <img
                      src={detection.matchedStudent.avatarUrl}
                      alt="Student"
                      className="w-full h-full rounded-full object-cover shadow-lg border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                      <Eye className="w-10 h-10 text-indigo-400/70" />
                    </div>
                  )}
                </div>
                <h4 className="text-slate-200 font-semibold text-sm">
                  {detection?.matchedStudent ? detection.matchedStudent.name : 'AI Biometric Vision Sensor Active'}
                </h4>
                <p className="text-slate-400 text-xs mt-1 max-w-sm">
                  {detection?.matchedStudent
                    ? `Matching feature vector with ${detection.confidence.toFixed(1)}% confidence score`
                    : 'Awaiting student face in camera optical field. Click any quick-test button below to verify.'}
                </p>
              </div>
            )}

            {/* Stopped Camera Placeholder */}
            {!cameraActive && (
              <div className="flex flex-col items-center justify-center p-8 text-center z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                  <CameraOff className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white">Camera Offline</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Click 'Start Camera' to initialize the video optical sensor or run the simulator test mode.
                </p>
                <button
                  onClick={startCamera}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Turn On Optical Scanner
                </button>
              </div>
            )}

            {/* Biometric Canvas HUD (Landmarks, Bounding Box, Scanline) */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            />

            {/* Futuristic Scanning Line */}
            {cameraActive && (
              <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-radar pointer-events-none z-10 shadow-[0_0_12px_#38bdf8]" />
            )}

            {/* Camera Overlay HUD Elements */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                FPS: 60 | LATENCY: 14ms
              </span>
              {antiSpoofEnabled && (
                <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-indigo-300">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  3D MESH ACTIVE
                </span>
              )}
            </div>

            {/* Status Feedback Pill at Bottom */}
            {detection && (
              <div className="absolute bottom-4 inset-x-4 z-30 flex justify-center">
                <div
                  className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg flex items-center gap-3 transition-all ${
                    detection.antiSpoofStatus === 'failed'
                      ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                      : detection.matchedStudent
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                      : 'bg-amber-950/90 border-amber-500 text-amber-200'
                  }`}
                >
                  {detection.antiSpoofStatus === 'failed' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                  ) : detection.matchedStudent ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <div className="text-xs">
                    <p className="font-semibold leading-tight">
                      {detection.antiSpoofStatus === 'failed'
                        ? 'SECURITY ALERT: Potential 2D Photo Spoof Detected!'
                        : detection.matchedStudent
                        ? `Identified: ${detection.matchedStudent.name} (${detection.matchedStudent.studentId})`
                        : 'Unregistered Face Detected — No Matching Embedding'}
                    </p>
                    <p className="text-[11px] opacity-80 font-mono mt-0.5">
                      Confidence: {detection.confidence.toFixed(1)}% | Liveness Score: {detection.livenessScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Biometric Quick-Action Test Panel (For testing face matches instantly) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Biometric Simulation & Verification Testing
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Test recognition scenarios:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => triggerSimulation('student', students[0])}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-all text-left truncate cursor-pointer hover:border-indigo-500/50"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Scan: {students[0]?.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => triggerSimulation('student', students[1])}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-all text-left truncate cursor-pointer hover:border-indigo-500/50"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Scan: {students[1]?.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => triggerSimulation('unknown')}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-all text-left truncate cursor-pointer hover:border-amber-500/50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Test Unknown</span>
              </button>

              <button
                onClick={() => triggerSimulation('spoof', students[0])}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-all text-left truncate cursor-pointer"
                title="Test 2D Photo Screen Spoof Detection"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Test Spoof Attack</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Check-ins Ticker & Manual Override (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Recent Check-Ins Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-white">Live Attendance Stream</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">
                {records.length} Verified
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[380px] my-2 pr-1 space-y-2">
              {recentRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No attendance records logged yet today.
                </div>
              ) : (
                recentRecords.map((rec) => (
                  <div key={rec.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={rec.photoSnapshot || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={rec.studentName}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{rec.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{rec.studentId}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        rec.status === 'present'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : rec.status === 'late'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {rec.status.toUpperCase()}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{rec.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Enrollment Link */}
            <div className="pt-3 border-t border-slate-800 mt-auto">
              <button
                onClick={onNavigateEnrollment}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                Enroll New Face / Student
              </button>
            </div>
          </div>

          {/* Fast Manual Check-In Search Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Manual Fallback Check-In
            </h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name or Roll No..."
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            {filteredStudents.length > 0 && (
              <div className="mt-2 divide-y divide-slate-800 max-h-40 overflow-y-auto bg-slate-950/80 rounded-xl border border-slate-800 p-1">
                {filteredStudents.slice(0, 4).map((student) => {
                  const isChecked = records.some(
                    (r) => r.studentId === student.studentId && r.courseId === (activeSession?.id || 'sess-1')
                  );
                  return (
                    <div
                      key={student.id}
                      className="p-2 flex items-center justify-between gap-2 hover:bg-slate-900 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-slate-200 font-medium truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{student.studentId}</p>
                      </div>
                      <button
                        onClick={() => handleConfirmAttendance(student, 100, true, 'Manual Check-in Override')}
                        disabled={isChecked}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                          isChecked
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                        }`}
                      >
                        {isChecked ? 'Checked' : 'Mark'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
