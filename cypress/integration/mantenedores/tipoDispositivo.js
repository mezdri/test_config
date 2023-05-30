import getTipoDispositivo, {
  makeGetTipoDispositivo,
} from '../../support/server/responses/getTipoDispositivos';
import { describeBlockNames } from './utils';

describe('Mantenedor Tipo Dispositivos', () => {
  const visit = () => cy.visit('/tipo-de-dispositivo');

  beforeEach(() => {
    cy.setup().login();
  });
  //TODO confirmar accion de guardado
  describe(describeBlockNames.crear, () => {
    it('permite crear nuevo tipo de dispositivo', () => {
      visit();
      const prependTestId = 'CrearTipoDispositivoModal--';

      cy.route({
        status: 200,
        method: 'GET',
        url: '/servicios-dispositivos/api/TipoDispositivo/grid2',
        response: makeGetTipoDispositivo(getTipoDispositivo.length + 1),
      });
      cy.findByTestId('CrearButton')
        .click()
        .findAndType(`${prependTestId}nombre`, 'nombre test')
        .findAndType(`${prependTestId}marca`, 'ST')
        .findAndType(`${prependTestId}modelo`, 'modelo test')
        .findAndType(`${prependTestId}descripcion`, 'descripcion test')
        .findByTestId('GuardarButton')
        .click();
    });
  });

  describe(describeBlockNames.consultar, () => {
    it('despliega lista de tipos de dispositivo', () => {
      visit();
      cy.assertTableRowsLength(
        'TipoDispositivo__Grid',
        getTipoDispositivo.length
      );
    });

    it('reporta error al intentar obtener la lista de tipos de dispositivos', () => {
      cy.route({
        status: 500,
        method: 'GET',
        url: '/servicios-dispositivos/api/TipoDispositivo/grid2',
        response: {},
      });
      visit();
      cy.assertErrorToast(
        'Ha ocurrido un error al intentar obtener los tipos de dispositivos. '
      );
    });
    it('permite consultar detalle de una fila', () => {
      visit();
      const rowIndex = 3;
      cy.get(`[row-index="${rowIndex}"] [col-id="nombre"]`)
        .invoke('text')
        .then(nombreDispositivo => {
          cy.clickAccionTabla(rowIndex, /ver detalle/i)
            .findByTestId('VerDetalleTipoDispositivoModal--nombre')
            .should('have.value', nombreDispositivo);
        });
    });
  });
  //TODO confirmar accion de guardado
  describe(describeBlockNames.actualizar, () => {
    it('permite actualizar tipos de dispositivo existentes', () => {
      visit();
      const prependTestId = 'EditarTipoDispositivoModal--';
      const rowIndex = 3;
      cy.clickAccionTabla(rowIndex, /Editar/i)
        .findByTestId(`${prependTestId}marca`)
        .clear()
        .findAndType(`${prependTestId}marca`, 'marca test editado')
        .findByTestId(`${prependTestId}modelo`)
        .clear()
        .findAndType(`${prependTestId}modelo`, 'modelo test editado')
        .findByTestId(`${prependTestId}descripcion`)
        .clear()
        .findAndType(`${prependTestId}descripcion`, 'descripcion test editado')
        .findByTestId('GuardarButton')
        .click();
    });
  });
  //TODO confirmar accion de eliminado
  describe(describeBlockNames.eliminar, () => {
    it('permite eliminar un tipo de dispositivo', () => {
      visit();
      const rowIndex = 3;
      cy.clickAccionTabla(rowIndex, /eliminar/i);
    });
  });
});
