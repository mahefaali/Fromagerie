import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";

interface TraceabilitySearchProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  loading: boolean;
  error: string | null;
  onChange: (value: string) => void;
}

export function TraceabilitySearch({
  id, label, placeholder, value, loading, error, onChange,
}: TraceabilitySearchProps) {
  return <div className="rounded-2xl border border-[#d8d0bd] bg-[#f3eee2] p-4 shadow-sm sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-3">
      <label htmlFor={id} className="font-semibold">{label}</label>
      {loading && <span role="status" className="text-sm font-medium text-[#28551c]">Recherche…</span>}
    </div>
    <div className="relative min-w-0">
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#756a57]" />
      <Input id={id} type="search" value={value} onChange={event => onChange(event.target.value)}
        className="h-11 min-w-0 rounded-xl border-[#c8bea6] bg-transparent pl-10 text-sm sm:h-12 sm:text-base"
        placeholder={placeholder} autoComplete="off" />
    </div>
    {error && <p role="alert" className="mt-4 break-words text-sm text-red-700">{error}</p>}
  </div>;
}
