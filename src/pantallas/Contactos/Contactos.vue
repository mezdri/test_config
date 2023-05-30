<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusquedaContactos" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="contactos"
          exported-file-name="Contactos"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <ContactoModalNuevo
      :show="mostrarModalCrear"
      v-on:modalAsociacionEmit="handleCierreModal()"
    />
    <ContactoModalEdicion
      :show="mostrarModalEditar"
      :esEdicion="esEdicion"
      :contacto="contactoSeleccionado"
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
              <v-card-text v-if="eliminaIndividual">
                {{ tituloEliminar }}
              </v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaIndividual">
              {{ mensajeEliminaIndividual }}
            </v-card-text>
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
import { Vue, Component } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  RowNode,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';

import { Contacto as ContactoType } from '@/pantallas/Contactos/Contacto';
import { fetchContactos } from '@/pantallas/Contactos/fetchContactos';
import { eliminarContacto } from '@/pantallas/Contactos/eliminarContacto';
import ContactoModalNuevo from '@/pantallas/Contactos/ContactoModalNuevo.vue';
import ContactoModalEdicion from '@/pantallas/Contactos/ContactoModalEdicion.vue';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

@Component({
  components: {
    CabeceraTabla,
    ExportarAgGridButton,
    MantenedorGridTodos,
    AgGridVue,
    CrearButton,
    BuscadorMantenedor,
    Confirmation,
    ContactoModalNuevo,
    ContactoModalEdicion,
  },
})
export default class Contactos extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.Contactos;

  /* aggrid */

  gridApi: GridApi = null;

  /*template*/
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Correo Electrónico',
        field: 'correo',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Teléfono',
        field: 'fono',
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Empresa',
        field: 'empresa',
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Tipo de Contacto',
        field: 'tipoContactoText',
        width: 170,
        minWidth: 80,
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
      width: 150,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassContactos,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  contactos: ContactoType[] = [];
  contactoSeleccionado: ContactoType = {};
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  esEdicion: boolean = false;
  busquedaGrillaContactos: string = '';

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogEliminar: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  eliminaMasivo: Boolean = false;
  tituloEliminar: any = '';

  /*  misc */
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

  doesExternalFilterPassContactos(node: RowNode): boolean {
    if (this.contactos.length > 0 && this.busquedaGrillaContactos.length > 1) {
      let busqueda = this.busquedaGrillaContactos;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.correo.toLowerCase().includes(busqueda) ||
        node.data.fono.toLowerCase().includes(busqueda) ||
        node.data.empresa.toLowerCase().includes(busqueda) ||
        node.data.tipoContactoText.toLowerCase().includes(busqueda) ||
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

  handleBusquedaContactos(consulta: string) {
    this.busquedaGrillaContactos = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.contactos = (await this.fetchContactos()) || [];
    this.gridApi.setRowData(this.contactos);
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
    this.contactoSeleccionado = this.contactos.find(
      contacto => contacto.id == params.data.id
    );
    this.esEdicion = false;
    this.mostrarModalEditar = true;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.contactoSeleccionado = this.contactos.find(
      contacto => contacto.id == params.data.id
    );
    this.esEdicion = true;
    this.mostrarModalEditar = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.contactoSeleccionado = params.data;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Contacto',
      nombreEntidad: this.contactoSeleccionado.nombre,
    });
    const totalAsociados = this.contactoSeleccionado.totalAsociados;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Contacto',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Contacto: ' + this.contactoSeleccionado.nombre;
      this.dialogEliminar = true;
    } else {
      this.mensajeEliminaIndividual =
        'El Contacto tiene ' +
        (totalAsociados > 1
          ? 'asociaciones activas, '
          : 'una asociación activa, ') +
        'por esta razón no se podrá realizar la eliminación.';
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
    }
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    const self = this;
    this.dialogEliminar = false;
    if (!isConfirmado) {
      return;
    }

    await this.eliminarContacto(this.contactoSeleccionado);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { contactoSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Contacto',
      nombreEntidad: contactoSeleccionado ? contactoSeleccionado.nombre : '',
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

  /* util */

  async fetchContactos() {
    this.loadingService.showLoading();
    return fetchContactos()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener contactos asociados a su usuario',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarContacto(contacto: ContactoType) {
    this.loadingService.showLoading();
    return eliminarContacto(contacto)
      .then(() => {
        this.actualizarGrilla();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            nombre: contacto.nombre,
            entidad: 'El Contacto',
            eliminadaO: 'eliminado',
          })
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el contacto: ${contacto.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async actualizarGrilla() {
    this.contactos = (await this.fetchContactos()) || [];
    this.gridApi.setRowData(this.contactos);
  }
}
</script>
