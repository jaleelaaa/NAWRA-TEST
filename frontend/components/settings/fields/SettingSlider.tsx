'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Info } from 'lucide-react';

interface SettingSliderProps {
  id: string;
  label: string;
  description?: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
  formatValue?: (value: number) => string;
}

export function SettingSlider({
  id,
  label,
  description,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  minLabel,
  maxLabel,
  disabled = false,
  formatValue,
}: SettingSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-[#8B1538] font-semibold">
          {label}
        </Label>
        <span className="text-sm font-medium text-[#8B1538] bg-[#8B2635]/10 px-3 py-1 rounded-full">
          {displayValue}
        </span>
      </div>
      <Slider
        id={id}
        value={[value]}
        onValueChange={([newValue]) => onValueChange(newValue)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="[&_[role=slider]]:bg-[#8B1538] [&_[role=slider]]:border-[#8B1538]"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-[#6B7280]">
          <span>{minLabel || min}</span>
          <span>{maxLabel || max}</span>
        </div>
      )}
      {description && (
        <p className="text-xs text-[#6B7280] flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          {description}
        </p>
      )}
    </div>
  );
}
