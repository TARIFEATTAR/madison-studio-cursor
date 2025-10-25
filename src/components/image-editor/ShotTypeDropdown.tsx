import { useState } from "react";
import { cn } from "@/lib/utils";

const SHOT_TYPES = [
  { 
    label: "Product on White", 
    prompt: "A clean studio product shot on a pure white background, soft shadow, high-resolution lighting." 
  },
  { 
    label: "Lifestyle Scene", 
    prompt: "A lifestyle product photo placed in a cozy real-world environment that matches the brand mood." 
  },
  { 
    label: "Natural Setting", 
    prompt: "Product displayed outdoors on natural surfaces like stone or wood with diffused daylight." 
  },
  { 
    label: "Reflective Surface", 
    prompt: "A luxury product photo on a glossy marble or mirrored surface with balanced reflections." 
  },
  { 
    label: "Editorial Luxury", 
    prompt: "High-end editorial perfume shot, dramatic lighting, deep contrast, cinematic tone." 
  },
];

interface ShotTypeDropdownProps {
  onSelect: (shotType: { label: string; prompt: string }) => void;
  className?: string;
}

export default function ShotTypeDropdown({ onSelect, className }: ShotTypeDropdownProps) {
  const [selected, setSelected] = useState(SHOT_TYPES[0].label);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = SHOT_TYPES.find(st => st.label === e.target.value);
    if (selectedType) {
      setSelected(e.target.value);
      onSelect(selectedType);
    }
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      className={cn(
        "bg-studio-charcoal text-studio-text-primary border border-studio-border",
        "rounded-md px-3 py-2 text-sm",
        "focus:border-aged-brass focus:outline-none focus:ring-1 focus:ring-aged-brass/50",
        "hover:bg-studio-card hover:border-studio-border transition-colors",
        "cursor-pointer appearance-none",
        "h-10",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4CFC8' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "12px",
        paddingRight: "2.5rem"
      }}
    >
      {SHOT_TYPES.map(st => (
        <option key={st.label} value={st.label} className="bg-studio-charcoal text-studio-text-primary">
          {st.label}
        </option>
      ))}
    </select>
  );
}
