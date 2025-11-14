'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info } from 'lucide-react';
import type { SelectOption } from '@/lib/types/settings';

interface SettingSelectProps<T extends string = string> {
  id: string;
  label: string;
  description?: string;
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
}

export function SettingSelect<T extends string = string>({
  id,
  label,
  description,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
}: SettingSelectProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[#8B1538] font-semibold">
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className="border-[#8B1538]/20 focus:border-[#C4A647] focus:ring-[#C4A647]"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="focus:bg-[#8B2635]/10 focus:text-[#8B1538]"
            >
              <div className="flex items-center gap-2">
                {option.icon && <option.icon className="h-4 w-4" />}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-xs text-[#6B7280] flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          {description}
        </p>
      )}
    </div>
  );
}
