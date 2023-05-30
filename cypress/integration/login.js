import { usuario } from '../support/server/responses/getUsuario';

describe('Inicio de sesión', () => {
  const ingresarEmail = () =>
    cy
      .findByTestId('Login__v-text-field--email')
      .type(usuario.email)
      .findByTestId('Login__continuar')
      .click();

  const ingresarContrasegna = () =>
    cy
      .findByTestId('Login__v-text-field--password')
      .type('Password.123')
      .findByTestId('Login__login')
      .click();

  beforeEach(() => {
    cy.setup().visit('/login');
  });

  it('Inicia sesión exitosamente', () => {
    ingresarEmail()
      .findByText(
        [usuario.nombre, usuario.apellidoPaterno, usuario.apellidoMaterno].join(
          ' '
        )
      )
      .should('exist', 'Nombre de usuario no mostrado');

    ingresarContrasegna()
      .findByTestId('SideBar__v-btn--usuario')
      .should('contain', [usuario.nombre, usuario.apellidoPaterno].join(' '));
  });

  it('Muestra error al fallar inicio de sesión', () => {
    cy.route({
      status: 500,
      method: 'POST',
      // TODO centralizar URIs api
      url: '/servicios-auth/api/Cuenta/login',
      response: {},
    });
    ingresarEmail();
    ingresarContrasegna();
    cy.assertErrorToast('Inicio de sesión incorrecto. Compruebe contraseña');
  });

  it('Redirige usuarios no autenticados a la página de inicio de sesión', () => {
    cy.visit('/')
      .url()
      .should('eq', `${Cypress.config().baseUrl}/login`);
  });
});
