import { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService';

export function useHealthCheck(autoCheck = true) {
  const [status, setStatus] = useState('CHECKING'); // 'ONLINE' | 'OFFLINE' | 'CHECKING'
  const [data, setData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = useCallback(async () => {
    setStatus('CHECKING');
    setError(null);
    const result = await healthService.checkBackendHealth();
    
    setLatency(result.latencyMs);
    setLastChecked(new Date());

    if (result.success) {
      setStatus('ONLINE');
      setData(result.data);
    } else {
      setStatus('OFFLINE');
      setError(result.error);
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      fetchHealth();
    }
  }, [autoCheck, fetchHealth]);

  return {
    status,
    data,
    latency,
    error,
    lastChecked,
    refetch: fetchHealth
  };
}
