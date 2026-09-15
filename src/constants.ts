import type { RequestData } from './store'

export type Mode = 'create' | 'preview' | 'recipient' | 'manage'

export const emojis: Record<string, string> = {
  Pizza: '🍕',
  Sushi: '🍣',
  Burgers: '🍔',
  Pasta: '🍝',
  Tacos: '🌮',
  Ramen: '🍜',
  Movie: '🎬',
  Walk: '🌿',
  Museum: '🖼️',
  'Mini golf': '⛳',
  Coffee: '☕',
  Concert: '🎶',
}

export const demoRequest: RequestData = {
  id: 'draft',
  recipientName: 'your favorite person',
  intro: 'I have a very important question for you...',
  dates: [],
  times: ['18:00', '19:30', '20:00'],
  activities: ['Movie', 'Walk', 'Mini golf'],
  foods: ['Pizza', 'Tacos', 'Sushi'],
  cancellationWarning: true,
}

export const activityOptions = ['Movie', 'Walk', 'Museum', 'Mini golf', 'Coffee', 'Concert']
export const foodOptions = ['Pizza', 'Sushi', 'Burgers', 'Pasta', 'Tacos', 'Ramen']
export const timeOptions = ['18:00', '19:30', '20:00']

export function emojiFor(data: RequestData, value: string) {
  return data.customEmojis?.[value] || emojis[value] || '♡'
}
