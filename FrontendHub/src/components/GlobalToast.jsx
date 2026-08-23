import { useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

function GlobalToast({ show, message, onClose }) {
  const [topOffset, setTopOffset] = useState(16);

  useEffect(() => {
    if (!show) return;

    const update = () => setTopOffset(window.scrollY + 16);
    update(); // set ngay lúc toast hiện

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [show]);

  return (
    <ToastContainer
      className="p-3"
      style={{
        position: "absolute",
        top: topOffset,
        right: 16,
        zIndex: 9999,
      }}
    >
      <Toast onClose={onClose} show={show} delay={2500} autohide bg="success">
        <Toast.Header closeButton={false}>
          <strong className="me-auto">✔ Thông báo</strong>
        </Toast.Header>
        <Toast.Body className="text-white fw-bold">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default GlobalToast;
