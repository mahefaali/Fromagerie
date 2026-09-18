export const localDateTimeNow = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

export const milkLotFieldClass =
  "h-12 rounded-2xl border-2 border-[#9b8e75] bg-[#fffefa] px-4 text-[#201d17] shadow-[0_2px_8px_rgba(67,56,36,0.12)] placeholder:text-[#756a57] hover:border-[#75684e] focus-visible:border-[#28551c] focus-visible:ring-4 focus-visible:ring-[#28551c]/20";
