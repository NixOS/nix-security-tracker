import { parse as htmlParse } from 'node-html-parser';

/**
 * @param {string} html
 */
export function parseLinks(html) {
    const doc = htmlParse(html);
    return doc
        .querySelectorAll('a')
        .filter(
            (a) =>
                a.hasAttribute('href') &&
                (!a.getAttribute('target') || a.getAttribute('target') === '_self'),
        )
        .map((a) => a.getAttribute('href'));
}
