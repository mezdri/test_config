describe('Página de inicio', () => {
  beforeEach(function() {
    cy.setup().login();
  });

  it('Notifica fallos en solicitudes http al backend', () => {
    cy.route({
      status: 500,
      method: 'POST',
      // TODO centralizar URIs api
      url: '/servicios-vehiculos/api/Vehiculo/grillaVehiculos',
      response: {},
    });
    cy.route({
      status: 500,
      method: 'GET',
      // TODO centralizar URIs api
      url: '/servicios-usuarios/api/ParametroSistema/sistema',
      response: {},
    });

    cy.visit('/')
      .assertErrorToast(
        'Ha ocurrido un error al intentar obtener vehículos asociados a la flota.'
      )
      .assertWarningToast(
        'Ha ocurrido un error al intentar obtener parámetros de sistema. Usando valores por omisión.'
      );
  });
});
