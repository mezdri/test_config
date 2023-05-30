import getPautasActividades from '../../support/server/responses/getPautasActividades';
import { describeBlockNames } from './utils';

describe.skip('Mantenedor de Pautas de Actividades', () => {
  const visit = () => cy.visit('/pautas-de-actividades');

  beforeEach(() => {
    cy.setup().login();
  });

  describe(describeBlockNames.crear, () => {
    it('permite crear nueva pauta de Actividad', () => {
      visit();
      cy.findByTestId('CrearButton')
        .click()
        .findByTestId('FormInputCrear--codigo-proveedor')
        .type('cod1234')
        .findByTestId('ContinuarButton')
        .click()
        .findByTestId('GuardarButton')
        .click()
        .assertTableRowsLength(getPautasActividades.length + 1);
    });
  });
  describe(describeBlockNames.consultar, () => {
    it('despliega lista de recepciones', () => {
      visit();
      cy.assertTableRowsLength(getPautasActividades.length);
    });

    it('reporta error al intentar obtener la lista de recepciones', () => {
      cy.route({
        status: 500,
        method: 'POST',
        url: '/servicios-clientes/api/recepciones',
        response: {},
      });
      visit();
      cy.assertErrorToast(
        'Ha ocurrido un error al intentar obtener recepciones asociados a su usuario'
      );
    });
  });
  describe(describeBlockNames.actualizar, () => {});
  describe(describeBlockNames.eliminar, () => {});
});
