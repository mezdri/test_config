<template>
  <div class="ConfigAutorizacionesContenedor">
    <!-- /// FILTROS /// -->
    <v-flex sm9 md9 layout wrap>
      <v-flex sm4 md4>
        <v-combobox
          label="Usuario"
          v-model="usuario"
          :items="usuariosOptions"
          item-text="nombrecompleto"
          item-value="idusuario"
          dense
        >
        </v-combobox>
      </v-flex>
      <v-flex sm4 md4>
        <v-combobox
          label="Operación"
          v-model="operacion"
          :items="operacionesOptions"
          item-text="configdescripcion"
          item-value="configid"
          dense
        >
        </v-combobox>
      </v-flex>
      <v-flex sm4 md4>
        <div></div>
      </v-flex>
      <v-flex sm4 md4>
        <DatePicker label="Fecha de Inicio" v-model="filtroFechaInicio" />
      </v-flex>
      <v-flex sm4 md4>
        <DatePicker label="Fecha de Fin" v-model="filtroFechaFin" />
      </v-flex>
      <v-flex sm4 md4>
        <div class="text-sm-center">
          <v-btn @click="handleFilters"><v-icon>search</v-icon>FILTRAR</v-btn>
          <v-btn @click="clearFilters"><v-icon>clear</v-icon>LIMPIAR</v-btn>
        </div>
      </v-flex>
      <v-flex sm4 md4>
        <div class="text-sm-center"></div>
      </v-flex>
    </v-flex>
    <!-- /// BUSQUEDA /// -->
    <div class="contenidoConfigAutorizaciones">
      <v-flex sm3 md3>
        <BuscadorMantenedor :filter="handleBusqueda" />
      </v-flex>
      <v-flex xs12 sm6 md4>
        <div></div>
      </v-flex>
      <!-- /// CREACION /// -->
      <div>
        <v-btn class="btnCrear" @click="abrirModalCrear = true">
          <v-icon dark left>add_circle_outline</v-icon>
          <span>CREAR</span>
        </v-btn>
        <ModalMantenedor :show="abrirModalCrear">
          <CabeceraModalCreacion
            @cerrarCrear="cerrarModalCrear"
            @guardarCrear="guardarAlta"
            :permitirGuard="permitirGuardCrear"
          >
            <NavegacionModalCrud
              v-model="pasoActivoIndexCrear"
              :pasos="pasosCrear"
              :estado-id="estadoIdCrear"
              @guardar="guardarAlta"
            />
          </CabeceraModalCreacion>
          <v-stepper v-model="pasoActivoIndexCrear">
            <CrudStepperHeader
              :pasos="pasosCrear"
              :paso-activo-index="pasoActivoIndexCrear"
            ></CrudStepperHeader>
            <CrudStepperItems>
              <CrudStepperContent :paso="pasosCrear.configuracion">
                <ComponenteForm
                  :listaOperaciones="operacionesOptions"
                  :creacion="true"
                  @objCreacion="objsParaAlta"
                />
              </CrudStepperContent>
            </CrudStepperItems>
          </v-stepper>
        </ModalMantenedor>
      </div>
      <!-- /// EDICION /// -->
      <div>
        <ModalMantenedor :show="abrirModalEditar">
          <CabeceraModalEdicion
            @cerrarEditar="cerrarModalEditar"
            :permitirGuard="permitirGuardEditar"
            @guardarCrear="guardarEdicion"
          >
            <NavegacionModalCrud
              v-model="pasoActivoIndexEditar"
              :pasos="pasosEditar"
              :estado-id="estadoIdEditar"
            />
          </CabeceraModalEdicion>
          <v-stepper v-model="pasoActivoIndexEditar">
            <CrudStepperHeader
              :pasos="pasosEditar"
              :paso-activo-index="pasoActivoIndexEditar"
            ></CrudStepperHeader>
            <CrudStepperItems>
              <CrudStepperContent :paso="pasosEditar.configuracion">
                <ComponenteForm
                  :listaOperaciones="operacionesOptions"
                  :edicion="true"
                  :data="infoEdicion"
                  @objEdicion="objsParaEdicion"
                />
              </CrudStepperContent>
            </CrudStepperItems>
          </v-stepper>
        </ModalMantenedor>
      </div>
      <!-- /// VISUALIZACION /// -->
      <div>
        <ModalMantenedor :show="abrirModalVer">
          <CabeceraModalVisualizacion @cerrarVer="cerrarModalVer">
            <NavegacionModalCrud
              v-model="pasoActivoIndexVer"
              :pasos="pasosVisualizar"
              :estado-id="estadoIdVer"
            />
          </CabeceraModalVisualizacion>
          <v-stepper v-model="pasoActivoIndexVer">
            <CrudStepperHeader
              :pasos="pasosVisualizar"
              :paso-activo-index="pasoActivoIndexVer"
            ></CrudStepperHeader>
            <CrudStepperItems>
              <CrudStepperContent :paso="pasosVisualizar.configuracion">
                <ComponenteForm
                  :visualizacion="true"
                  :data="infoVisualizacion"
                />
              </CrudStepperContent>
            </CrudStepperItems>
          </v-stepper>
        </ModalMantenedor>
      </div>
    </div>
    <!-- /// TABLA /// -->
    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidadId="funcionalidad"
        id="tabla"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { fetchConfigAutorizaciones } from './fetchConfigAutorizaciones';
import { LoadingService } from '@/services/loadingService';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';

import { campos } from '@/pantallas/Conecta/ConfigAutorizaciones/camposConfigAutorizaciones';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  ValueFormatterParams,
  GetQuickFilterTextParams,
  RowNode,
} from 'ag-grid-community';

import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

import { actionsEvent } from '@/setup';
import CabeceraModalCreacion from './CabeceraModalCreacion.vue';
import CabeceraModalEdicion from './CabeceraModalEdicion.vue';
import CabeceraModalVisualizacion from './CabeceraModalVisualizacion.vue';

import ComponenteForm from './ComponenteForm.vue';

@Component({
  components: {
    DatePicker,
    BuscadorMantenedor,
    MantenedorGridSinCodigo,
    ModalMantenedor,
    CabeceraModalCreacion,
    CabeceraModalEdicion,
    CabeceraModalVisualizacion,
    CrudStepperItems,
    CrudStepperContent,
    NavegacionModalCrud,
    CrudStepperHeader,
    ComponenteForm,
  },
})
export default class ConfigAutorizaciones extends Vue {
  constructor() {
    super();
    actionsEvent.onVerDetalle(this.handleVer);
    actionsEvent.onEditar(this.handleEditar);
  }

  info: any = [];
  infoVisualizacion: any = [];
  infoEdicion: any = [];

  usuario: any = '';
  operacion: any = '';
  filtroFechaInicio = moment();
  filtroFechaFin = moment().add(1, 'year');

  infoGrilla: any = [];
  busqueda = '';
  operacionesOptions: any = [];
  usuariosOptions: any = [];

  objetoAlta: any = {};
  objetoEdicion: any = {};

  loadingService = new LoadingService();
  $snotify: any;

  /// MODAL CREACION ///
  readonly pasosCrear: PasosCrud = {
    configuracion: {
      accion: '',
      visible: true,
      step: 1,
      title: 'Crear Configuración de Autorización',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
      codigoSubAccion: 40,
      codigoAccionPadre: CodigoAccion.Crear,
    },
  };

  /// MODAL EDICION ///
  readonly pasosEditar: PasosCrud = {
    configuracion: {
      accion: '',
      visible: true,
      step: 1,
      title: 'Editar Configuración de Autorización',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
      codigoSubAccion: 40,
      codigoAccionPadre: CodigoAccion.Editar,
    },
  };

  /// MODAL VISUALIZACION ///
  readonly pasosVisualizar: PasosCrud = {
    configuracion: {
      accion: '',
      visible: true,
      step: 1,
      title: 'Ver Configuración de Autorización',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
      codigoSubAccion: 40,
      codigoAccionPadre: CodigoAccion.Editar,
    },
  };

  /// CABECERA MODAL CREAR ///
  permitirGuardCrear = false;
  abrirModalCrear = false;
  pasoActivoIndexCrear = 1;
  abrirModalEditar = false;
  pasoActivoIndexEditar = 1;
  abrirModalVer = false;
  pasoActivoIndexVer = 1;

  /// CABECERA MODAL EDITAR ///
  permitirGuardEditar = false;

  beforeMount() {
    this.getCombos();
  }

  objsParaAlta(obj: any) {
    this.objetoAlta = obj;
    if (
      this.objetoAlta.usuarioSeleccionado &&
      this.objetoAlta.operacion &&
      this.objetoAlta.numeroOrden &&
      this.objetoAlta.fechaInicio
    )
      this.permitirGuardCrear = true;
  }

  objsParaEdicion(obj: any) {
    this.objetoEdicion = obj;
    if (this.objetoEdicion.fechaFin !== undefined)
      this.permitirGuardEditar = true;
  }

  guardarAlta() {
    this.loadingService.showLoading(undefined, 'guardarAlta');
    return fetchConfigAutorizaciones(
      'altaConfigAutorizaciones',
      this.objetoAlta
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1')
          this.$snotify.success(data.data.MENSAJE_RESPUESTA, 3000);
        else this.$snotify.error(data.data.MENSAJE_RESPUESTA, 3000);
      })
      .catch((err: any) => console.error(err))
      .finally(() => {
        this.cerrarModalCrear();
        this.getCombos(); // ???
        this.loadingService.hideLoading('guardarAlta');
      });
  }

  guardarEdicion() {
    this.loadingService.showLoading(undefined, 'guardarEdicion');
    return fetchConfigAutorizaciones(
      'edicionConfigAutorizaciones',
      this.objetoEdicion
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1')
          this.$snotify.success(data.data.MENSAJE_RESPUESTA, 3000);
        else this.$snotify.error(data.data.MENSAJE_RESPUESTA, 3000);
      })
      .catch((err: any) => console.error(err))
      .finally(() => {
        this.cerrarModalEditar();
        this.loadingService.hideLoading('guardarEdicion');
      });
  }

  async renderGrilla(payload: any) {
    await this.cargaGrilla(payload);
    this.gridApi.setRowData(this.info);
    this.gridApi.setDomLayout('autoHeight');
  }

  cargaGrilla(body: any) {
    this.loadingService.showLoading(undefined, 'cargaGrilla');
    return fetchConfigAutorizaciones('getConfigAutorizaciones', body)
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') this.info = data.data.data;
        else {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA, 3000);
          this.info = [];
        }
      })
      .catch((err: any) => console.error(err))
      .finally(() => this.loadingService.hideLoading('cargaGrilla'));
  }

  /// TABLA ///
  gridApi: GridApi = null;
  enrichedGridOptions: GridOptions = null;
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.ConfigAutorizaciones;
  readonly gridOptions: GridOptions = {
    columnDefs: campos,
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
    paginationPageSize: 30,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };
  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.renderGrilla({ '': '' });
  }
  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }
  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }
  handleBusqueda(consulta: string) {
    this.busqueda = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }
  doesExternalFilterPass(node: RowNode): boolean {
    if (this.info.length > 0 && this.busqueda.length > 0) {
      let search =
        node.data.numeroconfig.toLowerCase().includes(this.busqueda) ||
        node.data.usuariocompleto.toLowerCase().includes(this.busqueda) ||
        node.data.usuariorut.toLowerCase().includes(this.busqueda) ||
        node.data.numeroorden.toLowerCase().includes(this.busqueda) ||
        node.data.configdescripcion.toLowerCase().includes(this.busqueda) ||
        node.data.autofecha_inicio.toLowerCase().includes(this.busqueda) ||
        node.data.autofecha_fin.toLowerCase().includes(this.busqueda) ||
        node.data.autoobserva.toLowerCase().includes(this.busqueda);
      return search;
    }
    return true;
  }
  isExternalFilterPresent(): boolean {
    return true;
  }
  /// FIN TABLA ///

  cerrarModalCrear() {
    this.renderGrilla({ '': '' });
    this.abrirModalCrear = false;
    this.pasoActivoIndexCrear = 1;
    this.permitirGuardCrear = false;
    this.infoVisualizacion = [];
    return true;
  }

  cerrarModalEditar() {
    this.renderGrilla({ '': '' });
    this.pasoActivoIndexEditar = 1;
    this.abrirModalEditar = false;
    this.permitirGuardEditar = false;
    this.infoVisualizacion = [];
    return true;
  }

  cerrarModalVer() {
    this.pasoActivoIndexVer = 1;
    this.abrirModalVer = false;
  }

  handleFilters() {
    let body = {
      filtroIdUsuario: this.usuario.idusuario ? this.usuario.idusuario : '',
      filtroIdOperacion: this.operacion.configid ? this.operacion.configid : '',
      filtroFechaInicio: this.filtroFechaInicio,
      filtroFechaFin: this.filtroFechaFin,
    };
    this.renderGrilla(body);
    return true;
  }

  clearFilters() {
    this.busqueda = '';
    this.usuario = '';
    this.operacion = '';
    this.filtroFechaInicio = moment();
    this.filtroFechaFin = moment().add(1, 'year');
    this.renderGrilla({ '': '' });
    return true;
  }

  handleEditar(e: any) {
    this.infoEdicion = [];
    this.infoEdicion.push(e.data);
    this.abrirModalEditar = true;
    return true;
  }

  handleVer(e: any) {
    this.infoVisualizacion = [];
    this.infoVisualizacion.push(e.data);
    this.abrirModalVer = true;
    return true;
  }

  getCombos() {
    fetchConfigAutorizaciones('getComboOperaciones', {})
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1')
          this.operacionesOptions = data.data.data;
        else this.operacionesOptions = [];
      })
      .catch((err: any) => console.error(err));

    fetchConfigAutorizaciones('getComboUsuario', {})
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1')
          this.usuariosOptions = data.data.data;
        else this.usuariosOptions = [];
      })
      .catch((err: any) => console.error(err));

    return true;
  }

  get estadoIdCrear() {
    const { entity } = this.pasosCrear.configuracion.formState;
    if (!entity) return null;
    return entity.estado;
  }

  get estadoIdEditar() {
    const { entity } = this.pasosEditar.configuracion.formState;
    if (!entity) return null;
    return entity.estado;
  }

  get estadoIdVer() {
    const { entity } = this.pasosVisualizar.configuracion.formState;
    if (!entity) return null;
    return entity.estado;
  }
}
</script>

<style>
.ConfigAutorizacionesContenedor .contenidoConfigAutorizaciones {
  display: flex;
  justify-content: space-between;
}

.ConfigAutorizacionesContenedor .btnCrear {
  background: #ffe800 !important;
  font-size: 14px;
  font-weight: 500;
  margin-left: 18rem;
  padding-right: 20px;
}

.ConfigAutorizacionesContenedor #tabla {
  height: 100% !important;
}

.ConfigAutorizacionesContenedor
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1),
.ConfigAutorizacionesContenedor
  div.ag-layout-auto-height:nth-child(3)
  > div:nth-child(1),
.ConfigAutorizacionesContenedor
  #app
  > div.application--wrap
  > div:nth-child(2)
  > main
  > div
  > div
  > div:nth-child(3)
  > div.gridcard.rounded-card
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-body-horizontal-scroll
  > div.ag-horizontal-left-spacer {
  display: none !important;
}
</style>
