import getGrillaVehiculos from '../support/server/responses/getGrillaVehiculos';

describe('859 - Ver Detalle - Repetir Día', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Visualiza las ultimas actividades sin estar Repetir dia Activo', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);

    cy.setup()
      .login()
      .visit('/')
      .get(getMarkerSelector(vehiculo.id))
      .click();
    cy.get('.v-card__title > .v-btn > .v-btn__content')
      .click()
      .should('be.visible')
      .click()
      .findByTestId('ver_detalle_test')
      .click();
  });
});

describe('860 - Ver Detalle - Repetir Día', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Verifi que no se quede pegado al cambiar filtro de fechas', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);
    cy.setup()
      .login()
      .visit('/')
      .get(getMarkerSelector(vehiculo.id))
      .click();
    cy.get('.v-card__title > .v-btn > .v-btn__content')
      .click()
      .should('be.visible')
      .click();
    cy.get('body');
    cy.get(
      '#divRepetirDia2 > div > div > div:nth-child(1) > div > div > ' +
        'div.v-input__slot > div > input[type=checkbox]'
    )
      .check({
        force: true,
      })
      .should('be.checked');

    cy.get('[aria-label="Hasta"]')
      .first()
      .click({
        force: true,
      });
    cy.get(
      '[title="Fecha Hasta"] .v-picker__body.theme--light > div > div.v-date-picker-table.v-date-picker-table--date.theme--light > table > tbody > tr:nth-child(5) > td:nth-child(4)'
    ).click();

    cy.get('[aria-label="Desde"]')
      .first()
      .click({
        force: true,
      });
    cy.get(
      '[title="Fecha Desde"] .v-picker__body.theme--light > div > div.v-date-picker-table.v-date-picker-table--date.theme--light > table > tbody > tr:nth-child(2) > td:nth-child(3)'
    ).click();
    cy.get(
      '[title="Fecha Hasta"] .v-picker__body.theme--light > div > div.v-date-picker-table.v-date-picker-table--date.theme--light > table > tbody > tr:nth-child(3) > td:nth-child(4)'
    ).click();
  });
});

describe('858 - Ver Detalle - Repetir día', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Verifica que el valor de ultima actividad sea igual al valor de la ultima actividad que se lista', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);
    cy.setup()
      .login()
      .visit('/')
      .get(getMarkerSelector(vehiculo.id))
      .click();
    cy.get('.v-card__title > .v-btn > .v-btn__content')
      .click()
      .should('be.visible')
      .click({
        force: true,
      });
    cy.get('body');
    cy.get('[title="Repetir día"]');

    cy.get('[data-testid="ultima_transmision"]').then($input => {
      var valor = $input.val();
      expect($input.val()).to.eq('22/05/2019 23:58:34');
      cy.log('valor:' + valor);
      console.log('valor:' + valor);
    });
  });
});

describe('832 - Repetir día - Tooltips', () => {
  const getMarkerSelector = vehiculoId => `[title="${vehiculoId}"]`;
  it('Si la actividad tiene nombre de conductor, en el tooltips se deben desplegar el nombre, como en otros casos que ya se despliega', () => {
    const vehiculo = getGrillaVehiculos.vehiculos.find(x => x.id === 17731);

    cy.setup()
      .login()
      .visit('/');
    cy.get(getMarkerSelector(vehiculo.id)).click();
    cy.get('#vvvTable17731').contains('Alan Brito');
  });
});
