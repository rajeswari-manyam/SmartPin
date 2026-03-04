import React, { useEffect } from "react";

interface NotificationToastProps {
  title: string;
  body: string;
  onDismiss: () => void;
  onView?: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  body,
  onDismiss,
  onView,
}) => {
  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <>
      {/* Dark overlay behind modal */}
      <div
        onClick={onDismiss}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 9998,
        }}
      />

      {/* Modal card — centered like screenshot */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "85%",
          maxWidth: 380,
          backgroundColor: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          padding: "28px 24px 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Title row with NEW badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111",
              lineHeight: 1.2,
            }}
          >
            {title}
          </span>
          <span
            style={{
              backgroundColor: "#607D8B",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 7px",
              borderRadius: 5,
              letterSpacing: 0.5,
              flexShrink: 0,
            }}
          >
            NEW
          </span>
        </div>

        {/* Message body */}
        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: "#333",
            lineHeight: 1.6,
          }}
        >
          {body}
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 24,
            marginTop: 8,
          }}
        >
          <button
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              color: "#009688",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              letterSpacing: 0.5,
              padding: "4px 0",
            }}
          >
            DISMISS
          </button>

          {onView && (
            <button
              onClick={() => {
                onDismiss();
                onView();
              }}
              style={{
                background: "none",
                border: "none",
                color: "#009688",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                letterSpacing: 0.5,
                padding: "4px 0",
              }}
            >
              VIEW
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationToast;