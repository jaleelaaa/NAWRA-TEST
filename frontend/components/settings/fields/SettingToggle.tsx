'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';

interface SettingToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#8B2635]/5 transition-colors">
      <div className="flex-1 space-y-1">
        <Label
          htmlFor={id}
          className="text-[#8B1538] font-semibold cursor-pointer"
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-[#6B7280] flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-[#8B1538] data-[state=unchecked]:bg-gray-300"
      />
    </div>
  );
}
