import { describe, it, expect } from 'vitest';
import { eloToDifficulty, BASE_ELO } from '../difficulty';

describe('eloToDifficulty', () => {
  it('maps the base ELO to difficulty level 1', () => {
    expect(eloToDifficulty(BASE_ELO, 1, 10)).toBe(1);
  });

  it('adds one difficulty level per 100 ELO above base', () => {
    expect(eloToDifficulty(BASE_ELO + 100, 1, 10)).toBe(2);
    expect(eloToDifficulty(BASE_ELO + 500, 1, 10)).toBe(6);
  });

  it('rounds to the nearest level', () => {
    expect(eloToDifficulty(BASE_ELO + 149, 1, 10)).toBe(2);
    expect(eloToDifficulty(BASE_ELO + 150, 1, 10)).toBe(3);
  });

  it('clamps to the maximum difficulty', () => {
    expect(eloToDifficulty(BASE_ELO + 5000, 1, 10)).toBe(10);
  });

  it('clamps to the minimum difficulty', () => {
    expect(eloToDifficulty(BASE_ELO - 5000, 1, 10)).toBe(1);
    expect(eloToDifficulty(BASE_ELO - 5000, 3, 10)).toBe(3);
  });
});
