import getGrillaVehiculos from '../support/server/responses/getGrillaVehiculos';

describe('849 - Home - Grilla vehículo/ Grilla Actividades', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Visualiza las ultimas actividades sin estar Repetir dia Activo', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);
    cy.setup()
      .login()
      .visit('/')
      .get(getMarkerSelector(vehiculo.id))
      .click();
    cy.get('[style="font-weight: bold;font-size:13px"]').contains('Alan Brito');
  });
});

describe('820 - Home - Mapa (herramienta de gestión (9 puntitos)', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('En todos los navegadores (acordados), y mapas, debe aparecer herramienta de gestión (9 puntitos)', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 3939);

    cy.setup()
      .login()
      .visit('/');
    cy.get(
      '#xxxHome > .v-menu > .v-menu__activator > .v-btn > .v-btn__content > .v-icon'
    )
      .click()
      .should('be.visible');
  });
});

describe('765 - Home - Mapa', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Mapa Muestra color en verde de los vehiculos en Linea', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);

    cy.setup()
      .login()
      .visit('/');
    cy.get('#app')
      .find('img[src^="/img/pin-green.bf28c051.png"]')
      .should('be.visible');
  });
});

describe('807 - Home - Grilla Vehículos [Mac - Intermitencia grilla vehículo]', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Visualiza en verde los vehiculos en Linea', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17988);

    cy.setup()
      .login()
      .visit('/');
    cy.get('#app').find('img[src^="/img/pin-green.bf28c051.png"]');
  });
});

describe('768 - Home - Filtros', () => {
  it('Visualiza que este visible la flecha de selección de clientes', () => {
    cy.setup()
      .login()
      .visit('/');
    cy.get(
      '.lg4 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > i:nth-child(1)'
    )
      .should('be.visible')
      .get(
        '#app > div.application--wrap > div:nth-child(2) > div:nth-child(2) > nav > div > div.flex.xs6.sm6.lg4.d-flex > div > div > div.v-input__slot > div.v-select__slot > div.v-input__append-inner > div > i'
      )
      .click()
      .get(
        '.v-menu__content--fixed > .v-select-list > .v-list > :nth-child(2) > .v-list__tile > .v-list__tile__content > .v-list__tile__title'
      )
      .click();
    cy.get(
      '.lg4 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > i:nth-child(1)'
    ).should('have.class', 'dark--text');
  });
});

describe('778 - Home - Grilla Actividades [Actualización en Safari]', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('En todos los navegadores la información debe estar actualizada', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);

    cy.setup()
      .login()
      .visit('/');
    cy.get(getMarkerSelector(vehiculo.id)).click();
    cy.get('[title="En Línea"] > .material-icons').should('be.visible');
  });
});

describe('841 - Home - Mapa', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Visualiza que al hacer Zoom en el mapa y seleccionar un vehiculo el zoom no se pierde', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);

    cy.setup()
      .login()
      .visit('/');
    cy.get('[title="Ampliar"]')
      .should('be.visible')
      .dblclick()
      .wait(5000)
      .dblclick()
      .click()
      .click()
      .click();
    cy.get(getMarkerSelector(vehiculo.id))
      .click()
      .should('be.visible');
  });
});

describe('767 - Home - Grilla Actividades', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Columna "Horas Motor" debe ser "Horas de Motor"', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);
    cy.setup()
      .login()
      .visit('/');
    cy.get('[data-testid="test__unidad"]')
      .should('be.visible')
      .click()
      .contains('KJXK21');
    cy.get(
      '#grillaId > div > div > div.ag-root-wrapper-body.ag-layout-normal > div.ag-root.ag-unselectable.ag-layout-normal > div.ag-header.ag-pivot-off > div.ag-header-viewport > div > div > div:nth-child(1) > div.ag-cell-label-container.ag-header-cell-sorted-none > span > span'
    ).click();
    cy.get(
      '#grillaId > div > div > div.ag-theme-material > div > div > div.ag-tab-header > span:nth-child(2) > span'
    )
      .click()
      .get(
        '#grillaId > div > div > div.ag-theme-material > div > div > div.ag-tab-body > div > div > div.ag-primary-cols-list-panel'
      )
      .scrollTo('bottom')
      .contains('Horas de Motor');
  });
});

describe('806 - Track 3.0 - Track 3.0 (Mac - Browser)', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Barra scroll horizontal se debe visualizar en grillas de plataforma (si aplica)', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 3939);

    cy.setup()
      .login()
      .visit('/');
    cy.scrollTo('bottom');
  });
});
