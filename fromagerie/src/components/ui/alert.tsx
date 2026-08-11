import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, title }) => {
  return (
    <div className="flex items-start gap-3 bg-destructive/10 border border-[#f5d0c5] rounded-xl p-4 text-[#2c2825]">
      <div className="flex items-center gap-1 text-amber-600 shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span className="text-amber-600 font-bold">⚠️</span>
      </div>
      <div className="text-sm leading-relaxed">
        {title && <p className="font-semibold text-gray-900 mb-0.5">{title}</p>}
        {children}
      </div>
    </div>
  );
};