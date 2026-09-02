import { PasswordGeneratorOptions, PasswordStrength } from '../types';

// Curated memorable word list for passphrases (Diceware style)
export const PASSPHRASE_WORDS: string[] = [
  'anchor', 'apple', 'arrow', 'atlas', 'autumn', 'beacon', 'breeze', 'bridge', 'castle', 'canyon',
  'cedar', 'cliff', 'cloud', 'comet', 'coral', 'crater', 'crystal', 'delta', 'desert', 'diamond',
  'dragon', 'drift', 'eagle', 'echo', 'ember', 'falcon', 'feather', 'forest', 'fossil', 'galaxy',
  'garden', 'glacier', 'granite', 'harbor', 'haven', 'horizon', 'island', 'jasper', 'jungle', 'lagoon',
  'lantern', 'legend', 'lotus', 'lunar', 'magnet', 'marble', 'meadow', 'meteor', 'mineral', 'monarch',
  'mountain', 'nebula', 'nexus', 'oasis', 'ocean', 'orbit', 'orchid', 'pebble', 'phoenix', 'pillar',
  'planet', 'polar', 'prism', 'quartz', 'radar', 'radiant', 'rainbow', 'ravine', 'reef', 'river',
  'safari', 'saddle', 'saturn', 'shadow', 'shield', 'silver', 'solar', 'spark', 'sphere', 'spiral',
  'spring', 'summit', 'sunrise', 'sunset', 'tactic', 'target', 'temple', 'thunder', 'timber', 'topaz',
  'torch', 'tower', 'tulip', 'valley', 'vector', 'velvet', 'vessel', 'vortex', 'voyage', 'walnut',
  'wave', 'whisper', 'willow', 'winter', 'zenith', 'zephyr', 'acorn', 'alder', 'amber', 'bamboo',
  'basalt', 'birch', 'blizzard', 'boulder', 'branch', 'bronze', 'brook', 'canvas', 'carbon', 'cascade',
  'cavern', 'chalice', 'clover', 'cobalt', 'copper', 'cosmos', 'cove', 'cypress', 'dawn', 'dune',
  'dynamo', 'eclipse', 'elm', 'equator', 'everest', 'flame', 'flint', 'flora', 'frost', 'fawn',
  'garnet', 'geyser', 'grove', 'hawk', 'hemlock', 'herald', 'iceberg', 'indigo', 'iron', 'juniper',
  'kaleidoscope', 'kelp', 'kinetic', 'labyrinth', 'leaf', 'lichen', 'limestone', 'lynx', 'magma', 'matrix',
  'moss', 'myrtle', 'nautilus', 'needle', 'nova', 'oak', 'obsidian', 'opal', 'orbit', 'origami',
  'peak', 'pine', 'plateau', 'prairie', 'pulsar', 'pyramid', 'quiver', 'redwood', 'ridge', 'ripple',
  'ruby', 'sable', 'sage', 'sapphire', 'sequoia', 'sierra', 'slate', 'solstice', 'spruce', 'starling',
  'stone', 'stratus', 'sycamore', 'talon', 'tapestry', 'thistle', 'tide', 'titan', 'travertine', 'tundra',
  'umbra', 'vapor', 'vault', 'vernal', 'vibrant', 'violet', 'volcano', 'vortex', 'wilderness', 'wind',
  'zen', 'zodiac', 'alpine', 'aurora', 'badger', 'badlands', 'banyan', 'barley', 'biolume', 'caldera',
  'canopy', 'centaur', 'chapparal', 'chiffon', 'circlet', 'citadel', 'creek', 'crevasse', 'crystalline', 'current',
  'drifter', 'emerald', 'estuary', 'fjord', 'foundry', 'fulgurite', 'glade', 'glen', 'granary', 'granite',
  'gyro', 'halo', 'headland', 'heritage', 'hibiscus', 'highland', 'hydra', 'igneous', 'impala', 'infinity',
  'javelin', 'joule', 'keystone', 'kiln', 'knoll', 'lagoon', 'lanai', 'latitude', 'leyline', 'lichen',
  'locket', 'lodestone', 'luminary', 'lupine', 'magnetite', 'malachite', 'mantle', 'mastiff', 'meridian', 'monolith'
];

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const SIMILAR_CHARS = /[0O1lI|`'"]/g;

/**
 * Gets a cryptographically secure random integer between 0 (inclusive) and max (exclusive).
 */
function getSecureRandomInt(max: number): number {
  if (max <= 1) return 0;
  const array = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  let rand = 0;
  do {
    window.crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= limit);

  return rand % max;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm with cryptographic randomness.
 */
function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a cryptographically strong password based on options.
 */
export function generatePassword(options: PasswordGeneratorOptions): string {
  if (options.mode === 'passphrase') {
    return generatePassphrase(options);
  }

  let charPool = '';
  const guaranteedChars: string[] = [];

  let upper = UPPERCASE_CHARS;
  let lower = LOWERCASE_CHARS;
  let numbers = NUMBER_CHARS;
  let symbols = SYMBOL_CHARS;

  if (options.excludeSimilar) {
    upper = upper.replace(SIMILAR_CHARS, '');
    lower = lower.replace(SIMILAR_CHARS, '');
    numbers = numbers.replace(SIMILAR_CHARS, '');
    symbols = symbols.replace(SIMILAR_CHARS, '');
  }

  if (options.uppercase && upper.length > 0) {
    charPool += upper;
    guaranteedChars.push(upper[getSecureRandomInt(upper.length)]);
  }

  if (options.lowercase && lower.length > 0) {
    charPool += lower;
    guaranteedChars.push(lower[getSecureRandomInt(lower.length)]);
  }

  if (options.numbers && numbers.length > 0) {
    charPool += numbers;
    guaranteedChars.push(numbers[getSecureRandomInt(numbers.length)]);
  }

  if (options.symbols && symbols.length > 0) {
    charPool += symbols;
    guaranteedChars.push(symbols[getSecureRandomInt(symbols.length)]);
  }

  // Fallback if no category selected
  if (charPool.length === 0) {
    charPool = lower;
    guaranteedChars.push(lower[getSecureRandomInt(lower.length)]);
  }

  const length = Math.max(options.length, guaranteedChars.length, 8);
  const passwordChars: string[] = [...guaranteedChars];

  while (passwordChars.length < length) {
    const charIndex = getSecureRandomInt(charPool.length);
    passwordChars.push(charPool[charIndex]);
  }

  return secureShuffle(passwordChars).join('');
}

/**
 * Generates a Diceware-style passphrase.
 */
export function generatePassphrase(options: PasswordGeneratorOptions): string {
  const count = Math.max(3, Math.min(options.wordCount || 4, 8));
  const selectedWords: string[] = [];

  for (let i = 0; i < count; i++) {
    const wordIndex = getSecureRandomInt(PASSPHRASE_WORDS.length);
    let word = PASSPHRASE_WORDS[wordIndex];
    if (options.capitalizeWords) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    selectedWords.push(word);
  }

  if (options.includeNumberInPassphrase) {
    const randomNum = getSecureRandomInt(100);
    const insertPos = getSecureRandomInt(selectedWords.length);
    selectedWords[insertPos] = `${selectedWords[insertPos]}${randomNum}`;
  }

  return selectedWords.join(options.separator || '-');
}

/**
 * Evaluates password strength, entropy in bits, and estimated crack time.
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return {
      score: 0,
      label: 'Very Weak',
      entropyBits: 0,
      crackTimeDisplay: 'Instant',
      feedback: ['Enter a password to test strength.'],
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) poolSize = 10;

  const entropyBits = Math.round(password.length * Math.log2(poolSize));
  const feedback: string[] = [];

  if (password.length < 10) {
    feedback.push('Password is too short. Use at least 12–16 characters.');
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters.');
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers.');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Add special symbols.');
  }

  // Calculate score (0 to 4)
  let score = 0;
  if (entropyBits < 36) {
    score = 0;
  } else if (entropyBits < 56) {
    score = 1;
  } else if (entropyBits < 72) {
    score = 2;
  } else if (entropyBits < 90) {
    score = 3;
  } else {
    score = 4;
  }

  const labels: Array<'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'> = [
    'Very Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong',
  ];

  // Estimated crack time calculation at 100 billion guesses per second (high-end GPU cluster)
  const guessesPerSec = 1e11;
  const totalCombinations = Math.pow(poolSize, password.length);
  const secondsToCrack = totalCombinations / (2 * guessesPerSec); // Average 50% search space

  let crackTimeDisplay = 'Instant';
  if (secondsToCrack < 1) {
    crackTimeDisplay = 'Less than 1 second';
  } else if (secondsToCrack < 60) {
    crackTimeDisplay = `${Math.round(secondsToCrack)} seconds`;
  } else if (secondsToCrack < 3600) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 60)} minutes`;
  } else if (secondsToCrack < 86400) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 3600)} hours`;
  } else if (secondsToCrack < 31536000) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 86400)} days`;
  } else if (secondsToCrack < 31536000 * 1000) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 31536000)} years`;
  } else if (secondsToCrack < 31536000 * 1e6) {
    crackTimeDisplay = `${(secondsToCrack / (31536000 * 1000)).toFixed(1)} thousand years`;
  } else if (secondsToCrack < 31536000 * 1e9) {
    crackTimeDisplay = `${(secondsToCrack / (31536000 * 1e6)).toFixed(1)} million years`;
  } else {
    crackTimeDisplay = 'Centuries+ (Practically uncrackable)';
  }

  return {
    score,
    label: labels[score],
    entropyBits,
    crackTimeDisplay,
    feedback: feedback.length > 0 ? feedback : ['Excellent entropy and length!'],
  };
}
