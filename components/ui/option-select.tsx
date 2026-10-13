"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OptionSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Choose",
}: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
