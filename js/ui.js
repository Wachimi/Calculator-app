// =========================================
// UI.JS - Aktualizacja wyświetlacza
// =========================================

import { adjustFontSize, formatResult } from './utils.js';
import { CATEGORIES } from './converter.js';

// ===== ZAKŁADKI =====

export function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t =>
        t.classList.toggle('active', t.dataset.tab === tabName)
    );
    document.querySelectorAll('.panel').forEach(p =>
        p.classList.toggle('active', p.id === `panel-${tabName}`)
    );
}

// ===== WYŚWIETLACZ KALKULATORA =====

export function updateDisplay(result, expression = '') {
    const resultEl = document.getElementById('result');
    const exprEl = document.getElementById('expression');

    resultEl.textContent = result;
    resultEl.style.fontSize = adjustFontSize(result.toString());
    exprEl.textContent = expression;
}

export function setActiveOperator(op) {
    document.querySelectorAll('.btn-op').forEach(btn => {
        btn.classList.toggle('active-op', btn.dataset.value === op);
    });
}

export function clearActiveOperator() {
    document.querySelectorAll('.btn-op').forEach(btn =>
        btn.classList.remove('active-op')
    );
}

// ===== HISTORIA =====

export function renderHistory(items) {
    const list = document.getElementById('historyList');

    if (!items.length) {
        list.innerHTML = '<div class="history-empty">Brak obliczeń</div>';
        return;
    }

    list.innerHTML = items.map(item => `
        <div class="history-item" data-result="${item.result}">
            <div class="history-expr">${item.expression} =</div>
            <div class="history-res">${formatResult(item.result)}</div>
        </div>
    `).join('');
}

// ===== KONWERTER =====

export function renderConverterUnits(categoryId) {
    const category = CATEGORIES[categoryId];
    const units = category.units;

    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');

    const options = units.map(u =>
        `<option value="${u.id}">${u.label}</option>`
    ).join('');

    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;

    // Domyślnie wybierz drugą jednostkę w "do"
    if (units.length > 1) toSelect.value = units[1].id;
}

export function updateConverterResult(value, formula) {
    document.getElementById('toValue').value = value;
    document.getElementById('convFormula').textContent = formula;
}

export function renderConversionTable(value, from, categoryId) {
    const category = CATEGORIES[categoryId];
    const table = document.getElementById('convTable');

    if (!value || isNaN(value)) {
        table.innerHTML = '';
        return;
    }

    table.innerHTML = category.units.map(unit => {
        const result = category.convert(Number(value), from, unit.id);
        const formatted = parseFloat(result.toPrecision(6));

        return `
            <div class="conv-table-item">
                <div class="conv-table-unit">${unit.label}</div>
                <div class="conv-table-val">${formatted}</div>
            </div>
        `;
    }).join('');
}