import getTiposContacto from '../../support/server/responses/getTiposContacto';
import { describeBlockNames } from './utils';

describe('Mantenedor Tipo Contactos', () => {
  const visit = () => cy.visit('/tipo-de-contacto');

  beforeEach(() => {
    cy.setup().login();
  });

  describe(describeBlockNames.crear, () => {});

  describe(describeBlockNames.consultar, () => {
    it.only('despliega lista de contactos', () => {
      visit();
      cy.assertTableRowsLength('TipoContacto__Grid', getTiposContacto.length);
    });

    it('reporta error al intentar obtener la lista de contactos', () => {
      cy.route({
        status: 500,
        method: 'POST',
        url: '/servicio-contacto/api/TipoContactos/grid2',
        response: {},
      });
      visit();
      cy.assertErrorToast(
        'Ha ocurrido un error al intentar obtener la lista de contactos'
      );
    });
  });
  describe(describeBlockNames.actualizar, () => {});
  describe(describeBlockNames.eliminar, () => {});
});
