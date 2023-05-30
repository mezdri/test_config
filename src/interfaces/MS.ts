export interface MSResponse<T> {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  data?: T[];
}
