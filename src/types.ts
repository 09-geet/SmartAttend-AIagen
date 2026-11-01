export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export type CheckInMethod = 'facial_ai' | 'manual_override' | 'rfid_badge' | 'geofence';

export interface Student {
  id: string;
  studentId: string; // e.g. "CS-2024-042"
  name: string;
  email: string;
  department: string;
  batch: string; // e.g. "Batch 2024 - Semester 6"
  avatarUrl: string;
  faceRegistered: boolean;
  faceFeatures?: number[]; // Biometric embeddings vector
  status: 'active' | 'on_leave' | 'suspended';
  totalClasses: number;
  attendedClasses: number;
  lastSeen?: string;
  phone?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  courseId: string;
  courseName: string;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: AttendanceStatus;
  method: CheckInMethod;
  confidenceScore: number; // 0 - 100
  livenessPassed: boolean;
  notes?: string;
  photoSnapshot?: string;
}

export interface ClassSession {
  id: string;
  courseName: string;
  courseCode: string;
  facultyName: string;
  room: string;
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  date: string;
  department: string;
  status: 'active' | 'completed' | 'upcoming';
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

export interface BiometricDetection {
  faceDetected: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
  matchedStudent: Student | null;
  confidence: number;
  livenessScore: number;
  isLivenessValid: boolean;
  antiSpoofStatus: 'passed' | 'failed' | 'analyzing' | 'none';
  landmarks?: { x: number; y: number }[];
}
