export const NEON = [
  '#ff00aa',
  '#00ff88',
  '#ffff00',
  '#00e5ff',
  '#ff3b3b',
  '#9b5cff',
  '#ff6b00',
  '#39ff14',
];

export const CREATURES = [
  {
    key: 'tralalero',
    name: 'TRALALERO',
    image: require('../../assets/brainrot/tralalero.png'),
  },
  {
    key: 'bombardiro',
    name: 'BOMBARDIRO',
    image: require('../../assets/brainrot/bombardiro.png'),
  },
  {
    key: 'tungtung',
    name: 'TUNG TUNG',
    image: require('../../assets/brainrot/tungtung.png'),
  },
  {
    key: 'cappuccina',
    name: 'CAPPUCCINA',
    image: require('../../assets/brainrot/cappuccina.png'),
  },
  {
    key: 'patapim',
    name: 'PATAPIM',
    image: require('../../assets/brainrot/patapim.png'),
  },
  {
    key: 'bananini',
    name: 'BANANINI',
    image: require('../../assets/brainrot/bananini.png'),
  },
  {
    key: 'lirili',
    name: 'LIRILI',
    image: require('../../assets/brainrot/lirili.png'),
  },
  {
    key: 'tripitropi',
    name: 'TRIPI TROPI',
    image: require('../../assets/brainrot/tripitropi.png'),
  },
];

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function pickCreature(key) {
  if (key) return CREATURES.find((c) => c.key === key) ?? CREATURES[0];
  return CREATURES[Math.floor(Math.random() * CREATURES.length)];
}

export function rankFor(aura) {
  if (aura >= 80000) return 'GOAT DEL MULTIVERSO';
  if (aura >= 50000) return 'SIGMA DIVINO 67';
  if (aura >= 28000) return 'LOCKED IN FRFR';
  if (aura >= 14000) return 'AURA FARMER';
  if (aura >= 6000) return 'MID PERO COOKED';
  return 'NPC SIN RIZZ';
}
