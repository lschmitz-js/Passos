import type { Gender } from './animals';
import type { Locale } from './i18n';

/**
 * Title given to whoever is leading the week, rotated daily.
 *
 * The pick is a pure function of the date and the person, so everyone opening
 * the site on the same day sees the same title -- it has to be the same joke
 * for the whole family, not a per-device random.
 *
 * `f` appears only where the feminine form differs; the app already knows each
 * competitor's gender (it is what picks Leoa over Leão). English needs it far
 * less than Portuguese and French, but not never -- King/Queen.
 *
 * These are jokes, not labels: translated for sense rather than word-for-word,
 * because "Passou o Rodo" is not a sentence about a squeegee.
 */
type Form = { m: string; f?: string };
type Title = Record<Locale, Form>;

const TITLES: Title[] = [
  // ---- domínio ----
  { pt: { m: 'Imparável' }, en: { m: 'Unstoppable' }, fr: { m: 'Imparable' } },
  { pt: { m: 'Inalcançável' }, en: { m: 'Out of Reach' }, fr: { m: 'Hors d’Atteinte' } },
  { pt: { m: 'Intocável' }, en: { m: 'Untouchable' }, fr: { m: 'Intouchable' } },
  { pt: { m: 'Invicto', f: 'Invicta' }, en: { m: 'Undefeated' }, fr: { m: 'Invaincu', f: 'Invaincue' } },
  { pt: { m: 'Dono da Rua', f: 'Dona da Rua' }, en: { m: 'Owns the Street' }, fr: { m: 'Maître de la Rue', f: 'Maîtresse de la Rue' } },
  { pt: { m: 'Dono do Mês', f: 'Dona do Mês' }, en: { m: 'Owns the Month' }, fr: { m: 'Maître du Mois', f: 'Maîtresse du Mois' } },
  { pt: { m: 'Manda-Chuva' }, en: { m: 'The Big Boss' }, fr: { m: 'Le Grand Patron', f: 'La Grande Patronne' } },
  { pt: { m: 'Chefe do Pedaço' }, en: { m: 'Boss of the Block' }, fr: { m: 'Chef du Quartier' } },
  { pt: { m: 'Rei do Asfalto', f: 'Rainha do Asfalto' }, en: { m: 'King of the Pavement', f: 'Queen of the Pavement' }, fr: { m: 'Roi du Bitume', f: 'Reine du Bitume' } },
  { pt: { m: 'Dono do Pódio', f: 'Dona do Pódio' }, en: { m: 'Owns the Podium' }, fr: { m: 'Maître du Podium', f: 'Maîtresse du Podium' } },
  { pt: { m: 'Fora de Alcance' }, en: { m: 'Out of Range' }, fr: { m: 'Hors de Portée' } },
  { pt: { m: 'Sem Rival' }, en: { m: 'No Rival' }, fr: { m: 'Sans Rival', f: 'Sans Rivale' } },
  { pt: { m: 'Zerou o Jogo' }, en: { m: 'Beat the Game' }, fr: { m: 'A Fini le Jeu' } },
  { pt: { m: 'Modo Deus' }, en: { m: 'God Mode' }, fr: { m: 'Mode Dieu' } },
  { pt: { m: 'Nível Impossível' }, en: { m: 'Impossible Mode' }, fr: { m: 'Niveau Impossible' } },
  { pt: { m: 'Fora da Curva' }, en: { m: 'Off the Charts' }, fr: { m: 'Hors Normes' } },
  { pt: { m: 'Hors Concours' }, en: { m: 'Hors Concours' }, fr: { m: 'Hors Concours' } },
  { pt: { m: 'Categoria Própria' }, en: { m: 'A Category of One' }, fr: { m: 'Catégorie à Part' } },

  // ---- passos e calçada ----
  { pt: { m: 'Máquina de Passos' }, en: { m: 'Step Machine' }, fr: { m: 'Machine à Pas' } },
  { pt: { m: 'Triturador de Calçada', f: 'Trituradora de Calçada' }, en: { m: 'Pavement Crusher' }, fr: { m: 'Broyeur de Trottoir', f: 'Broyeuse de Trottoir' } },
  { pt: { m: 'Devorador de Asfalto', f: 'Devoradora de Asfalto' }, en: { m: 'Asphalt Eater' }, fr: { m: 'Dévoreur d’Asphalte', f: 'Dévoreuse d’Asphalte' } },
  { pt: { m: 'Come-Quilômetro' }, en: { m: 'Kilometre Eater' }, fr: { m: 'Mangeur de Kilomètres', f: 'Mangeuse de Kilomètres' } },
  { pt: { m: 'Papa-Léguas' }, en: { m: 'Roadrunner' }, fr: { m: 'Bip Bip' } },
  { pt: { m: 'Sola de Ferro' }, en: { m: 'Iron Soles' }, fr: { m: 'Semelles de Fer' } },
  { pt: { m: 'Pé de Vento' }, en: { m: 'Windfoot' }, fr: { m: 'Pied de Vent' } },
  { pt: { m: 'Pé na Estrada' }, en: { m: 'On the Road' }, fr: { m: 'Sur la Route' } },
  { pt: { m: 'Perna Não Cansa' }, en: { m: 'Legs Never Tire' }, fr: { m: 'Jambes Increvables' } },
  { pt: { m: 'Anda que Anda' }, en: { m: 'Walks and Walks' }, fr: { m: 'Marche Sans Fin' } },
  { pt: { m: 'Nunca Senta' }, en: { m: 'Never Sits Down' }, fr: { m: 'Ne S’Assoit Jamais' } },
  { pt: { m: 'Alérgico a Sofá', f: 'Alérgica a Sofá' }, en: { m: 'Allergic to Sofas' }, fr: { m: 'Allergique au Canapé' } },
  { pt: { m: 'Inimigo do Sofá', f: 'Inimiga do Sofá' }, en: { m: 'Enemy of the Sofa' }, fr: { m: 'Ennemi du Canapé', f: 'Ennemie du Canapé' } },
  { pt: { m: 'Terror do Elevador' }, en: { m: 'Terror of Elevators' }, fr: { m: 'Terreur des Ascenseurs' } },
  { pt: { m: 'Só Escada' }, en: { m: 'Stairs Only' }, fr: { m: 'Escaliers Seulement' } },
  { pt: { m: 'O GPS Se Perdeu' }, en: { m: 'The GPS Gave Up' }, fr: { m: 'Le GPS S’est Perdu' } },
  { pt: { m: 'Passômetro Quebrado' }, en: { m: 'Broke the Pedometer' }, fr: { m: 'Podomètre Cassé' } },
  { pt: { m: 'Contador Fumegando' }, en: { m: 'Counter on Fire' }, fr: { m: 'Compteur en Feu' } },
  { pt: { m: 'Estourou o Contador' }, en: { m: 'Maxed the Counter' }, fr: { m: 'A Fait Sauter le Compteur' } },
  { pt: { m: 'Meta é Pouco' }, en: { m: 'Goals Are Cute' }, fr: { m: 'L’Objectif ? Trop Peu' } },
  { pt: { m: '10 Mil é Aquecimento' }, en: { m: '10k Is a Warm-Up' }, fr: { m: '10 000, C’est l’Échauffement' } },
  { pt: { m: 'Aquecimento: 20 Mil' }, en: { m: 'Warm-Up: 20k' }, fr: { m: 'Échauffement : 20 000' } },

  // ---- zoológico ----
  { pt: { m: 'Alfa da Manada' }, en: { m: 'Alpha of the Herd' }, fr: { m: 'Alpha du Troupeau' } },
  { pt: { m: 'Líder da Alcateia' }, en: { m: 'Leader of the Pack' }, fr: { m: 'Chef de Meute' } },
  { pt: { m: 'Chefe do Zoológico' }, en: { m: 'Runs the Zoo' }, fr: { m: 'Patron du Zoo', f: 'Patronne du Zoo' } },
  { pt: { m: 'Bicho Solto' }, en: { m: 'Loose in the Wild' }, fr: { m: 'Bête en Liberté' } },
  { pt: { m: 'Fera Solta' }, en: { m: 'Beast Unleashed' }, fr: { m: 'Fauve Lâché', f: 'Fauve Lâchée' } },
  { pt: { m: 'Predador de Metas', f: 'Predadora de Metas' }, en: { m: 'Goal Predator' }, fr: { m: 'Prédateur d’Objectifs', f: 'Prédatrice d’Objectifs' } },
  { pt: { m: 'Migração Solo' }, en: { m: 'Solo Migration' }, fr: { m: 'Migration en Solo' } },
  { pt: { m: 'Rota Migratória' }, en: { m: 'Migration Route' }, fr: { m: 'Route Migratoire' } },
  { pt: { m: 'Instinto Selvagem' }, en: { m: 'Wild Instinct' }, fr: { m: 'Instinct Sauvage' } },
  { pt: { m: 'Fugiu do Cativeiro' }, en: { m: 'Escaped the Enclosure' }, fr: { m: 'Évadé du Zoo', f: 'Évadée du Zoo' } },
  { pt: { m: 'Rinoceronte Turbinado' }, en: { m: 'Turbocharged Rhino' }, fr: { m: 'Rhinocéros Turbo' } },
  { pt: { m: 'Búfalo a Diesel' }, en: { m: 'Diesel Buffalo' }, fr: { m: 'Buffle Diesel' } },
  { pt: { m: 'O Caribu Aposentou' }, en: { m: 'The Caribou Retired' }, fr: { m: 'Le Caribou a Pris sa Retraite' } },
  { pt: { m: 'Lobo Sem Coleira' }, en: { m: 'Wolf Off the Leash' }, fr: { m: 'Loup Sans Laisse' } },
  { pt: { m: 'Zebra Fugitiva' }, en: { m: 'Runaway Zebra' }, fr: { m: 'Zèbre en Fuite' } },
  { pt: { m: 'Elefante Nômade' }, en: { m: 'Nomad Elephant' }, fr: { m: 'Éléphant Nomade' } },

  // ---- épico ----
  { pt: { m: 'Lenda Viva' }, en: { m: 'Living Legend' }, fr: { m: 'Légende Vivante' } },
  { pt: { m: 'Mito' }, en: { m: 'Legend' }, fr: { m: 'Mythe' } },
  { pt: { m: 'Fenômeno' }, en: { m: 'Phenomenon' }, fr: { m: 'Phénomène' } },
  { pt: { m: 'Fora de Série' }, en: { m: 'One of a Kind' }, fr: { m: 'Hors Série' } },
  { pt: { m: 'Sobrenatural' }, en: { m: 'Supernatural' }, fr: { m: 'Surnaturel', f: 'Surnaturelle' } },
  { pt: { m: 'Inexplicável' }, en: { m: 'Unexplainable' }, fr: { m: 'Inexplicable' } },
  { pt: { m: 'A Ciência Não Explica' }, en: { m: 'Science Can’t Explain It' }, fr: { m: 'La Science n’Explique Pas' } },
  { pt: { m: 'Caso de Estudo' }, en: { m: 'A Case Study' }, fr: { m: 'Cas d’École' } },
  { pt: { m: 'Anomalia Estatística' }, en: { m: 'Statistical Anomaly' }, fr: { m: 'Anomalie Statistique' } },
  { pt: { m: 'Quebra-Recordes' }, en: { m: 'Record Breaker' }, fr: { m: 'Briseur de Records', f: 'Briseuse de Records' } },
  { pt: { m: 'Recordista' }, en: { m: 'Record Holder' }, fr: { m: 'Recordman', f: 'Recordwoman' } },
  { pt: { m: 'Hall da Fama' }, en: { m: 'Hall of Fame' }, fr: { m: 'Panthéon' } },
  { pt: { m: 'Imortal' }, en: { m: 'Immortal' }, fr: { m: 'Immortel', f: 'Immortelle' } },
  { pt: { m: 'Eterno Campeão', f: 'Eterna Campeã' }, en: { m: 'Forever Champion' }, fr: { m: 'Champion Éternel', f: 'Championne Éternelle' } },

  // ---- bordões ----
  { pt: { m: 'Tá Voando' }, en: { m: 'Flying' }, fr: { m: 'Ça Vole' } },
  { pt: { m: 'Tá On' }, en: { m: 'Locked In' }, fr: { m: 'À Fond' } },
  { pt: { m: 'Tá Insano', f: 'Tá Insana' }, en: { m: 'Gone Wild' }, fr: { m: 'Complètement Fou', f: 'Complètement Folle' } },
  { pt: { m: 'Passou o Rodo' }, en: { m: 'Cleaned Up' }, fr: { m: 'A Tout Raflé' } },
  { pt: { m: 'Deu Aula' }, en: { m: 'Gave a Lesson' }, fr: { m: 'A Donné une Leçon' } },
  { pt: { m: 'Deu Show' }, en: { m: 'Stole the Show' }, fr: { m: 'A Fait le Show' } },
  { pt: { m: 'Não Tem Pra Ninguém' }, en: { m: 'No Contest' }, fr: { m: 'Personne ne Suit' } },
  { pt: { m: 'Sem Chance Pros Outros' }, en: { m: 'No Chance for the Rest' }, fr: { m: 'Aucune Chance pour les Autres' } },
  { pt: { m: 'Correu por Fora' }, en: { m: 'Came from Nowhere' }, fr: { m: 'Sorti de Nulle Part', f: 'Sortie de Nulle Part' } },
  { pt: { m: 'Chegou Chegando' }, en: { m: 'Arrived in Style' }, fr: { m: 'Arrivé en Force', f: 'Arrivée en Force' } },
  { pt: { m: 'Avisa a Família' }, en: { m: 'Somebody Tell the Family' }, fr: { m: 'Prévenez la Famille' } },
  { pt: { m: 'Já Ganhou' }, en: { m: 'Already Won' }, fr: { m: 'Déjà Gagné', f: 'Déjà Gagnée' } },

  // ---- garmin ----
  { pt: { m: 'O Garmin Pediu Água' }, en: { m: 'The Garmin Tapped Out' }, fr: { m: 'La Garmin a Demandé Grâce' } },
  { pt: { m: 'O Relógio Cansou' }, en: { m: 'The Watch Got Tired' }, fr: { m: 'La Montre a Fatigué' } },
  { pt: { m: 'A Bateria Desistiu Antes' }, en: { m: 'The Battery Quit First' }, fr: { m: 'La Batterie a Lâché Avant' } },
  { pt: { m: 'Sincronizando Domínio' }, en: { m: 'Syncing Dominance' }, fr: { m: 'Synchronisation de la Domination' } },
  { pt: { m: 'Erro: Passos Demais' }, en: { m: 'Error: Too Many Steps' }, fr: { m: 'Erreur : Trop de Pas' } },
  { pt: { m: 'O Servidor Não Aguenta' }, en: { m: 'The Server Can’t Cope' }, fr: { m: 'Le Serveur Ne Suit Plus' } },
  { pt: { m: 'Atualizando o Recorde' }, en: { m: 'Updating the Record' }, fr: { m: 'Mise à Jour du Record' } },
  { pt: { m: 'Beta Tester de Sola' }, en: { m: 'Sole Beta Tester' }, fr: { m: 'Testeur de Semelles', f: 'Testeuse de Semelles' } },
];

export const TITLE_COUNT = TITLES.length;

/** Small deterministic string hash (FNV-1a). */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * The leader's title for a given day. Seeded with the date and the person, so
 * it changes each day and two people leading different groups do not land on
 * the same one. The index is locale-independent: switching language shows the
 * same joke translated, not a different joke.
 */
export function titleFor(id: string, gender: Gender, dayIso: string, locale: Locale): string {
  const t = TITLES[hash(`${dayIso}:${id}`) % TITLES.length]![locale];
  return gender === 'f' ? (t.f ?? t.m) : t.m;
}
