/**
 * LED Indicator Component
 * 
 * Camera-inspired status LED with pulse animations.
 * Part of the DarkRoom camera body aesthetic.
 * 
 * Design Rules (from spec):
 * - LEDs only animate when actively processing
 * - No idle blinking
 * - No rainbow effects
 * - Error state is static but intense
 * 
 * States:
 * - off: Dark, inactive
 * - ready: Green, steady glow (no animation)
 * - active: Yellow/amber, pulsing (1.5s)
 * - processing: Yellow/amber, fast pulse (0.8s)
 * - error: Red, steady glow (no animation)
 */

import { cn } from "@/lib/utils";

export type LEDState = "off" | "ready" | "active" | "processing" | "error";

interface LEDIndicatorProps {
  state?: LEDState;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Optional label for accessibility */
  label?: string;
}

export function LEDIndicator({ 
  state = "off", 
  size = "md",
  className,
  label,
}: LEDIndicatorProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <span
      className={cn(
        "led-indicator",
        sizeClasses[size],
        state === "off" && "led-indicator--off",
        state === "ready" && "led-indicator--ready",
        state === "active" && "led-indicator--active",
        state === "processing" && "led-indicator--processing",
        state === "error" && "led-indicator--error",
        className
      )}
      role="status"
      aria-label={label || `Status: ${state}`}
    />
  );
}

/**
 * LCD Display Component
 * 
 * Technical readout displays for session counters, exposure indicators, status.
 * Uses monospace font, subtle glow, firmware-level feel.
 */
interface LCDDisplayProps {
  children: React.ReactNode;
  variant?: "default" | "active" | "large";
  className?: string;
}

export function LCDDisplay({
  children,
  variant = "default",
  className,
}: LCDDisplayProps) {
  return (
    <span
      className={cn(
        "lcd-display",
        variant === "active" && "lcd-display--active",
        variant === "large" && "lcd-display--large",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * LCD Counter Component
 * 
 * Frame counter display (e.g., "3 / 10" for images)
 */
interface LCDCounterProps {
  current: number;
  total: number;
  className?: string;
}

export function LCDCounter({
  current,
  total,
  className,
}: LCDCounterProps) {
  return (
    <span className={cn("lcd-counter", className)}>
      <span className="lcd-counter__value">{current}</span>
      <span className="lcd-counter__separator">/</span>
      <span>{total}</span>
    </span>
  );
}

/**
 * Camera Panel Header with LED
 * 
 * Combines a section title with an LED status indicator.
 * Used at the top of camera-panel components.
 */
interface CameraPanelHeaderProps {
  title: string;
  icon?: React.ReactNode;
  ledState?: LEDState;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function CameraPanelHeader({
  title,
  icon,
  ledState = "off",
  className,
  children,
  onClick,
}: CameraPanelHeaderProps) {
  return (
    <div 
      className={cn("camera-panel__header", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="camera-panel__title">
        <LEDIndicator state={ledState} size="md" label={`${title} status`} />
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * Settings Row with LED
 * 
 * A row for displaying a setting with LED status indicator.
 */
interface SettingsRowProps {
  label: string;
  icon?: React.ReactNode;
  ledState?: LEDState;
  children: React.ReactNode;
  className?: string;
}

export function SettingsRow({
  label,
  icon,
  ledState = "off",
  children,
  className,
}: SettingsRowProps) {
  return (
    <div className={cn("settings-row", className)}>
      <div className="settings-row__led">
        <LEDIndicator state={ledState} label={`${label} status`} />
      </div>
      <div className="settings-row__content">
        <label className="settings-row__label">
          {icon}
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}

/**
 * Mode Dial Button
 * 
 * Shot type buttons styled like physical camera mode dials.
 * Shows LED glow when active.
 */
interface ModeDiaButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export function ModeDialButton({
  icon,
  label,
  description,
  isActive = false,
  onClick,
  className,
}: ModeDiaButtonProps) {
  return (
    <button
      className={cn(
        "mode-dial-btn",
        isActive && "mode-dial-btn--active",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <span className="mode-dial-btn__icon">{icon}</span>
      <span className="mode-dial-btn__label">{label}</span>
      {description && (
        <span className="mode-dial-btn__desc">{description}</span>
      )}
    </button>
  );
}

/**
 * Firmware Preset Button
 * 
 * Platform preset buttons styled like firmware profile selectors.
 * Shows amber LED when active.
 */
interface FirmwarePresetButtonProps {
  label: string;
  description?: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  color?: string;
}

export function FirmwarePresetButton({
  label,
  description,
  isActive = false,
  onClick,
  className,
  color,
}: FirmwarePresetButtonProps) {
  return (
    <button
      className={cn(
        "firmware-preset-btn",
        isActive && "firmware-preset-btn--active",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <span 
        className="firmware-preset-btn__label"
        style={color ? { color } : undefined}
      >
        {label}
      </span>
      {description && (
        <span className="firmware-preset-btn__desc">{description}</span>
      )}
    </button>
  );
}

export default LEDIndicator;










