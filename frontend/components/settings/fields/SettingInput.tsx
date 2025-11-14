'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';

interface SettingInputProps {
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'number' | 'password';
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function SettingInput({
  id,
  label,
  description,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  error,
}: SettingInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[#8B1538] font-semibold flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="border-[#8B1538]/20 focus:border-[#C4A647] focus:ring-[#C4A647] focus:ring-[3px] transition-all duration-200"
      />
      {description && !error && (
        <p className="text-xs text-[#6B7280] flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <Info className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
