import React from 'react';

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ label, children, htmlFor }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#2C3228]">
        {label}
      </label>
      {children}
    </div>
  );
};