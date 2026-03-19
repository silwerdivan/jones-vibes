import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Turn summary shell markup', () => {
    it('uses the sanity label and live sanity total id', () => {
        const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

        expect(indexHtml).toContain('>SANITY<');
        expect(indexHtml).toContain('id="summary-sanity-total"');
        expect(indexHtml).not.toContain('>HAPPINESS<');
        expect(indexHtml).not.toContain('id="summary-happiness-total"');
    });
});
