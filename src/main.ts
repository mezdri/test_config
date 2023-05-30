import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import { mount } from '@/setup';

function setupSentry() {
  if (
    !process.env.VUE_APP_SENTRY_DSN ||
    !process.env.VUE_APP_SENTRY_ENVIRONMENT
  ) {
    // Variables de entorno obligatorias para inicialización de sentry
    return;
  }
  if (
    location.hostname === 'localhost' &&
    process.env.VUE_APP_SENTRY_ENVIRONMENT !== 'local-abdon'
  ) {
    // Solo reportar errores locales de Abdón.
    // Cuota de Sentry no es suficiente para reportes por cada desarrollador
    return;
  }
  if (
    location.hostname === 'localhost' &&
    !process.env.VUE_APP_SENTRY_ENVIRONMENT.startsWith('local-')
  ) {
    // Evitar registro de errores a entornos oficiales desde desarrollo local
    return;
  }

  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN,
    environment: process.env.VUE_APP_SENTRY_ENVIRONMENT,
    integrations: [
      new Integrations.Vue({ Vue, attachProps: true, logErrors: true }),
    ],
  });
}

function validateEnvironment() {
  if (!process.env.VUE_APP_GOOGLE_MAPS_API_KEY) {
    Sentry.captureException(
      new Error('Llave de API para Google Maps no proporcionada')
    );
  }
}

setupSentry();
validateEnvironment();
mount();
