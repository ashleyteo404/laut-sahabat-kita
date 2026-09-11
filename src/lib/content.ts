import type { Locale } from '@/lib/i18n/config'
import type { Activity, Badge, Island } from '@/lib/types'

/**
 * Offline fallback for the three content tables, used only when the Supabase content queries fail.
 * Both languages sit on adjacent lines so a translator can review them side by side and the ids
 * cannot drift apart. Keep this in step with the seeds in `supabase/schema.sql`.
 */
interface LocalizedText {
  en: string
  id: string
}

function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en
}

const islandSources = [
  {
    id: 'bidara',
    className: '',
    name: { en: 'Gili Bidara', id: 'Gili Bidara' },
    tagline: {
      en: 'Reef edges & seagrass stories',
      id: 'Tepi terumbu & kisah lamun',
    },
    description: {
      en: 'Observe how coral, seagrass, people, and marine life share one connected island home.',
      id: 'Amati bagaimana karang, lamun, manusia, dan biota laut berbagi satu rumah pulau yang saling terhubung.',
    },
  },
  {
    id: 'range',
    className: 'range',
    name: { en: 'Gili Range', id: 'Gili Range' },
    tagline: { en: 'Mangroves & coastal clues', id: 'Mangrove & jejak pesisir' },
    description: {
      en: 'Follow the shoreline, investigate coastal habitats, and look for nature’s protection systems.',
      id: 'Susuri garis pantai, selidiki habitat pesisir, dan cari sistem pelindung alami.',
    },
  },
  {
    id: 'sarang',
    className: 'sarang',
    name: { en: 'Gili Sarang', id: 'Gili Sarang' },
    tagline: {
      en: 'Wildlife & community knowledge',
      id: 'Satwa liar & pengetahuan masyarakat',
    },
    description: {
      en: 'Meet island species and learn how local knowledge can help care for the sea.',
      id: 'Kenali jenis biota pulau dan pelajari bagaimana pengetahuan lokal dapat membantu merawat laut.',
    },
  },
] satisfies {
  id: string
  className: string
  name: LocalizedText
  tagline: LocalizedText
  description: LocalizedText
}[]

const badgeSources = [
  {
    id: 'coral-explorer',
    icon: '◌',
    name: { en: 'Coral Explorer', id: 'Penjelajah Karang' },
    description: {
      en: 'Understands the reef as a living habitat',
      id: 'Memahami terumbu sebagai habitat yang hidup',
    },
  },
  {
    id: 'mangrove-protector',
    icon: '♧',
    name: { en: 'Mangrove Protector', id: 'Penjaga Mangrove' },
    description: {
      en: 'Discovers how mangroves shelter and protect',
      id: 'Menemukan bagaimana mangrove menaungi dan melindungi',
    },
  },
  {
    id: 'marine-wildlife-guardian',
    icon: '◍',
    name: { en: 'Marine Wildlife Guardian', id: 'Penjaga Satwa Laut' },
    description: {
      en: 'Observes marine life with care and respect',
      id: 'Mengamati biota laut dengan cermat dan penuh hormat',
    },
  },
  {
    id: 'ocean-scientist',
    icon: '⌕',
    name: { en: 'Ocean Scientist', id: 'Ilmuwan Laut' },
    description: {
      en: 'Uses evidence and careful field observation',
      id: 'Menggunakan bukti dan pengamatan lapangan yang cermat',
    },
  },
  {
    id: 'plastic-free-champion',
    icon: '♲',
    name: { en: 'Plastic-Free Champion', id: 'Juara Bebas Plastik' },
    description: {
      en: 'Takes practical action on marine rubbish',
      id: 'Melakukan tindakan nyata terhadap sampah laut',
    },
  },
  {
    id: 'community-ocean-ambassador',
    icon: '☵',
    name: { en: 'Community Ocean Ambassador', id: 'Duta Laut Masyarakat' },
    description: {
      en: 'Shares ocean knowledge with the community',
      id: 'Berbagi pengetahuan laut dengan masyarakat',
    },
  },
] satisfies { id: string; icon: string; name: LocalizedText; description: LocalizedText }[]

const activitySources = [
  {
    id: 'coral-basics',
    islandId: 'bidara',
    badgeId: 'coral-explorer',
    mode: 'online',
    minutes: 12,
    title: { en: 'Meet the coral neighbourhood', id: 'Kenali tetangga karang' },
    description: {
      en: 'Explore a visual guide to coral habitats and discover why a reef is a living neighbourhood.',
      id: 'Jelajahi panduan visual habitat karang dan temukan mengapa terumbu adalah kampung yang hidup.',
    },
    steps: {
      en: [
        'Read the coral habitat story.',
        'Match three reef residents to their homes.',
        'Write one thing a healthy reef needs.',
      ],
      id: [
        'Baca kisah habitat karang.',
        'Cocokkan tiga penghuni terumbu dengan rumahnya.',
        'Tulis satu hal yang dibutuhkan terumbu yang sehat.',
      ],
    },
  },
  {
    id: 'seagrass-watch',
    islandId: 'bidara',
    badgeId: 'ocean-scientist',
    mode: 'field',
    minutes: 35,
    title: { en: 'Seagrass shoreline watch', id: 'Pengamatan lamun di tepi pantai' },
    description: {
      en: 'Observe a seagrass area carefully, record what you see, and leave the habitat as you found it.',
      id: 'Amati area lamun dengan cermat, catat yang kamu lihat, dan tinggalkan habitatnya seperti semula.',
    },
    steps: {
      en: [
        'Choose a safe observation point with your teacher.',
        'Record three living things or signs of life.',
        'Photograph your observation without disturbing wildlife.',
      ],
      id: [
        'Pilih titik pengamatan yang aman bersama gurumu.',
        'Catat tiga makhluk hidup atau tanda kehidupan.',
        'Foto pengamatanmu tanpa mengganggu satwa.',
      ],
    },
  },
  {
    id: 'reef-reflection',
    islandId: 'bidara',
    badgeId: 'marine-wildlife-guardian',
    mode: 'online',
    minutes: 10,
    title: { en: 'A reef through my eyes', id: 'Terumbu lewat mataku' },
    description: {
      en: 'Reflect on how everyday choices on land can affect coral reefs and marine wildlife.',
      id: 'Renungkan bagaimana pilihan sehari-hari di darat dapat memengaruhi terumbu karang dan biota laut.',
    },
    steps: {
      en: [
        'Look closely at the reef illustration.',
        'Identify two human actions that affect the reef.',
        'Choose one action you can take this week.',
      ],
      id: [
        'Amati ilustrasi terumbu dengan saksama.',
        'Temukan dua tindakan manusia yang memengaruhi terumbu.',
        'Pilih satu tindakan yang bisa kamu lakukan minggu ini.',
      ],
    },
  },
  {
    id: 'mangrove-roots',
    islandId: 'range',
    badgeId: 'mangrove-protector',
    mode: 'online',
    minutes: 15,
    title: { en: 'Secrets among the roots', id: 'Rahasia di antara akar' },
    description: {
      en: 'Discover how mangrove roots shelter young animals and protect the coast.',
      id: 'Temukan bagaimana akar mangrove menaungi hewan muda dan melindungi pesisir.',
    },
    steps: {
      en: [
        'Explore the mangrove guide.',
        'Find three animals that use mangroves.',
        'Explain one way roots protect the shore.',
      ],
      id: [
        'Jelajahi panduan mangrove.',
        'Temukan tiga hewan yang memanfaatkan mangrove.',
        'Jelaskan satu cara akar melindungi pantai.',
      ],
    },
  },
  {
    id: 'shore-detective',
    islandId: 'range',
    badgeId: 'ocean-scientist',
    mode: 'field',
    minutes: 40,
    title: { en: 'Intertidal detective', id: 'Detektif zona pasang surut' },
    description: {
      en: 'Investigate the changing world between high and low tide using careful observation.',
      id: 'Selidiki dunia yang berubah antara pasang dan surut dengan pengamatan yang cermat.',
    },
    steps: {
      en: [
        'Check the tide and safety guidance with your teacher.',
        'Find five different natural objects or living things.',
        'Record clues in a photo and short field note.',
      ],
      id: [
        'Periksa kondisi pasang surut dan panduan keselamatan bersama gurumu.',
        'Temukan lima benda alam atau makhluk hidup yang berbeda.',
        'Catat petunjuknya dalam foto dan catatan lapangan singkat.',
      ],
    },
  },
  {
    id: 'waste-audit',
    islandId: 'range',
    badgeId: 'plastic-free-champion',
    mode: 'field',
    minutes: 30,
    title: { en: 'Coastal waste audit', id: 'Audit sampah pesisir' },
    description: {
      en: 'Sort and record shoreline rubbish to understand where it may have come from.',
      id: 'Pilah dan catat sampah di garis pantai untuk memahami dari mana asalnya.',
    },
    steps: {
      en: [
        'Wear gloves and follow your teacher’s safety briefing.',
        'Record rubbish by type without handling sharp objects.',
        'Photograph the completed tally and share one solution.',
      ],
      id: [
        'Pakai sarung tangan dan ikuti arahan keselamatan gurumu.',
        'Catat sampah menurut jenisnya tanpa memegang benda tajam.',
        'Foto hasil pencatatan dan bagikan satu solusi.',
      ],
    },
  },
  {
    id: 'wildlife-guide',
    islandId: 'sarang',
    badgeId: 'marine-wildlife-guardian',
    mode: 'online',
    minutes: 14,
    title: { en: 'Island wildlife field guide', id: 'Panduan lapangan satwa pulau' },
    description: {
      en: 'Learn to notice wildlife responsibly through shape, movement, colour, and habitat clues.',
      id: 'Belajar mengamati satwa secara bertanggung jawab melalui petunjuk bentuk, gerak, warna, dan habitat.',
    },
    steps: {
      en: [
        'Study the wildlife observation guide.',
        'Choose one species and note three features.',
        'Write a respectful wildlife-watching rule.',
      ],
      id: [
        'Pelajari panduan pengamatan satwa.',
        'Pilih satu jenis dan catat tiga cirinya.',
        'Tulis satu aturan mengamati satwa yang penuh hormat.',
      ],
    },
  },
  {
    id: 'fisher-stories',
    islandId: 'sarang',
    badgeId: 'community-ocean-ambassador',
    mode: 'field',
    minutes: 45,
    title: { en: 'A conversation with a fisher', id: 'Berbincang dengan nelayan' },
    description: {
      en: 'Listen to local ecological knowledge and record how the sea has changed over time.',
      id: 'Dengarkan pengetahuan ekologi lokal dan catat bagaimana laut berubah dari waktu ke waktu.',
    },
    steps: {
      en: [
        'Prepare three respectful questions.',
        'Interview a fisher or community elder with permission.',
        'Share one lesson in your own words and add a photo if permitted.',
      ],
      id: [
        'Siapkan tiga pertanyaan yang sopan.',
        'Wawancarai nelayan atau tetua masyarakat dengan izin.',
        'Bagikan satu pelajaran dengan kata-katamu sendiri dan tambahkan foto bila diizinkan.',
      ],
    },
  },
  {
    id: 'ocean-promise',
    islandId: 'sarang',
    badgeId: 'community-ocean-ambassador',
    mode: 'online',
    minutes: 8,
    title: { en: 'My ocean promise', id: 'Janji lautku' },
    description: {
      en: 'Turn what you have learned into a small, practical action you can share with others.',
      id: 'Ubah apa yang kamu pelajari menjadi tindakan kecil dan nyata yang bisa kamu bagikan.',
    },
    steps: {
      en: [
        'Choose an ocean issue you care about.',
        'Write one action you can repeat for a month.',
        'Tell someone why your promise matters.',
      ],
      id: [
        'Pilih satu isu laut yang kamu pedulikan.',
        'Tulis satu tindakan yang bisa kamu ulangi selama sebulan.',
        'Ceritakan kepada seseorang mengapa janjimu penting.',
      ],
    },
  },
] satisfies {
  id: string
  islandId: string
  badgeId: string
  mode: Activity['mode']
  minutes: number
  title: LocalizedText
  description: LocalizedText
  steps: { en: string[]; id: string[] }
}[]

export function getFallbackContent(locale: Locale): {
  islands: Island[]
  activities: Activity[]
  badges: Badge[]
} {
  const islands: Island[] = islandSources.map((source) => ({
    id: source.id,
    className: source.className,
    name: pick(source.name, locale),
    tagline: pick(source.tagline, locale),
    description: pick(source.description, locale),
  }))

  const badges: Badge[] = badgeSources.map((source) => ({
    id: source.id,
    icon: source.icon,
    name: pick(source.name, locale),
    description: pick(source.description, locale),
  }))

  const badgeById = new Map(badges.map((badge) => [badge.id, badge]))
  const activities: Activity[] = activitySources.map((source) => ({
    id: source.id,
    islandId: source.islandId,
    badgeId: source.badgeId,
    badgeName: badgeById.get(source.badgeId)?.name ?? '',
    icon: badgeById.get(source.badgeId)?.icon ?? '✦',
    mode: source.mode,
    minutes: source.minutes,
    title: pick(source.title, locale),
    description: pick(source.description, locale),
    steps: source.steps[locale]?.length ? source.steps[locale] : source.steps.en,
  }))

  return { islands, activities, badges }
}
