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
    studioDetail: ['Design support for cultural, educational', 'and publishing projects.', '', 'n@natyama.com'],
    archiveBy: 'by Natsumi Sugiyama',
  },
  ja: {
    studioBrand: 'STUDIO',
    studioName: 'natyama',
    studioDetail: ['文化・教育・出版プロジェクトのデザイン支援', '', 'n@natyama.com'],
    archiveBy: 'by スギヤマナツミ',
  },
}
