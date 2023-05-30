describe('Busquedas en Google', () => {
  describe('Verifica que el titulo sea Google', function() {
    it('Abre la pagina inicial', function() {
      cy.visit('https://www.google.cl');
      cy.title().should('be', 'Google');
    });
  });
});
