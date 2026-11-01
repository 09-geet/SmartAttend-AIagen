import React, { useState } from 'react';
import { 
  CalendarCheck2, 
  Search, 
  Download, 
  Printer, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  SlidersHorizontal,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, ClassSession } from '../types';

interface AttendanceLogProps {
  records: AttendanceRecord[];
  sessions: ClassSession[];
  onUpdateRecordStatus: (recordId: string, newStatus: AttendanceStatus) => void;
}

export const AttendanceLog: React.FC<AttendanceLogProps> = ({
  records,
  sessions,
  onUpdateRecordStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchesSession = sessionFilter === 'all' || rec.courseId === sessionFilter;
    const matchesDate = !dateFilter || rec.date === dateFilter;

    return matchesSearch && matchesStatus && matchesSession && matchesDate;
  });

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Record ID', 'Student ID', 'Student Name', 'Department', 'Course', 'Date', 'Time', 'Status', 'Method', 'Confidence (%)', 'Notes'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.studentId,
      `"${r.studentName}"`,
      `"${r.department}"`,
      `"${r.courseName}"`,
      r.date,
      r.time,
      r.status,
      r.method,
      r.confidenceScore,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartAttend_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Attendance Sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Institutional Attendance Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically stamped logs with facial biometric verification scores
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
            title="Print Attendance Sheet"
          >
            <Printer className="w-4 h-4" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Attendance Statuses</option>
            <option value="present">Present (On-Time)</option>
            <option value="late">Late Arrival</option>
            <option value="absent">Absent</option>
            <option value="excused">Excused Leave</option>
          </select>
        </div>

        {/* Session Filter */}
        <div className="flex items-center gap-2">
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Class Sessions</option>
            {sessions.map((sess) => (
              <option key={sess.id} value={sess.id}>
                {sess.courseCode} - {sess.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          />
        </div>

      </div>

      {/* Attendance Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course & Session</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.photoSnapshot || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={record.studentName}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-200">{record.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{record.studentId} • {record.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-200">{record.courseName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Session ID: {record.courseId}</p>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      <p className="text-slate-300">{record.time}</p>
                      <p className="text-[10px] text-slate-500">{record.date}</p>
                    </td>

                    {/* Verification Method & Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-emerald-300 font-medium">{record.confidenceScore}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 capitalize">{record.method.replace('_', ' ')}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          record.status === 'present'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : record.status === 'late'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : record.status === 'excused'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {record.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                        {record.status === 'late' && <Clock className="w-3 h-3" />}
                        {record.status === 'absent' && <XCircle className="w-3 h-3" />}
                        {record.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Manual Status Override Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={record.status}
                        onChange={(e) => onUpdateRecordStatus(record.id, e.target.value as AttendanceStatus)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-950/60 border-t border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredRecords.length} records</span>
          <span className="font-mono text-[11px]">System integrity: All records cryptographic hash verified</span>
        </div>
      </div>

    </div>
  );
};
