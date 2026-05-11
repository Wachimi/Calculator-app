// =========================================
// CONVERTER.JS - Logika konwersji jednostek
// =========================================

export const CATEGORIES = {
    temperature: {
        label: 'Temperatura',
        units: [
            { id: 'c', label: 'Celsjusz (°C)' },
            { id: 'f', label: 'Fahrenheit (°F)' },
            { id: 'k', label: 'Kelwin (K)' },
        ],
        // Temperatura wymaga specjalnych wzorów (nie prostego mnożnika)
        convert(value, from, to) {
            // Najpierw zamień na °C
            let celsius;
            switch(from) {
                case 'c': celsius = value; break;
                case 'f': celsius = (value - 32) * 5/9; break;
                case 'k': celsius = value - 273.15; break;
            }
            // Potem z °C na docelową jednostkę
            switch(to) {
                case 'c': return celsius;
                case 'f': return celsius * 9/5 + 32;
                case 'k': return celsius + 273.15;
            }
        }
    },

    length: {
        label: 'Długość',
        // Wszystko w metrach (mnożnik do metrów)
        units: [
            { id: 'km',  label: 'Kilometry (km)',   factor: 1000 },
            { id: 'm',   label: 'Metry (m)',         factor: 1 },
            { id: 'cm',  label: 'Centymetry (cm)',   factor: 0.01 },
            { id: 'mm',  label: 'Milimetry (mm)',    factor: 0.001 },
            { id: 'mi',  label: 'Mile (mi)',          factor: 1609.344 },
            { id: 'yd',  label: 'Jardy (yd)',         factor: 0.9144 },
            { id: 'ft',  label: 'Stopy (ft)',         factor: 0.3048 },
            { id: 'in',  label: 'Cale (in)',          factor: 0.0254 },
        ],
        convert(value, from, to) {
            const fromFactor = this.units.find(u => u.id === from).factor;
            const toFactor = this.units.find(u => u.id === to).factor;
            return value * fromFactor / toFactor;
        }
    },

    weight: {
        label: 'Waga',
        // Wszystko w kilogramach
        units: [
            { id: 'kg',  label: 'Kilogramy (kg)',  factor: 1 },
            { id: 'g',   label: 'Gramy (g)',        factor: 0.001 },
            { id: 'mg',  label: 'Miligramy (mg)',   factor: 0.000001 },
            { id: 't',   label: 'Tony (t)',          factor: 1000 },
            { id: 'lb',  label: 'Funty (lb)',        factor: 0.453592 },
            { id: 'oz',  label: 'Uncje (oz)',        factor: 0.0283495 },
        ],
        convert(value, from, to) {
            const fromFactor = this.units.find(u => u.id === from).factor;
            const toFactor = this.units.find(u => u.id === to).factor;
            return value * fromFactor / toFactor;
        }
    },

    speed: {
        label: 'Prędkość',
        // Wszystko w m/s
        units: [
            { id: 'ms',   label: 'Metry/s (m/s)',    factor: 1 },
            { id: 'kmh',  label: 'Kilometry/h (km/h)', factor: 1/3.6 },
            { id: 'mph',  label: 'Mile/h (mph)',       factor: 0.44704 },
            { id: 'knot', label: 'Węzły (kn)',         factor: 0.514444 },
        ],
        convert(value, from, to) {
            const fromFactor = this.units.find(u => u.id === from).factor;
            const toFactor = this.units.find(u => u.id === to).factor;
            return value * fromFactor / toFactor;
        }
    }
};

// Przelicz wartość między jednostkami
export function convert(value, from, to, categoryId) {
    const category = CATEGORIES[categoryId];
    if (!category) return null;
    if (from === to) return value;
    return category.convert(value, from, to);
}

// Sformatuj wynik konwersji
export function formatConversion(value) {
    if (value === null || isNaN(value)) return '';
    if (Math.abs(value) < 0.000001 && value !== 0) {
        return value.toExponential(4);
    }
    return parseFloat(value.toPrecision(8)).toString();
}