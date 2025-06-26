import React, { createContext, useState, useContext, useCallback } from 'react';
import './StylingUtility.css';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ message, type, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000); // Auto-dismiss after 3 seconds

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const icon = type === 'success' ? '✔' : '✖';

    return (
        <div className={`toast-notification ${type} visible`} onClick={onDismiss}>
            <div className="toast-icon">{icon}</div>
            <p className="toast-message">{message}</p>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, id: Date.now() });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </ToastContext.Provider>
    );
}; 