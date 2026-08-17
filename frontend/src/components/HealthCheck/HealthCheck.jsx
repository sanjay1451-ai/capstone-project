import React from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Terminal, Clock, ShieldCheck, Database } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';
import './HealthCheck.css';

export default function HealthCheck({
  status,
  data,
  latency,
  error,
  lastChecked,
  onRefresh
}) {
  const isOnline = status === 'ONLINE';
  const isChecking = status === 'CHECKING';

  return (
    <section id="health-check" className="healthcheck-section">
      <div className="container">
        
        <div className="section-header">
          <div className="badge badge-cyan">
            <Server size={14} />
            <span>REST API Integration</span>
          </div>
          <h2 className="section-title">
            Phase 1 <span className="gradient-text">Backend Health Check</span>
          </h2>
          <p className="section-subtitle">
            Live communication verification between Vite React (Frontend) and Spring Boot (Backend) over CORS.
          </p>
        </div>

        <div className="health-card glass-card">
          {/* Card Top Bar */}
          <div className="health-card-header">
            <div className="endpoint-info">
              <span className="http-method">GET</span>
              <code className="endpoint-path">{API_BASE_URL}/api/health</code>
            </div>

            <button 
              className={`btn btn-secondary ping-btn ${isChecking ? 'loading' : ''}`}
              onClick={onRefresh}
              disabled={isChecking}
              id="ping-health-btn"
            >
              <RefreshCw size={16} className={isChecking ? 'spin' : ''} />
              <span>{isChecking ? 'Checking...' : 'Ping Endpoint'}</span>
            </button>
          </div>

          {/* Status Banner */}
          <div className={`health-status-banner banner-${status.toLowerCase()}`}>
            <div className="banner-left">
              {isOnline ? (
                <CheckCircle2 size={24} className="icon-success" />
              ) : isChecking ? (
                <RefreshCw size={24} className="icon-warning spin" />
              ) : (
                <XCircle size={24} className="icon-error" />
              )}
              
              <div className="banner-text">
                <h3>
                  {isOnline && 'Backend is Running & Connected'}
                  {isChecking && 'Pinging Spring Boot Backend...'}
                  {!isOnline && !isChecking && 'Backend Service Offline or Unreachable'}
                </h3>
                <p>
                  {isOnline && 'Full-stack handshake successful over CORS.'}
                  {isChecking && 'Establishing connection to localhost:8080...'}
                  {!isOnline && !isChecking && (error || 'Ensure your Spring Boot application is running on port 8080.')}
                </p>
              </div>
            </div>

            {/* Latency & Timestamp Metrics */}
            <div className="metrics-cluster">
              {latency !== null && (
                <div className="metric-pill">
                  <Clock size={14} />
                  <span>Latency: <strong>{latency}ms</strong></span>
                </div>
              )}
              {lastChecked && (
                <div className="metric-pill">
                  <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Response Payload Viewer */}
          <div className="payload-viewer">
            <div className="payload-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="payload-title">REST JSON Response</span>
              <span className="http-code">{isOnline ? '200 OK' : isChecking ? 'PENDING' : 'FAILED'}</span>
            </div>

            <pre className="payload-code">
              {isOnline && data && JSON.stringify(data, null, 2)}
              {isChecking && '// Sending HTTP GET request to /api/health...'}
              {!isOnline && !isChecking && (
                `// Connection Error:\n` +
                `{\n` +
                `  "status": "Offline",\n` +
                `  "error": "${error || 'Connection refused at ' + API_BASE_URL}",\n` +
                `  "hint": "Run 'mvn spring-boot:run' inside the /backend directory."\n` +
                `}`
              )}
            </pre>
          </div>

          {/* Architecture Status Footer */}
          <div className="architecture-grid">
            <div className="arch-item">
              <div className="arch-dot active"></div>
              <span>Frontend: <strong>Vite React (Port 5173)</strong></span>
            </div>
            <div className="arch-item">
              <div className={`arch-dot ${isOnline ? 'active' : 'inactive'}`}></div>
              <span>Backend: <strong>Spring Boot (Port 8080)</strong></span>
            </div>
            <div className="arch-item">
              <div className="arch-dot configured"></div>
              <span>Database: <strong>Supabase PostgreSQL (Configured)</strong></span>
            </div>
            <div className="arch-item">
              <div className="arch-dot configured"></div>
              <span>Security: <strong>JWT + CORS Filter (Configured)</strong></span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
