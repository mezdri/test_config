import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { EstadoUiVm } from './EstadoUiVm';

export class EstadoUiUtil {
  readonly controller: string = 'EstadoUi';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  estadoUiVm: EstadoUiVm = new EstadoUiVm();

  recuperarEstado(): Promise<void> {
    const url: string = `${this.controller}/`;

    return this.axios.http
      .get<any>(url, { params: this.estadoUiVm })
      .then(response => {
        if (
          response.data !== undefined &&
          response.data !== null &&
          <any>response.data !== ''
        ) {
          this.estadoUiVm = response.data;

          if (
            response.data.objeto !== undefined &&
            response.data.objeto !== null
          ) {
            this.estadoUiVm.objeto = JSON.parse(response.data.objeto);
          } else {
            this.estadoUiVm.objeto = {
              coordenadas: {
                lat: -33.4372,
                lng: -70.6506,
              },
              zoom: 13,
              filtro: 0,
              elementosSeleccionados: [],
              primerInicio: true,
              unidadSeleccionada: '',
              grupoZonas: [],
            };
          }
        }
      });
  }

  guardarEstado(): Promise<any> {
    if (this.estadoUiVm.id > 0) {
      return this.axios.http
        .put<EstadoUiVm>(this.controller, this.estadoUiVm, {
          responseType: 'json',
        })
        .then(response => {
          this.estadoUiVm = response.data;
          this.estadoUiVm.objeto = JSON.parse(response.data.objeto);
        });
    } else {
      return this.axios.http
        .post<EstadoUiVm>(this.controller, this.estadoUiVm, {
          responseType: 'json',
        })
        .then(response => {
          this.estadoUiVm = response.data;
          this.estadoUiVm.objeto = JSON.parse(response.data.objeto);
        });
    }
  }
}
