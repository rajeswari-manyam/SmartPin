import React from "react";
import { Link } from "react-router-dom";
import buttonStyles from "../../styles/ButtonStyle";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "gradient-orange"
  | "gradient-blue"
  | "outline"
  | "danger";

type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  className = "",
  title,
}) => {
  const combinedStyles = [
    buttonStyles.base,
    buttonStyles.sizes[size],
    buttonStyles.variants[variant],
    disabled && buttonStyles.states.disabled,
    fullWidth ? buttonStyles.width.full : buttonStyles.width.auto,
    disabled && "pointer-events-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /* ================= INTERNAL LINK ================= */
  if (to) {
    return (
      <Link
        to={disabled ? "#" : to}
        className={combinedStyles}
        title={title}
        aria-disabled={disabled}
        role="button"
      >
        {children}
      </Link>
    );
  }

  /* ================= EXTERNAL LINK ================= */
  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        className={combinedStyles}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        aria-disabled={disabled}
        role="button"
      >
        {children}
      </a>
    );
  }

  /* ================= BUTTON ================= */
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      title={title}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
