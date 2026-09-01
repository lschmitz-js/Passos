import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { useT, useLocale, fmtNumLocale } from '../lib/i18n';
import { displayName } from '../lib/groups';
import { formatDateLocale } from '../lib/dates';
import type { Champion } from '../lib/champions';

// Categorical hues, assigned in fixed podium order and never cycled. Validated
// against the cream surface for lightness, chroma, CVD separation and contrast
// (worst adjacent pair ΔE 20.0 deutan / 21.2 normal).
const SERIES = ['#c8461a', '#3b6fd4', '#1a7f5a'];
const THRESHOLD = 10_000;

const short = (n: number) => `${Math.round(n / 1000)}k`;

export function ChampionMonth({ champion }: { champion: Champion }) {
  const t = useT();
  const { locale } = useLocale();
  const { podium, days, stats, leadTakenOn, winner } = champion;
  const colorOf = (id: string): string =>
    SERIES[podium.findIndex((p) => p.id === id)] ?? SERIES[0]!;
  const nameOf = (id: string) => {
    const p = podium.find((x) => x.id === id);
    return p ? displayName(p.id, p.name, locale) : id;
  };

  const leadIdx = leadTakenOn ? days.findIndex((d) => d.date === leadTakenOn) : -1;

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- stat tiles: numbers that are not a chart ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Tile label={t('gal.total')} value={fmtNumLocale(stats.total, locale)} big />
        <Tile label={t('gal.avg')} value={fmtNumLocale(stats.avgPerDay, locale)} />
        <Tile
          label={t('gal.bestDay')}
          value={fmtNumLocale(stats.bestDay.steps, locale)}
          sub={formatDateLocale(stats.bestDay.date, locale)}
        />
        <Tile label={t('gal.over10k')} value={`${stats.daysOver10k}/${stats.daysTotal}`} />
        <Tile label={t('gal.days20k')} value={String(stats.days20k)} />
        <Tile label={t('gal.streak')} value={t('rec.unit.days', stats.longestStreak)} />
        <Tile label={t('gal.daysLed')} value={String(stats.daysLed)} />
        <Tile label={t('gal.margin')} value={fmtNumLocale(stats.marginOverSecond, locale)} />
      </div>

      {/* ---------- the race ---------- */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight">{t('gal.race')}</h3>
        <p className="text-[12px] text-muted3 mb-2">
          {leadTakenOn
            ? t('gal.race.sub', nameOf(winner.id), formatDateLocale(leadTakenOn, locale))
            : t('gal.race.sub.wireToWire', nameOf(winner.id))}
        </p>

        <Legend podium={podium} colorOf={colorOf} nameOf={nameOf} locale={locale} />

        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days} margin={{ top: 10, right: 44, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(44,24,16,0.06)" vertical={false} />
              <XAxis
                dataKey="dom"
                tick={{ fontSize: 10, fill: '#8b7460' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(44,24,16,0.12)' }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#8b7460' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={short}
                width={44}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(44,24,16,0.25)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const rows = podium.map((p) => ({
                    id: p.id,
                    v: (payload[0]!.payload.cum as Record<string, number>)[p.id] ?? 0,
                  }));
                  return (
                    <div className="bg-card rounded-xl shadow-e2 px-3 py-2 text-[12px]">
                      <div className="font-bold mb-1">{t('gal.day', String(label))}</div>
                      {rows.map((r) => (
                        <div key={r.id} className="flex items-center gap-2 tabnum">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: colorOf(r.id) }}
                          />
                          <span className="text-muted">{nameOf(r.id)}</span>
                          <span className="ml-auto font-semibold">{fmtNumLocale(r.v, locale)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {leadIdx >= 0 && (
                <ReferenceLine
                  x={days[leadIdx]!.dom}
                  stroke="rgba(44,24,16,0.35)"
                  strokeDasharray="4 3"
                  label={{
                    value: t('gal.leadFlip'),
                    position: 'insideTopLeft',
                    fontSize: 10,
                    fill: '#6b5340',
                  }}
                />
              )}
              {podium.map((p, i) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={(d) => (d as { cum: Record<string, number> }).cum[p.id] ?? 0}
                  name={nameOf(p.id)}
                  stroke={colorOf(p.id)}
                  strokeWidth={i === 0 ? 2.5 : 2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fffdf8' }}
                  isAnimationActive={false}
                >
                  {/* direct label at the line end, so identity is never colour-alone */}
                  <LabelList
                    content={(props) => {
                      const { index, x, y } = props as { index?: number; x?: number; y?: number };
                      if (index !== days.length - 1 || x == null || y == null) return null;
                      return (
                        <text
                          x={x + 6}
                          y={y + 3}
                          fontSize={10}
                          fontWeight={600}
                          fill="#6b5340"
                        >
                          {nameOf(p.id)}
                        </text>
                      );
                    }}
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ---------- daily steps ---------- */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight">
          {t('gal.daily', nameOf(winner.id))}
        </h3>
        <p className="text-[12px] text-muted3 mb-2">{t('gal.daily.sub')}</p>
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ top: 6, right: 8, left: -12, bottom: 0 }} barCategoryGap={2}>
              <CartesianGrid stroke="rgba(44,24,16,0.06)" vertical={false} />
              <XAxis
                dataKey="dom"
                tick={{ fontSize: 10, fill: '#8b7460' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(44,24,16,0.12)' }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#8b7460' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={short}
                width={44}
              />
              <Tooltip
                cursor={{ fill: 'rgba(44,24,16,0.05)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-card rounded-xl shadow-e2 px-3 py-2 text-[12px] tabnum">
                      <div className="font-bold">{t('gal.day', String(label))}</div>
                      <div>{fmtNumLocale(Number(payload[0]!.value), locale)}</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={THRESHOLD}
                stroke="rgba(44,24,16,0.3)"
                strokeDasharray="4 3"
                label={{ value: '10k', position: 'right', fontSize: 10, fill: '#6b5340' }}
              />
              <Bar dataKey="steps" fill={SERIES[0]!} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function Legend({
  podium,
  colorOf,
  nameOf,
  locale,
}: {
  podium: Champion['podium'];
  colorOf: (id: string) => string;
  nameOf: (id: string) => string;
  locale: 'pt' | 'en' | 'fr';
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
      {podium.map((p) => (
        <span key={p.id} className="flex items-center gap-1.5 text-[12px]">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorOf(p.id) }} />
          <span className="text-muted font-semibold">{nameOf(p.id)}</span>
          <span className="tabnum text-muted3">{fmtNumLocale(p.steps, locale)}</span>
        </span>
      ))}
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  big,
}: {
  label: string;
  value: string;
  sub?: string;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl bg-ink/[0.035] px-3 py-2.5">
      <div className="eyebrow mb-0.5">{label}</div>
      <div className={`display tabnum font-semibold ${big ? 'text-stat' : 'text-[19px]'}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted3 tabnum">{sub}</div>}
    </div>
  );
}
