import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { colorForIndex, type DailyPoint } from '../lib/dashboard';
import { formatDateLocale, fmtNum } from '../lib/dates';
import { useLocale } from '../lib/i18n';
import { displayName } from '../lib/groups';

type Props = {
  title: string;
  subtitle: string;
  points: DailyPoint[];
  users: { id: string; name: string; total: number }[];
  yMode?: 'steps' | 'rank';
  rankMax?: number;
};

const DEFAULT_VISIBLE = 3;

export function Timeline({ title, subtitle, points, users, yMode = 'steps', rankMax }: Props) {
  const { locale } = useLocale();
  const [visible, setVisible] = useState<Set<string>>(
    () => new Set(users.slice(0, DEFAULT_VISIBLE).map((u) => u.id))
  );

  const colors = useMemo(() => {
    const m = new Map<string, string>();
    users.forEach((u, i) => m.set(u.id, colorForIndex(i)));
    return m;
  }, [users]);

  function toggle(id: string) {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isRank = yMode === 'rank';

  return (
    <section className="card p-5 mb-7">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span className="text-[11px] text-muted2 uppercase tracking-wider">{subtitle}</span>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#8b7460' }}
              tickFormatter={(d: string) => formatDateLocale(d, locale)}
              minTickGap={32}
              stroke="#c4b8a8"
            />
            <YAxis
              reversed={isRank}
              tick={{ fontSize: 11, fill: '#8b7460' }}
              tickFormatter={(n: number) =>
                isRank ? String(n) : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
              }
              stroke="#c4b8a8"
              width={42}
              allowDecimals={!isRank}
              domain={isRank ? [1, rankMax ?? 'auto'] : ['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                fontSize: 12,
                padding: '8px 12px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
              }}
              labelFormatter={(d) => (typeof d === 'string' ? formatDateLocale(d, locale) : String(d))}
              formatter={(value, name) => [
                typeof value === 'number' ? (isRank ? `#${value}` : fmtNum(value)) : String(value),
                String(name),
              ]}
            />
            {users
              .filter((u) => visible.has(u.id))
              .map((u) => (
                <Line
                  key={u.id}
                  type="monotone"
                  dataKey={u.id}
                  name={displayName(u.id, u.name, locale)}
                  stroke={colors.get(u.id)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {users.map((u) => {
          const on = visible.has(u.id);
          return (
            <button
              key={u.id}
              onClick={() => toggle(u.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold transition-opacity ${on ? '' : 'opacity-40'}`}
              style={{
                background: on ? `${colors.get(u.id)}22` : 'rgba(0,0,0,0.04)',
                color: on ? colors.get(u.id) : '#8b7460',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: colors.get(u.id) }}
              />
              {displayName(u.id, u.name, locale)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
