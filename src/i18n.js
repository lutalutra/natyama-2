export const LANGS = ['ja', 'en']

export function detectLang() {
  const nav = (navigator.language || 'en').toLowerCase()
  if (nav.startsWith('ja')) return 'ja'
  return 'en'
}

export const copy = {
  en: {
    studioBrand: 'STUDIO',
    studioName: 'natyama',
    studioDetail: ['Information/Editorial Design', '', 'n@natyama.com'],
    archiveBy: 'by Natsumi Sugiyama',
  },
  ja: {
    studioBrand: 'STUDIO',
    studioName: 'natyama',
    studioDetail: ['文化・教育・出版周辺のデザイン支援', '', 'n@natyama.com'],
    archiveBy: 'by スギヤマナツミ',
  },
}
