<template>
  <div>
    <v-layout row wrap>
      <!-- <v-flex xs12 sm7 md3>
        <v-select
          label="Filtrar Por Todos"
          v-model="tipoAlerta"
          :items="lstAlertasBaseFiltro"
          class="styled-select"
          style="margin-top: 8px;"
          item-text="nombre"
          item-value="id"
          @change="handleTipoAlertaChange"
        ></v-select>
      </v-flex> -->
      <v-flex xs12 sm5 md6>
        <div align="center">
          <BuscadorMantenedor :filter="handleBusqueda" />
        </div>
      </v-flex>
      <v-flex xs12 sm6 :md4="accionCrear.visible" :md6="!accionCrear.visible">
        <div align="right" style="padding-top:15px">
          <ExportarAgGridButton
            :permisoAccion="accionExportar"
            :column-defs="
              enrichedGridOptions
                ? enrichedGridOptions.columnDefs
                : gridOptions.columnDefs
            "
            :row-data="lstCertificadoBase"
            exported-file-name="Certificados"
          />
        </div>
      </v-flex>
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick" />
        </div>
      </v-flex>
    </v-layout>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidadId="funcionalidad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />
    <Confirmation
      :show="mostrarConfirmacionEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Certificado',
        })
      "
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>

    <CrearCertificadoModal
      :show="mostrarModalCrear"
      @cerrar="handleCierreModal()"
    />
    <VerCertificadoModal
      :show="mostrarModalVer"
      :lstCertificadoBase="lstCertificadoBase"
      :certificadoSeleccionado="certificadoSeleccionado"
      @cerrar="handleCierreModal()"
    />
    <EditarCertificadoModal
      :show="mostrarModalEditar"
      :lstCertificadoBase="lstCertificadoBase"
      :certificadoSeleccionado="certificadoSeleccionado"
      @cerrar="handleCierreModal()"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { AgGridVue } from 'ag-grid-vue';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
  RowNode,
} from 'ag-grid-community';
import {
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import { CertificadoBaseBackend } from '@/pantallas/CertificadosBase/ConfiguracionBase';
import moment from 'moment';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

import CrearCertificadoModal from '@/pantallas/CertificadosBase/CrearCertificadoModal.vue';
import VerAlertaModal from '@/pantallas/Alertas/VerAlertaModal.vue';
import EditarCertificadoModal from '@/pantallas/CertificadosBase/EditarCertificadoModal.vue';
import VerCertificadoModal from '@/pantallas/CertificadosBase/VerCertificadoModal.vue';

import { fetchCertificados } from '@/pantallas/CertificadosBase/fetchCertificados';
import { fetchByIdCertificado } from '@/pantallas/CertificadosBase/fetchByIdCertificados';
import { eliminarCertificado } from '@/pantallas/CertificadosBase/eliminarCertificado';

import { CertificadosBackend } from '@/interfaces/Certificados';

@Component({
  components: {
    CabeceraTabla,
    ExportarAgGridButton,
    MantenedorGridTodos,
    AgGridVue,
    CrearButton,
    BuscadorMantenedor,
    Confirmation,
    CrearCertificadoModal,
    EditarCertificadoModal,
    VerCertificadoModal,
  },
})
export default class Certificados extends ComponenteBase {
  /* ComponenteBase */

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];

  readonly funcionalidad: Funcionalidades = Funcionalidades.Alertas;

  /* aggrid */

  gridApi: GridApi = null;

  /*template*/

  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
      },
      {
        headerName: 'Tipo Certificado',
        field: 'tipoCertificado',
      },
      {
        headerName: 'Firma Certificado',
        field: 'firmaCertificado',
      },
      creadoPorColumnDefs('usuarioCreadorTxt'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModificacionTxt'),
      {
        ...fechaModificacionColumnDefs('fechaModificacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
    ],
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassCertificados,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */
  tipoCertificadoBase: number = 0;
  busquedaGrilla: string = '';
  certificadoBase: CertificadoBaseBackend[] = [];
  lstCertificadoBase: CertificadoBaseBackend[] = [];
  certificadoSeleccionado: CertificadosBackend = {};
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalVer: boolean = false;
  mostrarModalEditar: boolean = false;
  esEdicion: boolean = false;

  /*  misc */
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerCertificadoClick);
    actionsEvent.onEditar(this.handleEditarCertificadoClick);
    actionsEvent.onEliminar(this.handleEliminarAlertaClick);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassCertificados(node: RowNode): boolean {
    if (this.lstCertificadoBase.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreadorTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacionTxt.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaCreacion)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaModificacion)
          .format('DD/MM/YYYY')
          .includes(busqueda)
      );
    }

    return true;
  }

  mounted() {
    // this.fetchAlertasBase();
  }

  /* event handlers */

  handleBusqueda(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.lstCertificadoBase = (await this.fetchCertificados()) || [];
    this.gridApi.setRowData(this.lstCertificadoBase);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  async handleCierreModal() {
    this.mostrarModalCrear = false;
    this.mostrarModalVer = false;
    this.mostrarModalEditar = false;
    this.actualizarGrilla();
  }

  // async handleVerDetalleAlertaClick(params: ICellRendererParams) {
  //   this.certificadoSeleccionado =
  //     (await this.fetchByIdAlerta(params.data.id)) || {};
  //   this.mostrarModalVer = true;
  // }

  async handleEditarCertificadoClick(params: ICellRendererParams) {
    this.certificadoSeleccionado =
      (await this.fetchByIdCertificado(params.data.id)) || {};
    this.mostrarModalEditar = true;
  }

  async handleVerCertificadoClick(params: ICellRendererParams) {
    this.certificadoSeleccionado =
      (await this.fetchByIdCertificado(params.data.id)) || {};
    this.mostrarModalVer = true;
  }

  handleEliminarAlertaClick(params: ICellRendererParams) {
    this.certificadoSeleccionado = params.data;
    this.mostrarConfirmacionEliminar = true;
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    if (isConfirmado) {
      this.eliminarCertificado(this.certificadoSeleccionado);
    }
  }

  handleTipoAlertaChange(idBase: number) {
    if (idBase != 0) {
      let filtro = this.lstCertificadoBase.filter(a => a.id == idBase);
      this.gridApi.setRowData(filtro);
    } else {
      this.gridApi.setRowData(this.lstCertificadoBase);
    }
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { certificadoSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Certificado',
      nombreEntidad: certificadoSeleccionado
        ? certificadoSeleccionado.nombre
        : '',
    });
  }

  /* tabla */

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  /* util */

  // async fetchAlertasBase() {
  //   this.loadingService.showLoading();
  //   return fetchAlertasBase()
  //     .then(res => {
  //       this.lstAlertasBase = res;

  //       this.lstAlertasBaseFiltro.push({
  //         id: 0,
  //         nombre: 'Todos',
  //       });
  //       res.forEach(a => {
  //         this.lstAlertasBaseFiltro.push(a);
  //       });
  //     })
  //     .catch(() =>
  //       this.$snotify.error(
  //         'Ha ocurrido un error al intentar obtener los tipos de Alerta',
  //         { timeout: 3000 }
  //       )
  //     )
  //     .finally(() => this.loadingService.hideLoading());
  // }

  async fetchCertificados() {
    this.loadingService.showLoading();
    return fetchCertificados()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los Certificados',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async fetchByIdCertificado(id: number) {
    this.loadingService.showLoading();
    return fetchByIdCertificado(id)
      .then(e => {
        return e;
      })
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el Certificado',
          { timeout: 3000 }
        );

        return null;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarCertificado(certificado: CertificadosBackend) {
    this.loadingService.showLoading();
    return eliminarCertificado(certificado.id)
      .then(() => {
        this.$snotify.success(
          'El Certificado ' +
            certificado.nombre +
            ' ha sido eliminado de forma exitosa',
          {
            timeout: 3000,
          }
        );

        this.actualizarGrilla();
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el Certificado: ${certificado.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async actualizarGrilla() {
    this.lstCertificadoBase = (await this.fetchCertificados()) || [];
    this.gridApi.setRowData(this.lstCertificadoBase);
    //this.handleTipoAlertaChange(this.certificadoBase);
  }
}
</script>
