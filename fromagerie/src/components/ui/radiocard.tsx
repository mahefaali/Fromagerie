import React from 'react';

interface RadioCardProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  title: string;
  description: string;
  onChange: (value: string) => void;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  id,
  name,
  value,
  checked,
  title,
  description,
  onChange,
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-start p-4 rounded-2xl border cursor-pointer transition-all w-full ${
        checked
          ? 'bg-[#FAF7F2] border-[#234A23] ring-1 ring-[#234A23]'
          : 'bg-[#FAF7F2]/50 border-[#EBE5DB] hover:border-gray-300'
      }`}
    >
      <div className="flex items-center h-5 mt-0.5">
        <input
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            checked ? 'border-[#234A23]' : 'border-gray-400'
          }`}
        >
          {checked && <div className="w-3 h-3 rounded-full bg-[#234A23]" />}
        </div>
      </div>
      <div className="ml-3 flex flex-col">
        <span className="text-sm font-semibold text-[#2C3228]">{title}</span>
        <span className="text-xs text-gray-500 leading-tight mt-0.5">{description}</span>
      </div>
    </label>
  );
};