<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusquedaTipoContacto" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="tiposContacto"
          exported-file-name="TipoDeContacto"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <div class="gridcard rounded-card">
      <MantenedorGridTodos
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
        @gridOptionsEnriched="enrichedGridOptions = $event"
      />
    </div>

    <app-tipoContacto-modal-nuevo
      :show="mostrarModalCrear"
      v-on:modalAsociacionEmit="handleCierreModal()"
    />
    <app-tipoContacto-modal-edicion
      :show="mostrarModalEditar"
      :esEdicion="esEdicion"
      :tipoContacto="tipoContactoSeleccionada"
      v-on:modalAsociacionEmit="handleCierreModal()"
    />

    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
            >
              <v-card-text v-if="eliminaIndividual">{{
                tituloEliminar
              }}</v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaMasivo">{{
              mensajeEliminaMasivo
            }}</v-card-text>
            <v-card-text v-if="eliminaIndividual">{{
              mensajeEliminaIndividual
            }}</v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              depressed
              small
              @click="dialogErrorAsoc = false"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  GetQuickFilterTextParams,
  RowNode,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { fetchTipoContacto } from '@/pantallas/TipoContacto/fetchTipoContacto';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import { TipoContacto as TipoContactoType } from '@/pantallas/TipoContacto/TipoContacto';
import { eliminarTipoContacto } from '@/pantallas/TipoContacto/eliminarTipoContacto';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

type TipoContactoRowData = TipoContactoType & {
  checked?: boolean;
};

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    'app-tipoContacto-modal-nuevo': () =>
      import('@/pantallas/TipoContacto/TipoContactoModalNuevo.vue'),
    'app-tipoContacto-modal-edicion': () =>
      import('@/pantallas/TipoContacto/TipoContactoModalEdicion.vue'),
  },
})
export default class TipoContacto extends ComponenteBase {
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
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoDeContacto;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
      },
      creadoPorColumnDefs('usuarioCreador'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModifica'),
      {
        ...fechaModificacionColumnDefs('fechaModificacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassTipoContacto,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */
  axios: AxiosVue = new AxiosVue(ServicioProxy.Contacto);
  tiposContacto: TipoContactoType[] = [];
  tipoContactoSeleccionada: TipoContactoType = {};
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  esEdicion: boolean = false;
  busquedaGrillaTipoContacto: string = '';

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogEliminar: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  eliminaMasivo: Boolean = false;
  tituloEliminar: any = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassTipoContacto(node: RowNode): boolean {
    if (
      this.tiposContacto.length > 0 &&
      this.busquedaGrillaTipoContacto.length > 1
    ) {
      let busqueda = this.busquedaGrillaTipoContacto;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreador.toLowerCase().includes(busqueda) ||
        node.data.usuarioModifica.toLowerCase().includes(busqueda) ||
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

  /* event handlers */

  handleBusquedaTipoContacto(consulta: string) {
    this.busquedaGrillaTipoContacto = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.tiposContacto = (await this.fetchTipoContacto()) || [];
    this.gridApi.setRowData(this.tiposContacto);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModal() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.actualizarGrilla();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.tipoContactoSeleccionada = this.tiposContacto.find(
      contacto => contacto.id == params.data.id
    );
    this.esEdicion = false;
    this.mostrarModalEditar = true;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.tipoContactoSeleccionada = this.tiposContacto.find(
      contacto => contacto.id == params.data.id
    );
    this.esEdicion = true;
    this.mostrarModalEditar = true;
  }

  async handleEliminarClick(params: ICellRendererParams) {
    this.tipoContactoSeleccionada = params.data;
    const self = this;
    this.axios.http
      .get(`TipoContactos/validaElimina/${this.tipoContactoSeleccionada.id}`)
      .then(res => {
        this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Tipo de Contacto',
          nombreEntidad: self.tipoContactoSeleccionada.nombre,
        });
        const contactosAsociados = res.data.value;
        if (contactosAsociados === 0) {
          this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
            entidad: 'el Tipo de Contacto',
          });
          this.titulomostrarAvisoDelete =
            'Eliminar Tipo de Contacto: ' + self.tipoContactoSeleccionada.id;
          this.dialogEliminar = true;
        } else {
          this.dialogErrorAsoc = true;
          this.eliminaIndividual = true;
          this.mensajeEliminaIndividual =
            'El Tipo de Contacto está asociado a ' +
            (contactosAsociados > 1
              ? contactosAsociados + ' Contactos, '
              : 'un Contacto, ') +
            'por esta razón no se podrá realizar la eliminación.';
          this.eliminaMasivo = false;
        }
      })
      .catch(error => {});
    this.mostrarConfirmacionEliminar = true;
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    const self = this;
    this.dialogEliminar = false;
    this.mostrarConfirmacionEliminar = false;
    if (!isConfirmado) {
      return;
    }
    this.eliminarTipoContacto(this.tipoContactoSeleccionada);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { tipoContactoSeleccionada } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Tipo de Contacto',
      nombreEntidad: tipoContactoSeleccionada
        ? tipoContactoSeleccionada.nombre
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

  fetchTipoContacto() {
    this.loadingService.showLoading();
    return fetchTipoContacto()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de contacto',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarTipoContacto(tipoContacto: TipoContactoType) {
    this.loadingService.showLoading();
    return eliminarTipoContacto(tipoContacto)
      .then(() => {
        this.actualizarGrilla();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            nombre: tipoContacto.nombre,
            entidad: 'El Tipo Contacto',
            eliminadaO: 'eliminado',
          })
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el tipo de contacto: ${tipoContacto.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async actualizarGrilla() {
    this.tiposContacto = (await this.fetchTipoContacto()) || [];
    this.gridApi.setRowData(this.tiposContacto);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }
}
</script>
