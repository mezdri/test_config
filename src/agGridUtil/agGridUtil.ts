import { GridApi, ColumnApi } from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { EstadoGrilla } from '@/agGridUtil/EstadoGrilla';

export class AgGridUtil {
  private _estadoGrilla: EstadoGrilla;
  controller: string = 'EstadoGrilla';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  constructor(
    private gridApi: GridApi,
    private columnApi: ColumnApi,
    public estadoGrillaVm: EstadoGrillaVm
  ) {}

  recuperarEstadoGrilla() {
    return this.axios.http
      .get<EstadoGrillaVm>(
        `${this.controller}/${this.estadoGrillaVm.usuarioId}/${this.estadoGrillaVm.funcionalidades}`
      )
      .then(response => {
        if (
          response.data !== undefined &&
          response.data !== null &&
          <any>response.data !== ''
        ) {
          this.estadoGrillaVm = response.data;
          const estadoGrilla: EstadoGrilla = JSON.parse(
            this.estadoGrillaVm.grilla
          );
          this.estadoGrilla = estadoGrilla;
          return estadoGrilla;
        }
      });
  }

  get estadoGrilla(): EstadoGrilla {
    this._estadoGrilla = {
      estadoColumna: this.columnApi.getColumnState(),
      estadoGrupo: this.columnApi.getColumnGroupState(),
      estadoOrden: this.gridApi.getSortModel(),
      estadoFiltro: this.gridApi.getFilterModel(),
    };

    return this._estadoGrilla;
  }

  set estadoGrilla(estadoGrilla: EstadoGrilla) {
    this._estadoGrilla = estadoGrilla;

    this.columnApi.setColumnState(estadoGrilla.estadoColumna);
    this.columnApi.setColumnGroupState(estadoGrilla.estadoGrupo);
    this.gridApi.setSortModel(estadoGrilla.estadoOrden);
    this.gridApi.setFilterModel(estadoGrilla.estadoFiltro);
  }

  guardarEstadoGrilla(): Promise<any> {
    this.estadoGrillaVm.grilla = JSON.stringify(this.estadoGrilla);

    if (this.estadoGrillaVm.id > 0) {
      return this.axios.http
        .put<EstadoGrillaVm>(this.controller, this.estadoGrillaVm, {
          responseType: 'json',
        })
        .then(response => {
          this.estadoGrillaVm = response.data;
          //this.estadoGrilla = JSON.parse(this.estadoGrillaVm.grilla);
        });
    } else {
      return this.axios.http
        .post<EstadoGrillaVm>(this.controller, this.estadoGrillaVm, {
          responseType: 'json',
        })
        .then(response => {
          this.estadoGrillaVm = response.data;
          //this.estadoGrilla = JSON.parse(this.estadoGrillaVm.grilla);
        });
    }
  }
}
