import getDescargas, {
  makeGetDescargas,
} from '../../support/server/responses/getDescargasActividad';
import { describeBlockNames } from './utils';

describe('Mantenedor descargas de actividades', () => {
  const visit = () => cy.visit('/servicio-de-descarga');
  const testIds = {
    tablaDescargasActividad: 'DescargasActividad__Grid',
  };

  beforeEach(() => {
    cy.setup().login();
  });

  describe(describeBlockNames.crear, () => {
    it('permite crear nueva descarga de actividad', () => {
      visit();
      const prependTestId = 'CrearDescargaActividadModal--';

      cy.route({
        status: 200,
        method: 'GET',
        url: '/servicios-integracion/api/integracion/descarga',
        response: makeGetDescargas(getDescargas.length + 1),
      });
      cy.findByTestId('CrearButton')
        .click()
        .findAndSelect(`${prependTestId}proveedor-gps`, /proveedor gps 1/i)
        .findAndSelect(
          `${prependTestId}cliente-proveedor-gps`,
          /cliente proveedor gps 1/i
        )
        .findAndType(`${prependTestId}usuario`, 'usuario')
        .findAndType(`${prependTestId}contrasena`, 'contrasena')
        .openDatepicker(`${prependTestId}fecha-inicio`, () =>
          cy.findByText('15').click()
        )
        .findAndType(`${prependTestId}hora-inicio`, '13:45')
        .findAndType(`${prependTestId}max-consultas-dia`, '3')
        .findAndType(`${prependTestId}max-consultas-hora`, '2')
        .findAndType(`${prependTestId}max-registros-bloque`, '1')
        .findByTestId('ContinuarButton')
        .click()
        .findByTestId('ContinuarButton')
        .click()
        .findByTestId('ContinuarButton')
        .click()
        .findByTestId('ContinuarButton')
        .click()
        .findByTestId('GuardarButton')
        .click()
        .assertTableRowsLength(
          testIds.tablaDescargasActividad,
          getDescargas.length + 1
        );
    });
  });
  describe(describeBlockNames.consultar, () => {
    it.skip('despliega lista de descargas', () => {
      visit();
      cy.assertTableRowsLength(
        testIds.tablaDescargasActividad,
        getDescargas.length
      );
    });

    it.skip('reporta error al intentar obtener la lista de recepciones', () => {
      cy.route({
        status: 500,
        method: 'GET',
        url: '/servicios-integracion/api/integracion/descarga',
        response: '',
      });
      visit();
      cy.assertErrorToast(
        'Ha ocurrido un problema al intentar obtener las descargas de actividad.'
      );
    });

    it('permite consultar detalle de una fila', () => {
      visit();
      cy.get(`[row-index="${1}"] [col-id="proveedor.nombre"]`)
        // TODO reemplazar por obtención del proveedor desde la solicitud http
        .invoke('text')
        .then(proveedor => {
          cy.clickAccionTabla(3, /ver detalle/i).assertSelectText(
            'VerDetalleDescargaActividadModal--proveedor-gps',
            proveedor
          );
        });
    });
  });
  describe(describeBlockNames.actualizar, () => {});
  describe(describeBlockNames.eliminar, () => {
    it('permite eliminar una descarga de actividad', () => {
      visit();
      // TODO obtener id, no usar valor en duro
      cy.clickAccionTabla(3, /eliminar/i)
        .findByTestId('ConfirmacionEliminar--container')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click()
        .get('@descargaActividad-delete')
        .should(xhr => expect(xhr.request.body.id).to.equal(3));
    });
  });
});
