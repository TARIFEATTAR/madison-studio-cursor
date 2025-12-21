import React from 'react';
import { NavLink } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import "./VaultSidebarBtn.css";
import brassKnobImg from "@/assets/brass-vault-knob.png";

interface VaultSidebarBtnProps {
    isActive?: boolean;
    onNavigate?: () => void;
}

export const VaultSidebarBtn = ({ isActive, onNavigate }: VaultSidebarBtnProps) => {
    const { open } = useSidebar();

    return (
        <div className="vault-widget-root">
            <NavLink
                to="/dam"
                onClick={onNavigate}
                className="block w-full no-underline"
            >
                <div className={cn(
                    "sidebar-vault-widget",
                    !open && "is-collapsed",
                    isActive && "is-active"
                )}>
                    {/* Corner Brackets */}
                    <div className="corner-bracket top-left"></div>
                    <div className="corner-bracket top-right"></div>

                    {/* Vault Knob */}
                    <div className="knob-container">
                        <img
                            src={brassKnobImg}
                            alt="Brass Vault Dial"
                            className="brass-knob"
                        />
                    </div>

                    {/* Text Labels */}
                    <div className="vault-text-group">
                        <h3 className="vault-title">The Vault</h3>
                        <span className="vault-subtitle">ASSET LIBRARY</span>
                    </div>

                    {/* Bottom Brackets */}
                    <div className="corner-bracket bottom-left"></div>
                    <div className="corner-bracket bottom-right"></div>
                </div>
            </NavLink>
        </div>
    );
};

export default VaultSidebarBtn;
