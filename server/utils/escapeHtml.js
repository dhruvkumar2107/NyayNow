/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = escapeHtml;
