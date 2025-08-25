import { renderReportHTML } from '../../src/lib/report/generateFunderReport';

describe('Report Generation', () => {
  test('renderReportHTML generates valid HTML with correct content', () => {
    const html = renderReportHTML({
      partner: 'Queens College',
      cohort: 'Alpha-Fall25',
      totals: {
        assessments: 10,
        completed: 8,
        tagged: 6,
        avgScore: 78.5
      }
    });

    // Verify HTML structure
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toMatch(/<html>/);
    expect(html).toMatch(/<\/html>$/);

    // Verify content
    expect(html).toContain('Gutcheck Funder Report');
    expect(html).toContain('Queens College • Alpha-Fall25');
    expect(html).toContain('Key Metrics');
    expect(html).toContain('Total: <b>10</b>');
    expect(html).toContain('Completed: <b>8</b>');
    expect(html).toContain('Tagged: <b>6</b>');
    expect(html).toContain('Avg Score: <b>78.5</b>');
  });

  test('renderReportHTML handles zero values correctly', () => {
    const html = renderReportHTML({
      partner: 'Test Partner',
      cohort: 'Test Cohort',
      totals: {
        assessments: 0,
        completed: 0,
        tagged: 0,
        avgScore: 0
      }
    });

    expect(html).toContain('Total: <b>0</b>');
    expect(html).toContain('Completed: <b>0</b>');
    expect(html).toContain('Tagged: <b>0</b>');
    expect(html).toContain('Avg Score: <b>0.0</b>');
  });

  test('renderReportHTML handles decimal scores correctly', () => {
    const html = renderReportHTML({
      partner: 'Test Partner',
      cohort: 'Test Cohort',
      totals: {
        assessments: 5,
        completed: 5,
        tagged: 3,
        avgScore: 92.75
      }
    });

    expect(html).toContain('Avg Score: <b>92.8</b>'); // Rounded to 1 decimal
  });

  test('renderReportHTML handles special characters in partner/cohort names', () => {
    const html = renderReportHTML({
      partner: 'Partner & Associates, LLC',
      cohort: 'Cohort-2024-Q1',
      totals: {
        assessments: 1,
        completed: 1,
        tagged: 1,
        avgScore: 85.0
      }
    });

    expect(html).toContain('Partner & Associates, LLC • Cohort-2024-Q1');
  });

  test('renderReportHTML produces deterministic output for same inputs', () => {
    const input = {
      partner: 'Queens College',
      cohort: 'Alpha-Fall25',
      totals: {
        assessments: 10,
        completed: 8,
        tagged: 6,
        avgScore: 78.5
      }
    };

    const html1 = renderReportHTML(input);
    const html2 = renderReportHTML(input);

    expect(html1).toBe(html2);
  });

  test('renderReportHTML includes proper CSS styling', () => {
    const html = renderReportHTML({
      partner: 'Test Partner',
      cohort: 'Test Cohort',
      totals: {
        assessments: 1,
        completed: 1,
        tagged: 1,
        avgScore: 85.0
      }
    });

    expect(html).toContain('font-family:Inter,system-ui');
    expect(html).toContain('.card{border:1px solid #e6edf5;padding:16px;border-radius:12px;margin:12px 0}');
  });
});
