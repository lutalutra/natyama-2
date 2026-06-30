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
    studioDetail: ['Design for editorial, digital,', 'and research contexts.'],
    archiveBy: 'Natsumi Sugiyama',
    contactButton: 'Ask me anything',
    contactTitle: 'Get in touch',
    contactName: 'Name',
    contactNamePlaceholder: 'Your name',
    contactEmail: 'Contact',
    contactEmailPlaceholder: 'Your email',
    contactSubject: 'Subject',
    contactSubjectPlaceholder: 'What is this about?',
    contactMessage: 'Message',
    contactMessagePlaceholder: 'Write your message…',
    contactSend: 'Send',
    contactClose: 'Close',
  },
  ja: {
    studioBrand: 'STUDIO',
    studioName: 'natyama',
    studioDetail: ['文化・教育・出版プロジェクトのデザイン支援'],
    archiveBy: 'スギヤマナツミ',
    contactButton: 'Ask me anything',
    contactTitle: 'お問い合わせ',
    contactName: '名前',
    contactNamePlaceholder: 'お名前',
    contactEmail: '連絡先',
    contactEmailPlaceholder: 'メールアドレス',
    contactSubject: '件名',
    contactSubjectPlaceholder: '件名',
    contactMessage: '内容',
    contactMessagePlaceholder: 'お問い合わせ内容をご記入ください',
    contactSend: '送信',
    contactClose: '閉じる',
  },
}
