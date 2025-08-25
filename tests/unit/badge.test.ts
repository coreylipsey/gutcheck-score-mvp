import { createBadgeSVG } from '../../src/lib/badge/generateBadge';

describe('Badge Generation', () => {
  test('createBadgeSVG generates valid SVG with correct content', () => {
    const svg = createBadgeSVG({
      score: 85,
      stars: 4.2,
      partner: 'Queens College',
      cohort: 'Alpha-Fall25'
    });

    // Verify SVG structure
    expect(svg).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(svg).toMatch(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toMatch(/<\/svg>$/);

    // Verify content
    expect(svg).toContain('Gutcheck.AI');
    expect(svg).toContain('Queens College • Alpha-Fall25');
    expect(svg).toContain('Score 85');
    expect(svg).toContain('★★★★☆'); // 4 stars + 1 empty star
    expect(svg).toContain('Visibility Unlocked • Share your progress');
  });

  test('createBadgeSVG handles different star ratings correctly', () => {
    const svg1 = createBadgeSVG({
      score: 100,
      stars: 5.0,
      partner: 'Test Partner',
      cohort: 'Test Cohort'
    });
    expect(svg1).toContain('★★★★★'); // 5 full stars

    const svg2 = createBadgeSVG({
      score: 35,
      stars: 1.0,
      partner: 'Test Partner',
      cohort: 'Test Cohort'
    });
    expect(svg2).toContain('★☆☆☆☆'); // 1 full star + 4 empty stars
  });

  test('createBadgeSVG handles special characters in partner/cohort names', () => {
    const svg = createBadgeSVG({
      score: 75,
      stars: 3.5,
      partner: 'Partner & Co.',
      cohort: 'Cohort-2024'
    });

    expect(svg).toContain('Partner & Co. • Cohort-2024');
  });

  test('createBadgeSVG produces deterministic output for same inputs', () => {
    const input = {
      score: 85,
      stars: 4.2,
      partner: 'Queens College',
      cohort: 'Alpha-Fall25'
    };

    const svg1 = createBadgeSVG(input);
    const svg2 = createBadgeSVG(input);

    expect(svg1).toBe(svg2);
  });
});
