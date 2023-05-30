const addCeroStart = (numero: number): string => {
  return numero < 10 ? `0${numero}` : `${numero}`;
};

export const getDate = (): string => {
  const fecha = new Date();
  const dia = addCeroStart(fecha.getDate());
  const mes = addCeroStart(fecha.getMonth() + 1);
  const anio = fecha.getFullYear();
  const hora = addCeroStart(fecha.getHours());
  const minutos = addCeroStart(fecha.getMinutes());
  const segundos = addCeroStart(fecha.getSeconds());
  const fechaYHora = `${anio}/${mes}/${dia} ${hora}:${minutos}:${segundos}`;
  return fechaYHora;
};
