// =========================================
// APP.JS - Logika kalkulatora i konwertera
// =========================================

import {
    switchTab,
    updateDisplay,
    setActiveOperator,
    clearActiveOperator,
    renderHistory,
    renderConverterUnits,
    updateConverterResult,
    renderConversionTable
} from './ui.js';
import { formatResult, formatTime, parseOperator } from './utils.js';
import { convert, formatConversion, CATEGORIES } from './converter.js';

// =========================================
// STAN KALKULATORA
// =========================================

const calc = {
    currentValue: '0',
    previousValue: null,
    operator: null,
    waitingForOperand: false,
    expression: ''
};

const HISTORY_KEY = 'calcApp_history';

// =========================================
// INICJALIZACJA
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initCalculator();
    initConverter();
    loadHistory();
    console.log('🧮 Calculator App załadowana!');
});

// =========================================
// ZAKŁADKI
// =========================================

function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

// =========================================
// KALKULATOR - EVENT LISTENERS
// =========================================

function initCalculator() {
    // Delegacja eventów dla przycisków
    document.querySelector('.buttons-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const { action, value } = btn.dataset;

        switch(action) {
            case 'number':   inputNumber(value); break;
            case 'operator': inputOperator(value); break;
            case 'equals':   calculate(); break;
            case 'clear':    clear(); break;
            case 'decimal':  inputDecimal(); break;
            case 'percent':  percent(); break;
            case 'sign':     toggleSign(); break;
        }
    });

    // Historia - kliknięcie wczytuje wynik
    document.getElementById('historyList').addEventListener('click', (e) => {
        const item = e.target.closest('.history-item');
        if (!item) return;

        calc.currentValue = item.dataset.result;
        calc.waitingForOperand = false;
        updateDisplay(formatResult(Number(calc.currentValue)));
    });

    // Wyczyść historię
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory([]);
    });

    // Obsługa klawiatury
    document.addEventListener('keydown', handleKeyboard);
}

// =========================================
// LOGIKA KALKULATORA
// =========================================

function inputNumber(num) {
    if (calc.waitingForOperand) {
        calc.currentValue = num;
        calc.waitingForOperand = false;
    } else {
        calc.currentValue = calc.currentValue === '0'
            ? num
            : calc.currentValue + num;
    }

    updateDisplay(calc.currentValue, calc.expression);
}

function inputDecimal() {
    if (calc.waitingForOperand) {
        calc.currentValue = '0.';
        calc.waitingForOperand = false;
    } else if (!calc.currentValue.includes('.')) {
        calc.currentValue += '.';
    }

    updateDisplay(calc.currentValue, calc.expression);
}

function inputOperator(op) {
    const current = parseFloat(calc.currentValue);

    // Jeśli już mamy operator i nie czekamy na operand - wykonaj obliczenie
    if (calc.operator && !calc.waitingForOperand) {
        const result = performCalculation(calc.previousValue, current, calc.operator);

        calc.currentValue = result.toString();
        calc.expression = `${formatResult(result)} ${op}`;
        updateDisplay(formatResult(result), calc.expression);
    } else {
        calc.expression = `${formatResult(current)} ${op}`;
        updateDisplay(calc.currentValue, calc.expression);
    }

    calc.previousValue = parseFloat(calc.currentValue);
    calc.operator = op;
    calc.waitingForOperand = true;

    setActiveOperator(op);
}

function calculate() {
    if (!calc.operator || calc.previousValue === null) return;

    const current = parseFloat(calc.currentValue);
    const fullExpression = `${formatResult(calc.previousValue)} ${calc.operator} ${formatResult(current)}`;

    const result = performCalculation(calc.previousValue, current, calc.operator);

    if (result === null) {
        updateDisplay('Błąd', fullExpression + ' =');
        return;
    }

    const formatted = formatResult(result);

    updateDisplay(formatted, fullExpression + ' =');

    // Zapisz do historii
    saveToHistory({ expression: fullExpression, result, time: formatTime() });

    calc.currentValue = result.toString();
    calc.previousValue = null;
    calc.operator = null;
    calc.waitingForOperand = true;

    clearActiveOperator();
}

function performCalculation(a, b, op) {
    const jsOp = parseOperator(op);

    switch(jsOp) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b === 0) return null; // Dzielenie przez zero!
            return a / b;
        default: return null;
    }
}

function clear() {
    calc.currentValue = '0';
    calc.previousValue = null;
    calc.operator = null;
    calc.waitingForOperand = false;
    calc.expression = '';

    updateDisplay('0', '');
    clearActiveOperator();
}

function percent() {
    const value = parseFloat(calc.currentValue);
    const result = value / 100;

    calc.currentValue = result.toString();
    updateDisplay(formatResult(result), calc.expression);
}

function toggleSign() {
    const value = parseFloat(calc.currentValue) * -1;
    calc.currentValue = value.toString();
    updateDisplay(formatResult(value), calc.expression);
}

// =========================================
// OBSŁUGA KLAWIATURY
// =========================================

function handleKeyboard(e) {
    // Tylko gdy aktywna zakładka kalkulatora
    if (!document.getElementById('panel-calculator').classList.contains('active')) return;

    // Ignoruj skróty przeglądarki
    if (e.ctrlKey || e.metaKey) return;

    const key = e.key;

    if (key >= '0' && key <= '9') {
        inputNumber(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (key === '+') {
        inputOperator('+');
    } else if (key === '-') {
        inputOperator('−');
    } else if (key === '*') {
        inputOperator('×');
    } else if (key === '/') {
        e.preventDefault();
        inputOperator('÷');
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
    } else if (key === 'Backspace') {
        if (calc.currentValue.length > 1) {
            calc.currentValue = calc.currentValue.slice(0, -1);
        } else {
            calc.currentValue = '0';
        }
        updateDisplay(calc.currentValue, calc.expression);
    } else if (key === '%') {
        percent();
    }
}

// =========================================
// HISTORIA - LOCAL STORAGE
// =========================================

function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

function saveToHistory(item) {
    const history = getHistory();
    history.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    renderHistory(history);
}

function loadHistory() {
    renderHistory(getHistory());
}

// =========================================
// KONWERTER
// =========================================

let currentCategory = 'temperature';

function initConverter() {
    // Inicjalizuj z pierwszą kategorią
    renderConverterUnits(currentCategory);

    // Kategorie
    document.getElementById('convCategories').addEventListener('click', (e) => {
        const btn = e.target.closest('.conv-cat');
        if (!btn) return;

        document.querySelectorAll('.conv-cat').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentCategory = btn.dataset.category;
        renderConverterUnits(currentCategory);

        // Wyczyść wartości
        document.getElementById('fromValue').value = '';
        document.getElementById('toValue').value = '';
        document.getElementById('convFormula').textContent = '';
        document.getElementById('convTable').innerHTML = '';
    });

    // Input - przeliczaj przy wpisywaniu
    document.getElementById('fromValue').addEventListener('input', performConversion);

    // Zmiana jednostek
    document.getElementById('fromUnit').addEventListener('change', performConversion);
    document.getElementById('toUnit').addEventListener('change', performConversion);

    // Zamień jednostki
    document.getElementById('swapBtn').addEventListener('click', swapUnits);
}

function performConversion() {
    const value = parseFloat(document.getElementById('fromValue').value);
    const from = document.getElementById('fromUnit').value;
    const to = document.getElementById('toUnit').value;

    if (isNaN(value)) {
        updateConverterResult('', '');
        document.getElementById('convTable').innerHTML = '';
        return;
    }

    const result = convert(value, from, to, currentCategory);
    const formatted = formatConversion(result);

    const fromLabel = CATEGORIES[currentCategory].units.find(u => u.id === from)?.label || from;
    const toLabel = CATEGORIES[currentCategory].units.find(u => u.id === to)?.label || to;

    const formula = `${value} ${fromLabel} = ${formatted} ${toLabel}`;

    updateConverterResult(formatted, formula);
    renderConversionTable(value, from, currentCategory);
}

function swapUnits() {
    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');
    const fromValue = document.getElementById('fromValue');
    const toValue = document.getElementById('toValue');

    // Zamień jednostki
    [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];

    // Zamień wartości jeśli są
    if (toValue.value) {
        fromValue.value = toValue.value;
    }

    performConversion();
}