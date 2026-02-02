const verbs = [
  'Running', 'Sleeping', 'Happy', 'Angry', 'Fast', 'Slow', 'Silent', 'Loud',
  'Brave', 'Calm', 'Dancing', 'Flying', 'Jumping', 'Singing', 'Walking',
  'Smiling', 'Dreaming', 'Thinking', 'Talking', 'Laughing'
]

const animals = [
  'Duck', 'Lion', 'Bear', 'Fox', 'Eagle', 'Wolf', 'Cat', 'Dog', 'Tiger',
  'Owl', 'Rabbit', 'Deer', 'Hawk', 'Falcon', 'Panda', 'Koala', 'Penguin',
  'Dolphin', 'Whale', 'Shark', 'Butterfly', 'Dragon', 'Phoenix', 'Unicorn',
  'Cheetah', 'Leopard', 'Panther', 'Jaguar', 'Rhino', 'Hippo', 'Giraffe',
  'Zebra', 'Elephant', 'Kangaroo', 'Koala', 'Wombat', 'Badger', 'Otter',
  'Beaver', 'Moose', 'Elk', 'Antelope', 'Buffalo', 'Cobra', 'Python',
  'Viper', 'Scorpion', 'Spider', 'Beetle', 'Cricket', 'Grasshopper'
]

export function generateUsername(): string {
  const verb = verbs[Math.floor(Math.random() * verbs.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${verb}${animal}`
}

export function getUsernameComponents(username: string): { verb: string; animal: string } {
  const match = username.match(/^([A-Z][a-z]+)([A-Z][a-z]+)$/)
  if (!match) return { verb: '', animal: '' }
  return { verb: match[1], animal: match[2] }
}
