// src/context/ToastContext.jsx
import { createContext, useState, useContext } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toastUi = (
    <ToastContainer
      className="p-3"
      style={{
        position: "fixed",     // ✅ bám theo viewport => luôn trước mắt
        top: 16,
        right: 16,
        zIndex: 999999,        // ✅ nổi lên trên mọi thứ
        pointerEvents: "none", // ✅ click xuyên vùng trống
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          bg="success"
          autohide
          delay={2500}
          onClose={() => removeToast(toast.id)}
          className="mb-2"
          style={{ pointerEvents: "auto" }} // ✅ vẫn tương tác được toast
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">✔ Thông báo</strong>
          </Toast.Header>
          <Toast.Body className="text-white fw-bold">{toast.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(toastUi, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
