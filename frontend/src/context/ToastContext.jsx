import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastCtx = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const dismiss = id => setToasts(t => t.filter(x => x.id !== id));

  const ICONS  = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
  const COLORS = { success: '#059669', error: '#dc2626', warning: '#d97706', info: '#2563eb' };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} style={{
              background: 'white', border: `1px solid ${COLORS[t.type]}30`,
              borderLeft: `4px solid ${COLORS[t.type]}`,
              padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center',
              gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: 360,
              fontSize: '.875rem', fontWeight: 500, color: '#0f172a',
              animation: 'slideToast .2s ease',
            }}>
              <Icon size={16} color={COLORS[t.type]} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} style={{ color: '#94a3b8', cursor:'pointer' }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideToast{from{opacity:0;transform:translateX(20px)}}`}</style>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
