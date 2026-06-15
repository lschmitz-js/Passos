import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Locale = 'pt' | 'en';

type Ctx = { locale: Locale; setLocale: (l: Locale) => void };
const LocaleContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'passos.locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'pt';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'pt';
  });
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR';
  }, [locale]);
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

const DICT: Record<Locale, Record<string, string>> = {
  pt: {
    'nav.ranking': 'Ranking',
    'nav.graphs': 'Gráficos',
    'group.familia': '🏡 Família',
    'group.todos': '🌍 Família e Amigos',
    'home.title': 'Zoológico de Passos 🦌',
    'home.subtitle': 'Quem mais anda, vira o bicho mais nômade',
    'home.tile.familia.title': 'Família',
    'home.tile.familia.sub': 'competição entre Schmitzes',
    'home.tile.todos.title': 'Família e Amigos',
    'home.tile.todos.sub': 'todo mundo no ranking',
    'header.subtitle': 'Quem mais anda, vira o bicho mais nômade',
    'header.subtitle.graphs': 'Padrões, recordes e linhas do tempo',
    'header.back': '← trocar grupo',
    'header.title.graphs': 'Gráficos 📈',
    'section.thisWeek': 'Esta Semana',
    'section.year': 'Ano Inteiro',
    'section.weekRange': '{0} – {1}',
    'section.weekCount': '{0} semana',
    'section.weekCount.plural': '{0} semanas',
    'totals.competitors': 'Competidores',
    'totals.steps': 'Passos',
    'totals.walked': 'Caminhados',
    'row.steps': 'passos',
    'row.perDay': '{0}/dia',
    'row.firstWeek': 'primeira semana',
    'row.sameAsLast': 'igual à sem. ant.',
    'row.vsLastWeek': 'vs sem. ant.',
    'row.vsLastSnap': 'vs sem. ant.',
    'row.new': 'novo',
    'row.lastSync': 'última sync: {0}',
    'row.noSyncThisWeek': 'sem sincronia esta semana',
    'year.asOf': 'fim de {0}',
    'row.wins': '{0} vitória',
    'row.wins.plural': '{0} vitórias',
    'row.podiums': '{0} pódio',
    'row.podiums.plural': '{0} pódios',
    'gap.diff': '↑ {0} passos de diferença',
    'gap.delta': 'vs sem. passada',
    'days.window': 'últimos {0} dias',
    'days.window.weeks': 'últimas {0} semanas',
    'records.title': 'Recordes',
    'records.bestDay': 'Recorde do ano',
    'records.bestDay.value': '{0} · {1} passos',
    'records.streak': 'Maior sequência ≥10k/dia',
    'records.streak.value': '{0} · {1} dias seguidos',
    'records.bestWeek': 'Melhor semana',
    'records.bestWeek.value': '{0} · {1} passos',
    'records.totalKm': 'Total caminhado pelo grupo',
    'records.totalKm.value': '{0} km',
    'pr.title': 'Recordes pessoais',
    'pr.bestDay': 'Melhor dia',
    'pr.bestWeek': 'Melhor semana',
    'pr.streak': 'Maior sequência ≥10k/dia',
    'pr.totalKm': 'Distância total',
    'pr.favoriteDay': 'Dia favorito da semana',
    'pr.consistency': 'Consistência',
    'pr.consistency.value': '{0} de {1} dias',
    'pr.consistency.sub': '{0}% dos dias caminhou',
    'pr.steps': '{0} passos',
    'pr.days': '{0} dias seguidos',
    'pr.km': '{0} km',
    'pr.avgSub': 'média {0} passos',
    'today.title': 'Hoje',
    'today.updated': 'atualizado {0}',
    'updated.label': 'Atualizado {0}',
    'loading': 'Carregando…',
    'error.load': 'Erro ao carregar dados.',
    'empty': 'Sem dados ainda.',
    'animal.notFound': 'Página não encontrada.',
    'animalRef.title': 'Animais por distância diária',
    'animalRef.sub': 'Cada faixa define o animal pelo seu ritmo de passos.',
    'animalRef.col.natural': 'km/dia',
    'animalRef.col.band': 'passos/dia agora',
    'animalRef.km.day': '~{0} km/dia',
    'animalRef.m.day': '{0} m/dia',
    'animalRef.bandTop': 'acima de {0}',
    'animalRef.bandBottom': 'até {0}',
    'animalRef.bandRange': '{0} – {1}',
    'timeline.daily': 'Linha do tempo diária',
    'timeline.weekly': 'Linha do tempo semanal',
    'timeline.rank': 'Posição por semana',
    'medals.title': 'Medalhas',
    'medals.tab.table': 'Tabela',
    'medals.tab.history': 'Por semana',
    'medals.empty': 'Sem semanas completas no período.',
    'medals.stepsShort': '{0}',
    'animals.title': 'Animais',
    'range.MTD': 'Mês atual',
    'range.LAST_MONTH': 'Mês passado',
    'range.L3M': 'Últimos 3 meses',
    'range.L6M': 'Últimos 6 meses',
    'range.YTD': 'Ano',
    'range.ALL': 'Tudo',
    'dayName.sun': 'Domingo',
    'dayName.mon': 'Segunda',
    'dayName.tue': 'Terça',
    'dayName.wed': 'Quarta',
    'dayName.thu': 'Quinta',
    'dayName.fri': 'Sexta',
    'dayName.sat': 'Sábado',
  },
  en: {
    'nav.ranking': 'Ranking',
    'nav.graphs': 'Charts',
    'group.familia': '🏡 Family',
    'group.todos': '🌍 Family & Friends',
    'home.title': 'Step Zoo 🦌',
    'home.subtitle': 'The more you walk, the wilder your animal',
    'home.tile.familia.title': 'Family',
    'home.tile.familia.sub': 'Schmitzes only',
    'home.tile.todos.title': 'Family & Friends',
    'home.tile.todos.sub': 'everyone on the board',
    'header.subtitle': 'The more you walk, the wilder your animal',
    'header.subtitle.graphs': 'Patterns, records and timelines',
    'header.back': '← change group',
    'header.title.graphs': 'Charts 📈',
    'section.thisWeek': 'This Week',
    'section.year': 'The Year',
    'section.weekRange': '{0} – {1}',
    'section.weekCount': '{0} week',
    'section.weekCount.plural': '{0} weeks',
    'totals.competitors': 'Competitors',
    'totals.steps': 'Steps',
    'totals.walked': 'Walked',
    'row.steps': 'steps',
    'row.perDay': '{0}/day',
    'row.firstWeek': 'first week',
    'row.sameAsLast': 'same as last week',
    'row.vsLastWeek': 'vs last week',
    'row.vsLastSnap': 'vs last week',
    'row.new': 'new',
    'row.lastSync': 'last sync: {0}',
    'row.noSyncThisWeek': 'no sync this week',
    'year.asOf': 'end of {0}',
    'row.wins': '{0} win',
    'row.wins.plural': '{0} wins',
    'row.podiums': '{0} podium',
    'row.podiums.plural': '{0} podiums',
    'gap.diff': '↑ {0} steps gap',
    'gap.delta': 'vs last week',
    'days.window': 'last {0} days',
    'days.window.weeks': 'last {0} weeks',
    'records.title': 'Records',
    'records.bestDay': 'Single-day record',
    'records.bestDay.value': '{0} · {1} steps',
    'records.streak': 'Longest ≥10k streak',
    'records.streak.value': '{0} · {1} days in a row',
    'records.bestWeek': 'Best week',
    'records.bestWeek.value': '{0} · {1} steps',
    'records.totalKm': 'Group total walked',
    'records.totalKm.value': '{0} km',
    'pr.title': 'Personal records',
    'pr.bestDay': 'Best day',
    'pr.bestWeek': 'Best week',
    'pr.streak': 'Longest ≥10k streak',
    'pr.totalKm': 'Total distance',
    'pr.favoriteDay': 'Favorite weekday',
    'pr.consistency': 'Consistency',
    'pr.consistency.value': '{0} of {1} days',
    'pr.consistency.sub': '{0}% of days walked',
    'pr.steps': '{0} steps',
    'pr.days': '{0} days in a row',
    'pr.km': '{0} km',
    'pr.avgSub': 'avg {0} steps',
    'today.title': 'Today',
    'today.updated': 'updated {0}',
    'updated.label': 'Updated {0}',
    'loading': 'Loading…',
    'error.load': 'Failed to load data.',
    'empty': 'No data yet.',
    'animal.notFound': 'Page not found.',
    'animalRef.title': 'Animals by daily distance',
    'animalRef.sub': 'Each tier defines the animal by your step pace.',
    'animalRef.col.natural': 'km/day',
    'animalRef.col.band': 'steps/day now',
    'animalRef.km.day': '~{0} km/day',
    'animalRef.m.day': '{0} m/day',
    'animalRef.bandTop': 'above {0}',
    'animalRef.bandBottom': 'up to {0}',
    'animalRef.bandRange': '{0} – {1}',
    'timeline.daily': 'Daily timeline',
    'timeline.weekly': 'Weekly timeline',
    'timeline.rank': 'Position per week',
    'medals.title': 'Medals',
    'medals.tab.table': 'Table',
    'medals.tab.history': 'By week',
    'medals.empty': 'No completed weeks in this range.',
    'medals.stepsShort': '{0}',
    'animals.title': 'Animals',
    'range.MTD': 'MTD',
    'range.LAST_MONTH': 'Last month',
    'range.L3M': 'Last 3 months',
    'range.L6M': 'Last 6 months',
    'range.YTD': 'YTD',
    'range.ALL': 'All',
    'dayName.sun': 'Sunday',
    'dayName.mon': 'Monday',
    'dayName.tue': 'Tuesday',
    'dayName.wed': 'Wednesday',
    'dayName.thu': 'Thursday',
    'dayName.fri': 'Friday',
    'dayName.sat': 'Saturday',
  },
};

export function useT() {
  const { locale } = useLocale();
  return (key: string, ...args: (string | number)[]) => {
    let s = DICT[locale][key] ?? DICT.pt[key] ?? key;
    args.forEach((arg, i) => {
      s = s.replace(`{${i}}`, String(arg));
    });
    return s;
  };
}

export function localeMeses(l: Locale): string[] {
  return l === 'en'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
}

export function localeDias(l: Locale): string[] {
  return l === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
}

export function fmtNumLocale(n: number, locale: Locale): string {
  return n.toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR');
}
