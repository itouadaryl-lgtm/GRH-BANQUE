/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";

interface ProtectedRouteProps {
  currentUser: any;
  onLoginTrigger: () => void;
  children: React.ReactNode;
}

export default function ProtectedRoute({ currentUser, onLoginTrigger, children }: ProtectedRouteProps) {
  if (currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-slate-50 border border-slate-100 rounded-3xl space-y-6 max-w-lg mx-auto my-16 shadow-lg animate-slide-up">
      <div className="w-16 h-16 bg-[#0052CC]/10 text-[#0052CC] rounded-full flex items-center justify-center animate-pulse">
        <Icons.Fingerprint className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-850">Identité Non Validée</h2>
        <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-sm mx-auto font-medium">
          Ce module du système central d'AFG Bank Gabon requiert une habilitation validée par clé OTP ou liaison Active Directory.
        </p>
      </div>
      <button
        onClick={onLoginTrigger}
        className="px-6 py-3 bg-[#0052CC] hover:bg-[#0066FF] text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
      >
        <Icons.UserCheck2 className="w-4 h-4" />
        <span>S'authentifier Maintenant</span>
      </button>
    </div>
  );
}
