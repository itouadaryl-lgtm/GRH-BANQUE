/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import AccountDropdown from "./AccountDropdown";

interface SidebarAccountMenuProps {
  currentUser: any;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function SidebarAccountMenu({ currentUser, onLogout, onLoginClick }: SidebarAccountMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative mt-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
      {currentUser ? (
        <div>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-white/10 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                  alt={currentUser?.fullName}
                  className="w-8 h-8 rounded-lg object-cover border border-white/20"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white leading-none truncate group-hover:text-emerald-300">
                  {currentUser?.fullName}
                </p>
                <p className="text-[8px] font-mono text-white/50 tracking-wider mt-0.5 truncate0">
                  {currentUser?.position || "Collaborateur"}
                </p>
              </div>
            </div>
            <Icons.ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors shrink-0" />
          </button>

          {/* Connected premium dropdown placed at bottom or top overlay */}
          {showDropdown && (
            <div className="absolute left-full bottom-0 ml-4 z-55">
              <AccountDropdown
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
                currentUser={currentUser}
                onLogout={onLogout}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-[10.5px] font-bold transition-all cursor-pointer border border-white/10"
        >
          <Icons.UserCheck2 className="w-3.5 h-3.5 text-white/70" />
          <span>S'authentifier</span>
        </button>
      )}
    </div>
  );
}
