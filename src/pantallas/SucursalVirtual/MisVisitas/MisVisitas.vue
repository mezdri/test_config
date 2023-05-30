<template>
  <div class="mis-visitas">
    <WidgetUser />
    <v-flex sm12 md12 layout wrap>
      <FiltrosBusqueda
        :defaultEstado="defaultEstado"
        :rutClienteDefecto="rutClienteDefecto"
        :listaEmpresas="listaEmpresas"
        :listaEstados="listaEstados"
        :listaPatentes="listaPatentes"
        @resultadoBusqueda="filtroVisitas"
        @clear="VisitaInicial"
      />
      <v-flex
        v-if="showExport"
        offset-md2
        offset-sm2
        sm1
        md1
        style="align-self: end;"
      >
        <div align="right" style="padding-top:15px">
          <ExportCsv :visitas="visitas" v-if="visitas.length" />
        </div>
      </v-flex>
    </v-flex>
    <div class="gridcard rounded-card autoHeightGrid">
      <v-flex xs12 offset-md10 offset-sm10 sm2 md2>
        <v-text-field
          style="margin-right:5px;"
          v-model="filtrobusquedagrilla"
          label="Buscar..."
        ></v-text-field>
      </v-flex>
      <TablaMisVisitas :visitas="visitas" :busqueda="filtrobusquedagrilla" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import FiltrosBusqueda from '@/pantallas/SucursalVirtual/MisVisitas/FiltrosBusqueda.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { LoadingService } from '@/services/loadingService';
import TablaMisVisitas from './TablaMisVisitas.vue';
import ExportCsv from './ExportCsv.vue';
import moment from 'moment';
import {
  ValueFormatterParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import WidgetUser from '@/pantallas/SucursalVirtual/WidgetUser.vue';
import {
  fetchSertec,
  getEstadosSertec,
} from '@/pantallas/SucursalVirtual/MisVisitas/fetchSertec';
import {
  ConfigEmpresas,
  fetchEmpresas,
} from '@/pantallas/SucursalVirtual/NuevaSolicitud/fetchConfigInicial';

@Component({
  components: {
    FiltrosBusqueda,
    WidgetUser,
    TablaMisVisitas,
    ExportCsv,
  },
})
export default class MisVisitas extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.MisVisitas;

  visitas: any[] = [];
  listaEmpresas: ConfigEmpresas[] = [];
  loadingService: LoadingService = new LoadingService();
  listaEstados: any[] = [];
  listaPatentes: any[] = [];
  defaultEstado: number = 140390003;
  defaultPatente: number = 0;
  filtrobusquedagrilla: string = '';
  showExport: boolean = false;
  loadingPatente: boolean = false;
  requestsStart: number = 0;
  rutClienteDefecto: string = JSON.parse(window.localStorage.user)
    .rutClienteDefecto;
  activos: string[] = [];

  constructor() {
    super();
  }

  mounted() {
    this.getEmpresas();
    this.getEstadosVisitas();
  }

  showLoading() {
    this.requestsStart += 1;
    if (this.requestsStart == 1) this.loadingService.showLoading();
  }

  hideLoading() {
    this.requestsStart -= 1;
    if (this.requestsStart == 0) this.loadingService.hideLoading();
  }

  async VisitaInicial() {}

  async buscarSertec(
    idcliente: string,
    estado: string,
    id_user: string,
    patente: string,
    fechaInicio: string,
    fechaFin: string
  ) {
    try {
      this.loadingService.showLoading(undefined, 'buscarSertec');
      let MsResponseData =
        (await fetchSertec(
          idcliente,
          estado,
          id_user,
          patente,
          fechaInicio,
          fechaFin
        )) || null;
      if (MsResponseData !== null && MsResponseData.status == 200) {
        let MsData = MsResponseData.data;
        if (MsData['CODIGO_RESPUESTA'] == '1') {
          if (MsData['data'].length > 0) {
            this.visitas = MsData['data'];
            this.showExport = true;
          } else {
            this.visitas = [];
            this.showExport = false;
            this.$snotify.error('No se han encontrado registros.', {
              timeout: 3000,
            });
          }
        } else {
          this.visitas = [];
          this.showExport = false;
          this.$snotify.error(MsData['MENSAJE_RESPUESTA'], {
            timeout: 3000,
          });
        }
      } else {
        this.visitas = [];
        this.showExport = false;
        this.$snotify.error('Ocurrió un error. Intente nuevamente', {
          timeout: 3000,
        });
      }
    } catch (err) {
      this.$snotify.error(
        this.$t('mensajes.mensajesError.consulta', {
          entidad: 'las visitas',
        })
      );
    } finally {
      this.loadingService.hideLoading('buscarSertec');
    }
  }

  async getEmpresas() {
    try {
      this.loadingService.showLoading(undefined, 'getEmpresas');
      let empresasResponse = (await fetchEmpresas()) || [];
      this.listaEmpresas = empresasResponse.filter(x => x.id != '');
    } catch (error) {
      /* TODO: se usa any hasta saber el tipo de error */
      if (error.message == 'Network Error')
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
      else if (error.response.status != 404)
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
    } finally {
      this.loadingService.hideLoading('getEmpresas');
    }
  }

  filtroVisitas(filtros: any) {
    if (filtros.empresa.value == '') {
      this.$snotify.error('Debe seleccionar una empresa', { timeout: 3000 });
      return false;
    }
    if (filtros.estado.value == '') {
      this.$snotify.error('Debe seleccionar un estado', { timeout: 3000 });
      return false;
    }
    this.buscarSertec(
      JSON.parse(window.localStorage.user).rutClienteDefecto,
      filtros.estado.value,
      JSON.parse(window.localStorage.user).id,
      filtros.patente.value,
      filtros.fechaInicio.value,
      filtros.fechaFin.value
    );
  }

  async getEstadosVisitas() {
    let MsResponseData = (await this.cargarEstados()) || null;
    if (MsResponseData !== null && MsResponseData.status == 200) {
      let MsData = MsResponseData.data;
      if (MsData['CODIGO_RESPUESTA'] == '1') {
        if (MsData['data'].length > 0) {
          this.listaEstados = MsData['data'];
        } else {
          this.listaEstados = null;
          this.$snotify.error('Error al obtener estados', {
            timeout: 3000,
          });
        }
      } else {
        this.listaEstados = null;
        this.$snotify.error(MsData['MENSAJE_RESPUESTA'], {
          timeout: 3000,
        });
      }
    } else {
      this.listaEstados = null;
      this.$snotify.error('Ocurrió un error. Intente nuevamente', {
        timeout: 3000,
      });
    }
  }

  cargarEstados() {
    this.showLoading();
    return getEstadosSertec().catch(error => {
      if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de Giros',
          { timeout: 3000 }
        );
      }
    });
  }

  //searchDataEmpresa(a: string) {
  //  this.searchDataActivos(a);
  //}

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  /* TODO: para que se usan estas 4 variables?? */
  accionVerPdf: PermisoAccion = {
    accionCodigo: 89,
    visible: false,
  };
  accionVerDetalle: PermisoAccion = {
    accionCodigo: 4,
    visible: false,
  };
  accionDescargar: PermisoAccion = {
    accionCodigo: 10,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [];
}
</script>
