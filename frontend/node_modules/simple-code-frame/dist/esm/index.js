import * as kl from 'kolorist';
/**
 * Convert tabs indentation to two spaces.
 */
function tabs2Spaces(str) {
    return str.replace(/^\t+/, tabs => '  '.repeat(tabs.length));
}
/**
 * Generate an excerpt of the location in the source around the
 * specified position.
 */
export function createCodeFrame(text, lineNum, columnNum, { before = 2, after = 3, colors = true, maxWidth = 0, lineMarkerChar = '▶', seperatorChar = '│', columnMarkerChar = '▲' } = {}) {
    const lines = text.split('\n');
    const start = Math.max(0, lineNum - before);
    const end = Math.min(lines.length, lineNum + after + 1);
    // Maximum space needed for line numbering in the current range.
    // Necessary when the amount of digits of the line numbering grows:
    //  999 | asdf
    // 1000 | asdjadfjsa
    const maxLineNum = String(end).length;
    const padding = ' '.repeat(maxLineNum);
    // Normalize all indentation (=tabs) to use 2 spaces. We need to
    // apply the difference to the marker position to move it back in
    // place.
    const spaceLines = [];
    let maxLineLen = 0;
    for (let i = start; i < end; i++) {
        const line = tabs2Spaces(lines[i]);
        spaceLines.push(line);
        if (line.length > maxLineLen)
            maxLineLen = line.length;
    }
    const activeLine = spaceLines[lineNum - start];
    // Move marker into correct place by taking the amount of
    // normalized tabs into account
    const count = Math.max(0, activeLine.length - lines[lineNum].length + columnNum);
    const maxLensWidth = maxWidth - '> '.length - padding.length - ' | '.length;
    let left = 0;
    let right = maxLensWidth;
    if (maxWidth > 0) {
        const half = Math.floor(maxLensWidth / 2);
        let winLeft = count - half;
        if (winLeft > 0) {
            let winRight = count + half - 1;
            left = winLeft;
            right = winRight;
            if (winRight > maxLensWidth) {
                const offset = Math.min(0, winRight - maxLensWidth);
                left -= offset;
                right -= offset;
            }
        }
    }
    const sep = kl.dim(seperatorChar);
    let out = '';
    for (let i = 0; i < spaceLines.length; i++) {
        const line = spaceLines[i];
        const currentLine = kl.dim((padding + (i + start + 1)).slice(-maxLineNum));
        let formatted = line;
        if (maxWidth > 0) {
            formatted = formatted.slice(left, Math.min(right, line.length));
            if (left > 0) {
                formatted = '…' + formatted;
            }
            if (line.length > right) {
                formatted += '…';
            }
        }
        // Line where the error occured
        if (i === lineNum - start) {
            out += kl.red(lineMarkerChar) + ` ${currentLine} ${sep} ${formatted}\n`;
            out += `  ${padding} ${sep} ${' '.repeat(count - left)}${kl.bold(kl.red(columnMarkerChar))}\n`;
        }
        else {
            out += `  ${currentLine} ${sep} ${formatted}\n`;
        }
    }
    return colors ? out : kl.stripColors(out);
}
//# sourceMappingURL=index.js.map