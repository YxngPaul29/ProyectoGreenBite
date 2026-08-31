/* ============================================================
   GreenBite — Sistema de Pagos Simulado
   ============================================================
   IMPORTANTE: Este es un prototipo académico.
   NO se conecta a pasarelas reales (Stripe, PayPal, etc.)
   NO se almacenan datos sensibles (CVV, número completo de tarjeta).
   ============================================================ */

/**
 * Algoritmo de Luhn para validar números de tarjeta de crédito.
 */
export function validarLuhn(numero) {
  const digits = numero.replace(/\s|-/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valida que la fecha de expiración MM/YY sea futura.
 */
export function validarExpiracion(mmyy) {
  const match = mmyy.replace(/\s/g, '').match(/^(\d{2})\/?(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expDate = new Date(year, month); // First day of NEXT month
  return expDate > now;
}

/**
 * Valida el CVV (3-4 dígitos).
 */
export function validarCVV(cvv) {
  return /^\d{3,4}$/.test(cvv.replace(/\s/g, ''));
}

/**
 * Obtiene los últimos 4 dígitos de un número de tarjeta.
 * Nunca almacenamos el número completo.
 */
export function getUltimos4(numero) {
  const digits = numero.replace(/\s|-/g, '');
  return digits.slice(-4);
}

/**
 * Detecta el tipo de tarjeta por su prefijo.
 */
export function detectarTipoTarjeta(numero) {
  const digits = numero.replace(/\s|-/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return 'Tarjeta';
}

/**
 * Formatea un número de tarjeta con espacios (para display).
 */
export function formatearNumeroTarjeta(numero) {
  const digits = numero.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

/**
 * Valida todos los campos de la tarjeta.
 * Retorna { valid: bool, errors: string[] }
 */
export function validarTarjeta(numero, expiracion, cvv) {
  const errors = [];

  if (!numero || !numero.replace(/\s|-/g, '')) {
    errors.push('El número de tarjeta es requerido.');
  } else if (!validarLuhn(numero)) {
    errors.push('El número de tarjeta no es válido.');
  }

  if (!expiracion) {
    errors.push('La fecha de expiración es requerida.');
  } else if (!validarExpiracion(expiracion)) {
    errors.push('La tarjeta está expirada o la fecha no es válida.');
  }

  if (!cvv) {
    errors.push('El CVV es requerido.');
  } else if (!validarCVV(cvv)) {
    errors.push('El CVV debe ser de 3 o 4 dígitos.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Gateway de pago SIMULADO.
 * Simula un procesamiento con delay y probabilidad de aprobación.
 * 
 * @param {Object} datosPago - { numero, expiracion, cvv, monto }
 * @returns {Promise<Object>} - { aprobado: bool, mensaje: string, referencia: string }
 */
export function procesarPagoSimulado(datosPago) {
  return new Promise((resolve) => {
    // Simulate processing delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;

    setTimeout(() => {
      // First validate the card
      const validacion = validarTarjeta(datosPago.numero, datosPago.expiracion, datosPago.cvv);
      if (!validacion.valid) {
        resolve({
          aprobado: false,
          mensaje: validacion.errors[0],
          referencia: null,
        });
        return;
      }

      // 90% approval rate for valid cards
      const aprobado = Math.random() < 0.9;

      // Special test cards:
      // 4242 4242 4242 4242 → always approved
      // 4000 0000 0000 0002 → always declined
      const cleanNum = datosPago.numero.replace(/\s|-/g, '');
      if (cleanNum === '4242424242424242') {
        resolve({
          aprobado: true,
          mensaje: 'Pago aprobado exitosamente.',
          referencia: 'GB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        });
        return;
      }
      if (cleanNum === '4000000000000002') {
        resolve({
          aprobado: false,
          mensaje: 'Tarjeta rechazada por el banco emisor.',
          referencia: null,
        });
        return;
      }

      resolve({
        aprobado,
        mensaje: aprobado
          ? 'Pago aprobado exitosamente.'
          : 'Pago rechazado. Fondos insuficientes.',
        referencia: aprobado
          ? 'GB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
          : null,
      });
    }, delay);
  });
}

/**
 * Tarjetas de prueba para mostrar al usuario.
 */
export const TARJETAS_PRUEBA = [
  { numero: '4242 4242 4242 4242', desc: 'Visa — Siempre aprobada', exp: '12/28', cvv: '123' },
  { numero: '5555 5555 5555 4444', desc: 'Mastercard — Aprobación aleatoria (90%)', exp: '06/27', cvv: '456' },
  { numero: '4000 0000 0000 0002', desc: 'Visa — Siempre rechazada', exp: '03/29', cvv: '789' },
];
