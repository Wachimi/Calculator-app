// =========================================
// UTILS.JS - Funkcje pomocnicze
// =========================================

// Formatowanie wyniku - maksymalnie 10 cyfr
export function formatResult(num) {
    if (isNaN(num) || !isFinite(num)) return 'Błąd';

    // Jeśli liczba jest całkowita
    if (Number.isInteger(num)) {
        return num.toLocaleString('pl-PL');
    }

    // Zaokrąglij do 10 cyfr znaczących
    const rounded = parseFloat(num.toPrecision(10));
    return parseFloat(rounded.toString()).toLocaleString('pl-PL', {
        maximumFractionDigits: 8
    });
}

// Dopasuj rozmiar czcionki do długości wyniku
export function adjustFontSize(text) {
    const len = text.length;
    if (len > 12) return '28px';
    if (len > 9) return '36px';
    if (len > 6) return '44px';
    return '52px';
}

// Formatowanie daty/godziny dla historii
export function formatTime() {
    return new Date().toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Zamień operatory na czytelne symbole
export function parseOperator(op) {
    const map = { '÷': '/', '×': '*', '−': '-', '+': '+' };
    return map[op] ?? op;
}