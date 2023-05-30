export const usuario = {
  nombre: 'Cypress',
  email: 'usuario@example.com',
  apellidoPaterno: 'Apellido1',
  apellidoMaterno: 'Apellido2',
};

export default {
  id: 5,
  nombre: usuario.nombre,
  email: usuario.email,
  estado: 1,
  apellidos: `${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
  emailConfirmado: false,
  numMaxIntentos: 3,
  caducidad: '1.00:00:00',
};
