/**
 * Utility to convert numbers to Spanish words (specifically for COP currency)
 */

const UNIDADES = ['', 'UN ', 'DOS ', 'TRES ', 'CUATRO ', 'CINCO ', 'SEIS ', 'SIETE ', 'OCHO ', 'NUEVE '];
const DECENAS = ['', 'DIEZ ', 'VEINTE ', 'TREINTA ', 'CUARENTA ', 'CINCUENTA ', 'SESENTA ', 'SETENTA ', 'OCHENTA ', 'NOVENTA '];
const DIEZ_DIEZ = ['DIEZ ', 'ONCE ', 'DOCE ', 'TRECE ', 'CATORCE ', 'QUINCE ', 'DIECISEIS ', 'DIECISIETE ', 'DIECIOCHO ', 'DIECINUEVE '];
const VEINTE_VEINTE = ['VEINTE ', 'VEINTIUNO ', 'VEINTIDOS ', 'VEINTITRES ', 'VEINTICUATRO ', 'VEINTICINCO ', 'VEINTISEIS ', 'VEINTISIETE ', 'VEINTIOCHO ', 'VEINTINUEVE '];
const CENTENAS = ['', 'CIENTO ', 'DOSCIENTOS ', 'TRESCIENTOS ', 'CUATROCIENTOS ', 'QUINIENTOS ', 'SEISCIENTOS ', 'SETECIENTOS ', 'OCHOCIENTOS ', 'NOVECIENTOS '];

function leerTresDígitos(n: number): string {
    let output = '';

    if (n === 100) return 'CIEN ';

    if (n > 100) {
        output += CENTENAS[Math.floor(n / 100)];
    }

    const resto = n % 100;
    if (resto > 0) {
        if (resto < 10) {
            output += UNIDADES[resto];
        } else if (resto < 20) {
            output += DIEZ_DIEZ[resto - 10];
        } else if (resto < 30) {
            output += VEINTE_VEINTE[resto - 20];
        } else {
            const unidad = resto % 10;
            const decena = Math.floor(resto / 10);
            if (unidad > 0) {
                output += DECENAS[decena] + 'Y ' + UNIDADES[unidad];
            } else {
                output += DECENAS[decena];
            }
        }
    }

    return output;
}

export function numberToWords(n: number): string {
    if (n === 0) return 'CERO';
    if (n < 0) return 'MENOS ' + numberToWords(Math.abs(n));

    let output = '';

    const millones = Math.floor(n / 1000000);
    const miles = Math.floor((n % 1000000) / 1000);
    const resto = Math.floor(n % 1000);

    if (millones > 0) {
        if (millones === 1) {
            output += 'UN MILLÓN ';
        } else {
            output += leerTresDígitos(millones) + 'MILLONES ';
        }
    }

    if (miles > 0) {
        if (miles === 1) {
            output += 'MIL ';
        } else {
            output += leerTresDígitos(miles) + 'MIL ';
        }
    }

    if (resto > 0) {
        output += leerTresDígitos(resto);
    }

    return output.trim() + ' PESOS M/CTE';
}
