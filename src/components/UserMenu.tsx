/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import AccountDropdown from "./AccountDropdown";

interface UserMenuProps {
  currentUser: any;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function UserMenu({ currentUser, onLogout, onLoginClick }: UserMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative z-50">
      {currentUser ? (
        <div className="flex items-center gap-3">
          {/* Dynamic Compact Profile Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 bg-[#0052CC]/5 hover:bg-[#0052CC]/10 border border-[#0052CC]/10 hover:border-[#0052CC]/20 rounded-full transition-all text-left cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt={currentUser?.fullName}
                className="w-8 h-8 rounded-full border border-slate-205 object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            
            <div className="hidden sm:block">
              <h4 className="text-[11px] font-bold text-slate-800 leading-none group-hover:text-[#0052CC]">
                {currentUser?.fullName}
              </h4>
              <p className="text-[8.5px] font-mono font-bold text-[#0052CC] mt-0.5 tracking-wider uppercase">
                {currentUser?.roleName || "USER"}
              </p>
            </div>
            
            <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* Connected AccountDropdown component */}
          <AccountDropdown
            isOpen={showDropdown}
            onClose={() => setShowDropdown(false)}
            currentUser={currentUser}
            onLogout={onLogout}
          />
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-full text-xs font-bold font-sans tracking-wide shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer border border-[#0052CC]/30"
        >
          <Icons.UserCheck2 className="w-4 h-4" />
          <span>Connexion Espace RH</span>
        </button>
      )}
    </div>
  );
}
