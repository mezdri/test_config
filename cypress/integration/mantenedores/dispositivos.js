import { describeBlockNames } from './utils';
import getDispositivos, {
  makeGetDispositivos,
} from '../../support/server/responses/getDispositivos';

describe('Mantenedor Dispositivos', () => {
  const visit = () => cy.visit('/dispositivos');

  beforeEach(() => {
    cy.setup().login();
  });
  //TODO confirmar guardado
  describe(describeBlockNames.crear, () => {
    it('permite crear nuevo dipositivo sin dato extendido', () => {
      visit();
      const prependTestId = 'CrearDispositivoModal--';

      cy.route({
        status: 200,
        method: 'GET',
        url: '/servicios-dispositivos/api/dispositivo/grid2',
        response: makeGetDispositivos(getDispositivos.length + 1),
      });
      cy.findByTestId('CrearButton')
        .click()
        .findAndType(`${prependTestId}codigo`, '123')
        .findAndType(`${prependTestId}nombre`, 'nombre')
        .findAndType(`${prependTestId}descripcion`, 'descripcion prueba')
        .findAndSelect(
          `${prependTestId}tipoDispositivoId`,
          /tipo Dispositivo 1/i
        )
        .findAndSelect(`${prependTestId}isGps`, /No/)
        .findByTestId('GuardarButton')
        .click()
        .findByTestId('CrearDispositivo')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click()
        .assertTableRowsLength(
          'Dispositivos__Grid',
          getDispositivos.length + 1
        );
    });
    it('permite crear nuevo dispositivo con dato extendido', () => {
      visit();
      const prependTestId = 'CrearDispositivoModal--';
      const prependTestDato = 'CrearDatoExtendidoModal--';

      cy.route({
        status: 200,
        method: 'GET',
        url: '/servicios-dispositivos/api/dispositivo/grid2',
        response: makeGetDispositivos(getDispositivos.length + 1),
      });
      cy.findByTestId('CrearButton')
        .click()
        .findAndType(`${prependTestId}codigo`, '123')
        .findAndType(`${prependTestId}nombre`, 'nombre')
        .findAndType(`${prependTestId}descripcion`, 'descripcion prueba')
        .findAndSelect(
          `${prependTestId}tipoDispositivoId`,
          /tipo Dispositivo 1/i
        )
        .findAndSelect(`${prependTestId}isGps`, /No/)
        .findByText('Datos Extendidos')
        .click()
        .findByText('Agregar')
        .click()
        .findAndType(`${prependTestDato}trama`, 'Trama')
        .findAndType(`${prependTestDato}posicion`, '123')
        .findAndType(`${prependTestDato}nombre`, 'NombreDatoExtendido')
        .findAndSelect(`${prependTestDato}tipoMedida`, /Tipo Medida 2/i)
        .findAndType(
          `${prependTestDato}descripcion`,
          'Descripcion dato extendido'
        )
        .findAndType(`${prependTestDato}link`, 'Link dato extendido')
        .findByTestId('GuardarDato')
        .click()
        .findByTestId('ConfirmacionGuardarDato')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click()
        .findByTestId('GuardarButton')
        .click()
        .findByTestId('CrearDispositivo')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click()
        .assertTableRowsLength(
          'Dispositivos__Grid',
          getDispositivos.length + 1
        );
    });
  });
  describe(describeBlockNames.consultar, () => {
    it('despliega lista de dispositivos', () => {
      visit();
      cy.assertTableRowsLength('Dispositivos__Grid', getDispositivos.length);
    });

    it('Reporta error al intentar obtener la lista de dispositivos', () => {
      cy.route({
        status: 500,
        method: 'GET',
        url: '/servicios-dispositivos/api/dispositivo/grid2',
        response: {},
      });
      visit();
      cy.assertErrorToast(
        'Ha ocurrido un problema al intentar obtener los dispositivos.'
      );
    });
    it('permite consultar detalle de dispositivo sin dato extendido', () => {
      visit();
      const rowIndex = 1;
      cy.get(`[row-index="${rowIndex}"] [col-id="nombre"]`)
        .invoke('text')
        .then(nombreDispositivo => {
          cy.clickAccionTabla(rowIndex, /ver detalle/i)
            .findByTestId('VerDetalleDispositivoModal--nombre')
            .should('have.value', nombreDispositivo);
        });
    });
    it('permite consultar detalle de dispositivo con dato extendido', () => {
      visit();
      const rowIndex = 4;
      cy.get(`[row-index="${rowIndex}"] [col-id="nombre"]`)
        .invoke('text')
        .then(nombreDispositivo => {
          cy.clickAccionTabla(rowIndex, /ver detalle/i)
            .findByTestId('VerDetalleDispositivoModal--nombre')
            .should('have.value', nombreDispositivo)
            .findByText('Datos Extendidos')
            .click();
        });
    });
  });
  //TODO confirmar accion de guardado
  describe(describeBlockNames.actualizar, () => {
    it('permite actualizar dispositivos sin datos extendidos existentes', () => {
      visit();
      const prependTestId = 'EditarDispositivoModal--';
      const rowIndex = 3;
      cy.clickAccionTabla(rowIndex, /Editar/i)
        .findByTestId(`${prependTestId}nombre`)
        .clear()
        .findAndType(`${prependTestId}nombre`, 'nombre editado')
        .findByTestId(`${prependTestId}descripcion`)
        .clear()
        .findAndType(
          `${prependTestId}descripcion`,
          'descripcion prueba editada'
        )
        .findAndSelect(
          `${prependTestId}tipoDispositivoId`,
          /tipo Dispositivo 3/i
        )
        .findAndSelect(`${prependTestId}isGps`, /Si/)
        .findByTestId('GuardarButton')
        .click()
        .findByTestId('EditarDispositivo')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click();
    });
    it('permite actualizar dispositivo con datos extendidos existentes', () => {
      visit();
      const prependTestId = 'EditarDispositivoModal--';
      const prependTestDato = 'CrearDatoExtendidoModal--';
      const rowIndex = 4;
      const rowDato = 2;
      cy.clickAccionTabla(rowIndex, /Editar/i)
        .findByTestId(`${prependTestId}nombre`)
        .clear()
        .findAndType(`${prependTestId}nombre`, 'nombre editado')
        .findByTestId(`${prependTestId}descripcion`)
        .clear()
        .findAndType(
          `${prependTestId}descripcion`,
          'descripcion prueba editada'
        )
        .findAndSelect(
          `${prependTestId}tipoDispositivoId`,
          /tipo Dispositivo 3/i
        )
        .findAndSelect(`${prependTestId}isGps`, /No/)
        .findByText('Datos Extendidos')
        .click()
        .findByText('Agregar')
        .click()
        .findAndType(`${prependTestDato}trama`, 'Trama')
        .findAndType(`${prependTestDato}posicion`, '123')
        .findAndType(`${prependTestDato}nombre`, 'NombreDatoExtendido')
        .findAndSelect(`${prependTestDato}tipoMedida`, /Tipo Medida 2/i)
        .findAndType(
          `${prependTestDato}descripcion`,
          'Descripcion dato extendido'
        )
        .findAndType(`${prependTestDato}link`, 'Link dato extendido')
        .findByTestId('GuardarDato')
        .click()
        .findByTestId('ConfirmacionGuardarDato')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click()
        .findByTestId('GuardarButton')
        .click()
        .findByTestId('EditarDispositivo')
        .within(() => cy.findByTestId('v-btn--aceptar'))
        .click();
    });
  });
  describe(describeBlockNames.eliminar, () => {
    it('permite eliminar un dato extendido de dispositivo', () => {
      visit();
      const rowIndex = 4;
      cy.clickAccionTabla(rowIndex, /Editar/i)
        .findByText('Datos Extendidos')
        .click();
      //TODO acceder menu acciones para eliminar dato extendido
    });
  });
});
