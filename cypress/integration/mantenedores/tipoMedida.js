import getTipoMedida, {
  makeGetTipoMedida,
} from '../../support/server/responses/getTiposMedida';
import { describeBlockNames } from './utils';

describe('Mantenedor Tipo Medidas', () => {
  const visit = () => cy.visit('/tipo-de-medida');

  beforeEach(() => {
    cy.setup().login();
  });
  //TODO confirmar accion de guardado
  describe(describeBlockNames.crear, () => {
    it('permite crear nuevo tipo de medida', () => {
      visit();
      const prependTestId = 'CrearTipoMedidaModal--';

      cy.route({
        status: 200,
        method: 'GET',
        url: '/servicios-dispositivos/api/TipoMedida/grid2',
        response: makeGetTipoMedida(getTipoMedida.length + 1),
      });
      cy.findByTestId('CrearButton')
        .click()
        .findAndType(`${prependTestId}nombre`, 'nombre test')
        .findAndType(`${prependTestId}sigla`, 'ST')
        .findAndType(`${prependTestId}descripcion`, 'descripcion test')
        .findByTestId('GuardarButton')
        .click();
    });
  });

  describe(describeBlockNames.consultar, () => {
    it('despliega lista de tipos de medida', () => {
      visit();
      cy.assertTableRowsLength('TipoMedida__Grid', getTipoMedida.length);
    });

    it('reporta error al intentar obtener la lista de tipos de medida', () => {
      cy.route({
        status: 500,
        method: 'GET',
        url: '/servicios-dispositivos/api/tipomedida/grid2',
        response: {},
      });
      visit();
      cy.assertErrorToast(
        'Ha ocurrido un error al intentar obtener los tipos de medida. '
      );
    });
    it('permite consultar detalle de una fila', () => {
      visit();
      const rowIndex = 3;
      cy.get(`[row-index="${rowIndex}"] [col-id="nombre"]`)
        .invoke('text')
        .then(nombreMedida => {
          cy.clickAccionTabla(rowIndex, /ver detalle/i)
            .findByTestId('VerDetalleTipoMedidaModal--nombre')
            .should('have.value', nombreMedida);
        });
    });
  });
  //TODO confirmar accion de guardado
  describe(describeBlockNames.actualizar, () => {
    it('permite actualizar tipos de medida existentes', () => {
      visit();
      const prependTestId = 'EditarTipoMedidaModal--';
      const rowIndex = 3;
      cy.clickAccionTabla(rowIndex, /Editar/i)
        .findByTestId(`${prependTestId}nombre`)
        .clear()
        .findAndType(`${prependTestId}nombre`, 'nombre test editado')
        .findByTestId(`${prependTestId}descripcion`)
        .clear()
        .findAndType(`${prependTestId}descripcion`, 'descripcion test editado')
        .findByTestId('GuardarButton')
        .click();
    });
  });
  //TODO confirmar accion de eliminado
  describe(describeBlockNames.eliminar, () => {
    it('permite eliminar un tipo de medida', () => {
      visit();
      const rowIndex = 3;
      cy.clickAccionTabla(rowIndex, /eliminar/i);
    });
  });
});
