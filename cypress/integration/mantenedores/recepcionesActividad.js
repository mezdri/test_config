import getRecepciones, {
  makeGetRecepciones,
} from '../../support/server/responses/getRecepciones';
import { describeBlockNames } from './utils';

describe('Mantenedor recepción de actividades', () => {
  const visit = () => cy.visit('/recepcion-de-actividades');

  beforeEach(() => {
    cy.setup().login();
  });

  describe(describeBlockNames.crear, () => {
    it.only('permite crear nueva recepción de actividades', () => {
      visit();
      const prependTestId = 'CrearRecepcionActividadModal--';

      cy.route({
        status: 200,
        method: 'GET',
        url: '/servicios-integracion/api/integracion/recepciones',
        response: makeGetRecepciones(getRecepciones.length + 1),
      });
      cy.findByTestId('CrearButton')
        .click()
        .findAndSelect(`${prependTestId}proveedor-gps`, /proveedor gps 1/i)
        .findAndSelect(
          `${prependTestId}cliente-proveedor-gps`,
          /cliente proveedor gps 1/i
        )
        .findAndType(`${prependTestId}usuario`, 'user')
        .findAndType(`${prependTestId}contrasena`, 'password')
        .openDatepicker(`${prependTestId}fecha-inicio`, () =>
          cy.findByText('15').click()
        )
        .openDatepicker(`${prependTestId}fecha-termino`, () =>
          cy.findByText('20').click()
        )
        .findAndType(`${prependTestId}intervalo-transmiciones`, '10')
        .findAndType(`${prependTestId}cantidadActividadesBloque`, '5')
        .findByTestId('ContinuarButton')
        .click()
        .findByTestId('GuardarButton')
        .click()
        .assertTableRowsLength(
          'RecepcionesActividad__Grid',
          getRecepciones.length + 1
        );
    });
  });
  describe(describeBlockNames.consultar, () => {
    it('despliega lista de recepciones', () => {
      visit();
      cy.assertTableRowsLength(
        'RecepcionesActividad__Grid',
        getRecepciones.length
      );
    });

    it('reporta error al intentar obtener la lista de recepciones', () => {
      cy.route({
        status: 500,
        method: 'GET',
        url: '/servicios-integracion/api/integracion/recepciones',
        response: {},
      });
      visit();
      cy.assertErrorToast(
        'Ha ocurrido un problema al intentar obtener las recepciones de actividad.'
      );
    });

    it('permite consultar detalle de una fila', () => {
      visit();
      cy.get(`[row-index="${1}"] [col-id="proveedor.nombre"]`)
        // TODO reemplazar por obtención del proveedor desde la solicitud http
        .invoke('text')
        .then(proveedor => {
          cy.clickAccionTabla(3, /ver detalle/i).assertSelectText(
            'VerDetalleRecepcionActividadModal--proveedor-gps',
            proveedor
          );
        });
    });
  });
  describe(describeBlockNames.actualizar, () => {});
  describe(describeBlockNames.eliminar, () => {
    it('permite eliminar una recepción de actividad', () => {
      visit();
      // TODO obtener id, no usar valor en duro
      cy.clickAccionTabla(3, /eliminar/i)
        .findByTestId('ConfirmacionEliminar--container')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click()
        .get('@recepcionActividad-delete')
        .should(xhr => expect(xhr.request.body.id).to.equal(3));
    });
  });
});
