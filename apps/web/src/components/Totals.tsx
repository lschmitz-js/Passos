type Item = { num: string | number; lbl: string };

export function Totals({ items }: { items: Item[] }) {
  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex-1 bg-white/65 backdrop-blur rounded-xl px-3.5 py-2.5 text-center min-w-[100px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
        >
          <div className="text-[18px] font-extrabold tabnum">{it.num}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted2 mt-0.5">{it.lbl}</div>
        </div>
      ))}
    </div>
  );
}
