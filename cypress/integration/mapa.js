import getGrillaVehiculos from '../support/server/responses/getGrillaVehiculos';

describe('Mapa', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;

  it('Permite entrar a detalle de vehículo desde info window', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);

    cy.setup()
      .login()
      .visit('/')
      .get(getMarkerSelector(vehiculo.id))
      .should('be.visible')
      .click()
      .findByTestId(`map__infoWindow-verDetalle--${vehiculo.id}`)
      .click()
      .findAllByTestId('ActividadDetalleVehiculo__layout');
  });
});
