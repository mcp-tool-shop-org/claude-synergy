/**
 * Deterministic Float32Array generators for embedding mocks.
 *
 * Identical inputs produce identical vectors across runs so vec-channel queries are
 * stable in tests. The "vectors" are not semantically meaningful — just deterministic.
 */

export const EMBEDDING_DIM = 768;

/**
 * djb2-style hash → 32-bit signed int, used as a seed for `xorshift32`.
 */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

/** Deterministic 32-bit PRNG seeded from `seed`. Returns floats in [0, 1). */
function xorshift32(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}

/**
 * Build a deterministic 768-d Float32Array from a string input.
 * Same input → same output.
 */
export function goldenVector(input: string, dim = EMBEDDING_DIM): Float32Array {
  const rng = xorshift32(hashString(input));
  const out = new Float32Array(dim);
  for (let i = 0; i < dim; i++) {
    out[i] = rng() * 2 - 1; // map to [-1, 1)
  }
  return out;
}

/** Generate as a plain number[] (for fixture JSON / mock response shapes). */
export function goldenVectorArray(input: string, dim = EMBEDDING_DIM): number[] {
  const v = goldenVector(input, dim);
  return Array.from(v);
}

/** Generate N independent golden vectors keyed by the same base + index. */
export function goldenVectors(inputs: string[], dim = EMBEDDING_DIM): Float32Array[] {
  return inputs.map((i) => goldenVector(i, dim));
}
