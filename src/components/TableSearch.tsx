import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type TableSearchProps = {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
};

export function TableSearch({
  label,
  placeholder,
  value,
  onValueChange,
}: Readonly<TableSearchProps>) {
  return (
    <div className="relative w-full sm:max-w-64">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="pl-8"
      />
    </div>
  );
}
