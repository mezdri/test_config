// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import postLogin from './server/responses/postLogin';
import getEstadoUi from './server/responses/getEstadoUi';
import setupCypressServerRoutes from './server/setupCypressServerRoutes';

Cypress.Commands.add('setup', setupCypressServerRoutes);
Cypress.Commands.add('login', () => {
  window.localStorage.setItem(
    'token',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI1IiwiY2xpZW50ZUlkIjoiNCIsImR1cmFjaW9uIjoiNzIwIiwiZXhwIjoxNTY5NDg3ODY0LCJpYXQiOjE1Njk0NDQ2NjQsImlzcyI6Imh0dHA6Ly9kZXNhdHJhY2tmcm9udC5ncHNjaGlsZS5sb2NhbC9hdXRoIiwiYXVkIjoiaHR0cDovL2Rlc2F0cmFja2Zyb250Lmdwc2NoaWxlLmxvY2FsL2F1dGgifQ.-x21KD44hLqSu-SGPhHBfJuex51AJvIz0MsFEJvhvyA'
  );
  window.localStorage.setItem('user', JSON.stringify(postLogin.usuario));
  window.localStorage.setItem(
    'clienteDefecto',
    getEstadoUi.clienteId.toString()
  );
});

/* toasts */

Cypress.Commands.add('assertToast', (context, text) =>
  cy
    .get(`.snotifyToast.snotify-${context}`)
    .should('be.visible')
    .children('.snotifyToast__inner')
    .children('.snotifyToast__body')
    .should('be.visible')
    .should('have.text', text)
);
Cypress.Commands.add('assertErrorToast', text => cy.assertToast('error', text));
Cypress.Commands.add('assertWarningToast', text =>
  cy.assertToast('warning', text)
);
Cypress.Commands.add('assertSuccessToast', text =>
  cy.assertToast('success', text)
);

/* vuetify */

Cypress.Commands.add('findActiveMenu', () =>
  cy.get('.menuable__content__active')
);

/* tablas */

Cypress.Commands.add('assertTableRowsLength', (testId, length) =>
  cy
    .findByTestId(testId)
    .within(() => cy.get('[ref="lbRecordCount"]'))
    .should('have.text', length.toString())
);

Cypress.Commands.add('clickAccionTabla', (rowIndex, nombreAccion) =>
  cy
    .get(`[row-index="${rowIndex}"] [data-testid="MenuItem"]`)
    .click()
    .findActiveMenu()
    .within(() => cy.findByText(nombreAccion))
    .click()
);

/* formularios */
/* Parámetros de opciones `{ force: true }` usados porque los elementos más
anidados creados con vuetify no visibles, usualmente son cubiertos por divs
para aplicar estilos. */

Cypress.Commands.add('findAndType', (testId, text) =>
  cy.findByTestId(testId).type(text, { force: true })
);

Cypress.Commands.add('findAndSelect', (testId, optionToSelect) =>
  cy
    .findByTestId(testId)
    .click({ force: true })
    .findActiveMenu()
    .within(() => cy.findByText(optionToSelect))
    .click()
);

/**
 * Asume que la función `within` realiza operaciones que gatillan el cerrado
 * del datepicker.
 */
Cypress.Commands.add('openDatepicker', (testId, within) => {
  /* Asegurar que ningún modal de datepicker se encuentre visible para evitar
   * interactuar con ellos */
  cy.get('.v-picker--date').each(x =>
    cy
      .get(x)
      .parent()
      .should('not.be.visible')
  );
  cy.findByTestId(testId)
    .click({ force: true })
    .get('.v-date-picker-table--date:visible')
    .within(within);
});

Cypress.Commands.add('assertSelectText', (testId, text) => {
  cy.findByTestId(testId)
    .siblings()
    .should('have.text', text);
});
