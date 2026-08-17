import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import './ReportModal.css';

export default function ReportModal({ product, onClose, onReportSuccess }) {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState('FAKE_PRODUCT');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in to file a report.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await reportService.submitReport(product.id, reason, details.trim());
      setIsSuccess(true);
      setTimeout(() => {
        if (onReportSuccess) onReportSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card report-modal-box animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="report-success-state">
            <div className="report-success-icon">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
            <h3>Report Submitted</h3>
            <p>Thank you for helping keep VoltTrade safe and transparent. Our trust & safety moderation team will investigate this listing immediately.</p>
          </div>
        ) : (
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="report-header">
              <div className="report-icon-badge">
                <Flag size={22} className="text-danger" />
              </div>
              <div>
                <h3 className="report-title">Report Gadget Listing</h3>
                <p className="report-subtitle">Flag <strong>{product.title}</strong> for moderator review</p>
              </div>
            </div>

            {error && (
              <div className="form-alert error animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Primary Concern *</label>
              <div className="report-reasons-grid">
                <label className={`report-reason-card ${reason === 'FAKE_PRODUCT' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reason"
                    value="FAKE_PRODUCT"
                    checked={reason === 'FAKE_PRODUCT'}
                    onChange={() => setReason('FAKE_PRODUCT')}
                  />
                  <div>
                    <strong>Counterfeit / Clone</strong>
                    <span>Fake or knockoff replica electronic device</span>
                  </div>
                </label>

                <label className={`report-reason-card ${reason === 'SCAM' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reason"
                    value="SCAM"
                    checked={reason === 'SCAM'}
                    onChange={() => setReason('SCAM')}
                  />
                  <div>
                    <strong>Fraud or Scam</strong>
                    <span>Suspicious seller demanding off-platform wire transfer</span>
                  </div>
                </label>

                <label className={`report-reason-card ${reason === 'INCORRECT_INFO' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reason"
                    value="INCORRECT_INFO"
                    checked={reason === 'INCORRECT_INFO'}
                    onChange={() => setReason('INCORRECT_INFO')}
                  />
                  <div>
                    <strong>Misleading Information</strong>
                    <span>Incorrect specs, condition, photos, or pricing</span>
                  </div>
                </label>

                <label className={`report-reason-card ${reason === 'INAPPROPRIATE_CONTENT' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reason"
                    value="INAPPROPRIATE_CONTENT"
                    checked={reason === 'INAPPROPRIATE_CONTENT'}
                    onChange={() => setReason('INAPPROPRIATE_CONTENT')}
                  />
                  <div>
                    <strong>Inappropriate Content</strong>
                    <span>Offensive descriptions, stolen goods, or spam</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Provide any specific context, serial number discrepancies, or communication issues..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div className="report-safety-notice">
              <ShieldAlert size={16} />
              <span>False reports are taken seriously. Reports are reviewed by human compliance staff.</span>
            </div>

            <div className="report-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-sm"></span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Flag size={15} />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
