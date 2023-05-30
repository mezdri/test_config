import getContactos from '../support/server/responses/getContactos';

describe('contactos', () => {
  it('despliega lista de contactos', () => {
    cy.viewport('macbook-15')
      .setup()
      .login()
      .visit('/contactos')
      // Filas de tabla ag-grid
      .get('.ag-center-cols-container > [role="row"]')
      .should('have.length', getContactos.contactos.length);
  });
});
