/**
 * @description Function to return shuffled array values (Fisher-Yates[Knuth Shuffle])
 * @param {Array} array - The array to be shuffled
 * @returns The shuffled array
 *  */ 
export function shuffleArray(array) {
    const shuffled = [...array]; // avoid mutating the original array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // swap
    }
    return shuffled;
  }