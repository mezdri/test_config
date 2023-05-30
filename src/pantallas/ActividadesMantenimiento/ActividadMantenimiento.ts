export type ActividadMantenimiento = {
  id: number;
  nombreActividad: string;
  descripcion: string;
  activo: number;
  estado: number;
};

export type PautaActividadesMantenimiento = {
  id: number;
  nombre: string;
  tipoActividadMant: number;
};
