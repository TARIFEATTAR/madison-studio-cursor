/**
 * MobileSettingModal - Full-screen modal for selecting setting options
 * 
 * Opens as a full-screen overlay with a list of options to choose from.
 * Maintains the Dark Room aesthetic with film/photography styling.
 */

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingOption {
  value: string;
  label: string;
  description?: string;
}

interface MobileSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: SettingOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function MobileSettingModal({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: MobileSettingModalProps) {
  const optionsRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Scroll to selected option when modal opens
  useEffect(() => {
    if (isOpen && selectedOptionRef.current && optionsRef.current) {
      setTimeout(() => {
        selectedOptionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 200);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle option selection
  const handleSelect = useCallback((value: string) => {
    onSelect(value);
  }, [onSelect]);

  // Prevent backdrop touch from propagating
  const handleBackdropClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mobile-setting-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="mobile-setting-modal__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            onTouchEnd={handleBackdropClick}
          />

          {/* Modal Content */}
          <motion.div
            className="mobile-setting-modal__content"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for swipe gesture hint */}
            <div className="mobile-setting-modal__handle" />

            {/* Sticky Header */}
            <div className="mobile-setting-modal__header">
              <h2 className="mobile-setting-modal__title">{title}</h2>
              <button
                className="mobile-setting-modal__close"
                onClick={onClose}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                aria-label="Close"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Options List */}
            <div className="mobile-setting-modal__options" ref={optionsRef}>
              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <button
                    key={option.value}
                    ref={isSelected ? selectedOptionRef : null}
                    className={cn(
                      "mobile-setting-modal__option",
                      isSelected && "mobile-setting-modal__option--selected"
                    )}
                    onClick={() => handleSelect(option.value)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleSelect(option.value);
                    }}
                    type="button"
                  >
                    <div className="mobile-setting-modal__option-content">
                      <span className="mobile-setting-modal__option-label">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mobile-setting-modal__option-desc">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="mobile-setting-modal__option-check">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
