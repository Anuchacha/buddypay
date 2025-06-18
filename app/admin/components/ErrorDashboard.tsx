'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import errorMonitoring, { ErrorReport } from '../../lib/errorMonitoring';

interface ErrorStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
  unresolved: number;
}

export default function ErrorDashboard() {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0,
    unresolved: 0,
  });
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'unresolved'>('all');

  useEffect(() => {
    loadErrorData();
    
    // อัปเดตข้อมูลทุก 30 วินาที
    const interval = setInterval(loadErrorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadErrorData = () => {
    const errorData = errorMonitoring.getErrors();
    const errorStats = errorMonitoring.getErrorStats();
    
    setErrors(errorData);
    setStats(errorStats);
  };

  const filteredErrors = errors.filter(error => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !error.resolved;
    return error.level === filter;
  });

  const handleResolveError = (fingerprint: string) => {
    const success = errorMonitoring.resolveError(fingerprint);
    if (success) {
      loadErrorData(); // รีโหลดข้อมูล
    }
  };

  const handleExportErrors = () => {
    const jsonData = errorMonitoring.exportErrors();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-reports-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearErrors = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบ error reports ทั้งหมด?')) {
      errorMonitoring.clearErrors();
      loadErrorData();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700';
      case 'high': return 'text-orange-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Error Monitoring Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={loadErrorData} variant="outline">
            🔄 รีเฟรช
          </Button>
          <Button onClick={handleExportErrors} variant="outline">
            📥 Export
          </Button>
          <Button onClick={handleClearErrors} variant="danger">
            🗑️ ลบทั้งหมด
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Errors</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-sm text-gray-600">High</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
          <div className="text-sm text-gray-600">Medium</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.low}</div>
          <div className="text-sm text-gray-600">Low</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.unresolved}</div>
          <div className="text-sm text-gray-600">Unresolved</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'critical', 'high', 'medium', 'low', 'unresolved'].map((filterType) => (
          <Button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            variant={filter === filterType ? 'primary' : 'outline'}
            className="capitalize"
          >
            {filterType === 'all' ? 'ทั้งหมด' : 
             filterType === 'unresolved' ? 'ยังไม่แก้ไข' : 
             filterType}
          </Button>
        ))}
      </div>

      {/* Error List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error List Panel */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Error Reports ({filteredErrors.length})
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredErrors.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                ไม่พบ error reports
              </div>
            ) : (
              filteredErrors.map((error) => (
                <div
                  key={error.fingerprint}
                  onClick={() => setSelectedError(error)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedError?.fingerprint === error.fingerprint 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getLevelColor(error.level)}`}></span>
                      <span className={`text-sm font-medium ${getLevelTextColor(error.level)}`}>
                        {error.level.toUpperCase()}
                      </span>
                      {error.count > 1 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {error.count}x
                        </span>
                      )}
                    </div>
                    {error.resolved && (
                      <span className="text-green-600 text-sm">✓ แก้ไขแล้ว</span>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {error.message.substring(0, 80)}{error.message.length > 80 ? '...' : ''}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {error.context.component} • {new Date(error.lastSeen).toLocaleString('th-TH')}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Error Detail Panel */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Error Details</h2>
          
          {selectedError ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${getLevelColor(selectedError.level)}`}></span>
                  <span className={`font-medium ${getLevelTextColor(selectedError.level)}`}>
                    {selectedError.level.toUpperCase()}
                  </span>
                </div>
                {!selectedError.resolved && (
                  <Button
                    onClick={() => handleResolveError(selectedError.fingerprint)}
                    variant="success"
                    className="text-sm"
                  >
                    ✓ แก้ไขแล้ว
                  </Button>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Message</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {selectedError.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Count:</span> {selectedError.count}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedError.type}
                </div>
                <div>
                  <span className="font-medium">First Seen:</span><br />
                  {new Date(selectedError.firstSeen).toLocaleString('th-TH')}
                </div>
                <div>
                  <span className="font-medium">Last Seen:</span><br />
                  {new Date(selectedError.lastSeen).toLocaleString('th-TH')}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Context</h3>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Component:</span> {selectedError.context.component}</div>
                  <div><span className="font-medium">Action:</span> {selectedError.context.action}</div>
                  <div><span className="font-medium">Page:</span> {selectedError.context.page}</div>
                  <div><span className="font-medium">User ID:</span> {selectedError.context.userId || 'Anonymous'}</div>
                  <div><span className="font-medium">Session:</span> {selectedError.context.sessionId}</div>
                  <div><span className="font-medium">Build:</span> {selectedError.context.buildVersion}</div>
                </div>
              </div>

              {selectedError.stack && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Stack Trace</h3>
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                    {selectedError.stack}
                  </pre>
                </div>
              )}

              <div className="text-xs text-gray-500 border-t pt-2">
                <div>Error ID: {selectedError.id}</div>
                <div>Fingerprint: {selectedError.fingerprint}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              เลือก error เพื่อดูรายละเอียด
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 