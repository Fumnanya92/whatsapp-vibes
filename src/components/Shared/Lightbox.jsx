import React, { useEffect } from "react";
import "./Lightbox.css";

const Lightbox = ({ src, alt = "", onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target.classList && e.target.classList.contains("lightbox-overlay")) {
      onClose();
    }
  };

  return (
    <div className="lightbox-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="lightbox-content">
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <img src={src} alt={alt} className="lightbox-image" />
      </div>
    </div>
  );
};

export default Lightbox;
