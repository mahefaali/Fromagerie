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
  return <div className="rounded-2xl border border-[#d8d0bd] bg-[#f3eee2] p-4 shadow-sm sm:rounded-[20px] sm:p-6">
    <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
      <label htmlFor={id} className="font-semibold">{label}</label>
      {loading && <span role="status" className="text-sm font-medium text-[#28551c]">Recherche…</span>}
    </div>
    <div className="relative min-w-0">
      <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#756a57] sm:left-5" />
      <Input id={id} type="search" value={value} onChange={event => onChange(event.target.value)}
        className="h-14 min-w-0 rounded-xl border-[#c8bea6] bg-transparent pl-12 text-base sm:h-[72px] sm:rounded-2xl sm:pl-14 sm:text-lg"
        placeholder={placeholder} autoComplete="off" />
    </div>
    {error && <p role="alert" className="mt-4 break-words text-sm text-red-700">{error}</p>}
  </div>;
}
