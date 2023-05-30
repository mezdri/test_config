export interface IDatosSertecDropdown {
  DDEstado: string[];
  DDTipoSoporte: string[];
  DDMotivoRehazo: string[];
  DDTransportistas: string[];
  DDPlanta: string[];
  DDProducto: string[];
}

export class DatosSertecDropdown {
  datos: IDatosSertecDropdown;

  constructor() {
    this.datos = {
      DDEstado: ['EN ESPERA', 'REALIZADO', 'CANCELADO'],
      DDTipoSoporte: ['REVISION EQUIPO', 'REINSTALACION', 'DESINSTALACION'],
      DDMotivoRehazo: ['EN ESPERA', 'SIN RECHAZO', 'RECHAZADO'],
      DDTransportistas: [
        'TAD SPA',
        'TRANSPORTES BENUMAPU LTDA',
        'TRANSPORTES BRETTI LTDA.',
        'TRANSPORTES CASABLANCA S.A.',
        'ZENON MACIAS Y CIA LTDA',
        'TRANSPORTES SANTA MARÍA S.A',
      ],
      DDPlanta: [
        'BARQUITO',
        'CHACABUCO',
        'CONCON',
        'GUAYACAN',
        'IQUIQUE',
        'MAIPU',
        'MEJILLONES',
        'PUNTA ARENAS',
        'PUREO',
        'SAN VICENTE',
      ],
      DDProducto: [
        'CAMARA',
        'DVR',
        'GPS',
        'MNAV',
        'MOBILEYE',
        'SELLOS',
        'VOX100',
        'PULSADOR EVENTOS',
        'RIZO CAMARA',
        'RIZO SELLOS',
        'AGORABEE',
        'DASHBOARD',
        'DIRECTOR',
        'HERO',
        'CABLES',
        'OTROS',
      ],
    };
  }
}
