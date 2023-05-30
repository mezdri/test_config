<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12>
                <v-switch
                  v-model="estado"
                  :label="formFields.estado.label"
                  :id="formFields.estado.id"
                  color="yellow"
                  :readonly="isVerDetalle"
                  @change="cambio"
                  :hint="hint"
                  :persistent-hint="true"
                  :data-testid="`${testId}--estado`"
                ></v-switch>
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.codigo.label"
                  v-model="formFields.codigo.value"
                  :data-vv-name="formFields.codigo.id"
                  :id="formFields.codigo.id"
                  :disabled="isVerDetalle || esEditar"
                  v-validate="'required|numeric|excluded:0|max:10|codigoUnico'"
                  :counter="10"
                  :error-messages="errors.collect(formFields.codigo.id)"
                  :data-testid="`${testId}--codigo`"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="`required|max:80|NombreUnico`"
                  :data-vv-name="formFields.nombre.id"
                  :id="formFields.nombre.id"
                  counter="80"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-testid="`${testId}--nombre`"
                />
              </v-flex>
              <v-flex sm6 md6>
                <v-text-field
                  :label="formFields.descripcion.label"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  v-validate="'max:200'"
                  :counter="200"
                  :disabled="isVerDetalle"
                  :data-testid="`${testId}--descripcion`"
                />
              </v-flex>
              <v-flex sm6 md6>
                <v-select
                  :items="tiposDispositivo"
                  :error-messages="
                    errors.collect(formFields.tipoDispositivoId.id)
                  "
                  :label="formFields.tipoDispositivoId.label"
                  :data-vv-name="formFields.tipoDispositivoId.id"
                  v-model="formFields.tipoDispositivoId.value"
                  v-validate="'required'"
                  no-data-text="Sin resultados"
                  :disabled="isVerDetalle"
                  item-text="nombre"
                  item-value="id"
                  :data-testid="`${testId}--tipoDispositivoId`"
                ></v-select>
              </v-flex>
              <v-flex sm6 md6>
                <v-select
                  :items="gps"
                  :error-messages="errors.collect(formFields.isGps.id)"
                  :label="formFields.isGps.label"
                  :data-vv-name="formFields.isGps.id"
                  v-model="formFields.isGps.value"
                  v-validate="'required'"
                  :disabled="isVerDetalle"
                  item-text="nombre"
                  item-value="valor"
                  :data-testid="`${testId}--isGps`"
                ></v-select>
              </v-flex>
              <v-flex sm1 md1 v-if="iconoUrl !== ''">
                <img
                  v-if="iconoUrl !== ''"
                  :src="iconoUrl"
                  height="50"
                  alt="Icono"
                />
              </v-flex>
              <v-flex
                :sm5="iconoUrl !== ''"
                :sm6="iconoUrl == ''"
                :md5="iconoUrl !== ''"
                :md6="iconoUrl == ''"
              >
                <v-text-field
                  label="Ícono"
                  heigh
                  @click="$refs.image.click()"
                  prepend-icon="attach_file"
                  v-model="icono.name"
                  readonly="readonly"
                  :disabled="isVerDetalle"
                ></v-text-field>
                <input
                  type="file"
                  style="display: none;"
                  ref="image"
                  accept="image/png, image/jpeg"
                  @change="onFilePicked"
                  :disabled="isVerDetalle"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-switch
                  v-model="mostrarDatos"
                  label="Datos Extendidos"
                  color="yellow"
                  :readonly="isVerDetalle"
                  hide-details
                ></v-switch>
              </v-flex>
              <v-flex xs10 sm10 md10></v-flex>
              <v-flex xs2 sm2 md2 v-if="mostrarDatos">
                <v-btn
                  @click="handleCrearClick()"
                  class="icon"
                  v-if="!isVerDetalle"
                >
                  <v-icon dark left>add_circle_outline</v-icon>
                  <span>Agregar</span>
                </v-btn>
              </v-flex>
              <v-flex xs12 sm12 md12 v-if="mostrarDatos">
                <MantenedorGrid :grid-options="gridOptions" />
              </v-flex>
            </FormFieldsContainer>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <!-- Modal -->
    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="{
        entidad: 'Dato Extendido',
        nombreEntidad: datoSeleccionado ? datoSeleccionado.nombre : '',
      }"
      :mensaje="{ entidad: 'el Dato Extendido' }"
      @aceptar="handleConfirmacionEliminar"
      @cancelar="cerrarModalCrud"
    />

    <CrearTipoDatoExtendidoModal
      v-if="mostrarModalCrear"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar($event)"
      :datoExtendido="datoExtendido"
      :dispositivoId="dispositivoId"
    />
    <EditarDatoExtendidoModal
      v-if="mostrarModalEditar"
      @cerrar="handleCierraModalSinGuardar"
      :datoSeleccionado="datoSeleccionado"
      :datoExtendido="datoExtendido"
      :dispositivoId="dispositivoId"
      @cerrarBtnGuardar="handleCierreModalBtnGuardarEditar($event)"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
  GetQuickFilterTextParams,
  ICellRendererParams,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { Validator } from 'vee-validate';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import {
  emitFormChangeEvent,
  FormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { makeAccionesModal } from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';

import {
  DispositivoNuevo,
  DatoExtendido,
} from '@/pantallas/Dispositivos/Dispositivos';
import CrearTipoDatoExtendidoModal from '@/pantallas/Dispositivos/CrearTipoDatoExtendidoModal.vue';
import EditarDatoExtendidoModal from '@/pantallas/Dispositivos/EditarDatoExtendidoModal.vue';

import { fetchTiposDispositivo } from '@/pantallas/TipoDispositivo/fetchTiposDeDispositivos';
import { fetchTiposMedida } from '@/pantallas/TipoMedida/fetchTiposDeMedida';
import { TipoDispositivo as TipoDispositivoType } from '@/pantallas/TipoDispositivo/TipoDispositivo';
import { TipoMedida as TipoMedidaType } from '@/pantallas/TipoMedida/TipoMedida';
import config from '@/config/index';

import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import moment from 'moment';
import { Dispositivo } from '@/reusable/Dispositivos/dispositivos';
import { OperacionesCrud } from '../../reusable/Mantenedor/mantenedorUtils';
@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    MantenedorGrid,
    CrearTipoDatoExtendidoModal,
    EditarDatoExtendidoModal,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class DispositivoForm extends Vue {
  @Prop({ required: false }) testId: string;
  @Prop({ required: false }) dispositivoSeleccionado: Dispositivo;
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ default: false }) esEditar: boolean;

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

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
  ];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.Dispositivos;
  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => '',
      },
      {
        headerName: 'Trama',
        field: 'trama',
      },
      {
        headerName: 'Posición',
        field: 'posicion',
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: this.isVerDetalle,
      },
      {
        headerName: 'Medida',
        field: 'tipoMedidaText',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
      },
      {
        headerName: 'Icono',
        field: 'iconoBase64',
        cellRenderer: this.crearIcono,
      },
      {
        headerName: 'Link',
        field: 'link',
      },
      makeAccionesModal({
        onEliminar: this.handleEliminarClick,
        onEditar: this.handleEditarClick,
      }),
    ].map(x => ({
      width: 130,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  isFormValid: boolean = false;
  datoExtendido: DatoExtendido[] = [];
  datoSeleccionado: DatoExtendido = null;
  tiposDispositivo: TipoDispositivoType[] = [];
  mostrarConfirmacionEliminar: boolean = false;
  dispositivoId: number = 0;
  mostrarDatos: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mensajeDispositivo = '';
  icono: any = {};
  iconoUrl = '';
  iconoBase64: string = '';
  nombre: string = '';
  mensaje: string[] = [
    '* Ya existe un Dispositivo con este nombre.',
    '* Ya existe un Dispositivo con este código.',
    '* Dispositivo posee asociaciones no es posible cambiar su estado.',
  ];
  hint: string = '';
  estado: boolean = true;
  seleccionEstado: number = 0;
  totalAsociados: number = 0;
  modalCrudActivo: OperacionesCrud = null;
  tipoMedidas: TipoMedidaType[] = [];
  nombreMedidas: string[] = [];

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogErrorAsoc: Boolean = false;
  tituloEliminar: any = '';
  localeText: any = config.agGridTextos;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    codigo: {
      label: 'Código',
      id: 'codigo',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    isGps: {
      label: 'GPS',
      id: 'isGps',
      value: '',
    },
    tipoDispositivoId: {
      label: 'Tipo de Dispositivo',
      id: 'tipoDispositivoId',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: 'estado',
      value: '',
    },
  };
  gps: any[] = [
    {
      nombre: 'Sí',
      valor: true,
    },
    {
      nombre: 'No',
      valor: false,
    },
  ];

  axios = new AxiosVue(ServicioProxy.Dispositivo);

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.datoExtendido = this.datoExtendido || [];
    this.gridApi.setRowData(this.datoExtendido);
  }
  handleCrearClick() {
    this.$validator.errors.clear();
    this.mostrarModalCrear = true;
  }
  handleCierraModalSinGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar(e: FormChangeEvent) {
    this.mostrarModalCrear = false;
    this.datoExtendido.push(e.entity);
    this.obtenerMedidas();
  }
  async handleCierreModalBtnGuardarEditar(e: FormChangeEvent) {
    this.mostrarModalEditar = false;
    const index = this.datoExtendido.findIndex(
      item => item.nombre === this.datoSeleccionado.nombre
    );
    this.datoExtendido[index] = e.entity;
    this.datoExtendido[index].id = this.datoSeleccionado.id;
    this.obtenerMedidas();
  }

  handleEditarClick(params: any) {
    this.$validator.errors.clear();
    if (!this.isVerDetalle) {
      this.datoSeleccionado = params;
      this.mostrarModalEditar = true;
    }
  }
  handleEliminarClick(params: any) {
    this.datoSeleccionado = params;
    this.modalCrudActivo = OperacionesCrud.eliminar;
  }
  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  handleConfirmacionEliminar() {
    const nombre = this.datoSeleccionado.nombre;
    const index = this.datoExtendido.findIndex(
      item => item.nombre === this.datoSeleccionado.nombre
    );
    this.datoExtendido.splice(index, 1);
    this.gridApi.setRowData(this.datoExtendido);
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.eliminar', {
        entidad: 'El Dato Extendido',
        eliminadaO: 'eliminado',
        nombre,
      })
    );
    this.modalCrudActivo = null;
  }

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
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

  /* template */

  get tituloConfirmacionEliminar() {
    const { datoSeleccionado } = this;
    return this.$t('mensaje.crud.eliminar.titulo', {
      entidad: 'El Dato de Actividad Extendida ',
      nombreEntidad: datoSeleccionado ? datoSeleccionado.nombre : '',
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

  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }

  async recargarDatos() {
    if (this.gridApi) {
      this.gridApi.setRowData(this.datoExtendido);
    }
  }

  /* handle */

  @Watch('dispositivoSeleccionado', { deep: true })
  async handleSeleccionadoChange() {
    this.tiposDispositivo = (await this.fetchTipoDispositivos()) || [];
    this.tipoMedidas = (await this.fetchTipoMedida()) || [];
    if (!this.dispositivoSeleccionado) {
      return;
    }
    if (this.isVerDetalle === true) {
      this.gridOptions.columnDefs.pop();
    }
    this.nombre = this.dispositivoSeleccionado.nombre;
    if (
      this.dispositivoSeleccionado.icono !== '' &&
      this.dispositivoSeleccionado.icono !== null
    ) {
      this.iconoUrl =
        'data:image/jpg;base64,' + this.dispositivoSeleccionado.icono;
    }
    this.iconoBase64 = this.dispositivoSeleccionado.icono;
    this.datoExtendido = this.dispositivoSeleccionado.dispositivoCampoVm;
    this.mostrarDatos = this.datoExtendido.length !== 0 ? true : false;
    this.dispositivoId =
      this.dispositivoSeleccionado === undefined
        ? 0
        : this.dispositivoSeleccionado.id;
    this.formFields.codigo.value = this.dispositivoSeleccionado.id;
    this.formFields.nombre.value = this.dispositivoSeleccionado.nombre;
    this.formFields.descripcion.value = this.dispositivoSeleccionado.descripcion;
    this.formFields.tipoDispositivoId.value = this.dispositivoSeleccionado.tipoDispositivoId;
    this.formFields.isGps.value = this.dispositivoSeleccionado.isGps;
    this.formFields.estado.value = this.dispositivoSeleccionado.estado;
    this.totalAsociados =
      this.dispositivoSeleccionado.totalAsociados === undefined
        ? 0
        : this.dispositivoSeleccionado.totalAsociados;
    if (this.dispositivoSeleccionado.estado === 1) {
      this.estado = true;
    } else {
      this.estado = false;
    }
    this.cambio();
  }
  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }
  @Watch('datoExtendido', { deep: true })
  obtenerMedidas() {
    if (!this.datoExtendido || this.datoExtendido == []) {
      return;
    }
    for (let medida in this.tipoMedidas) {
      for (let medidaDato in this.datoExtendido) {
        if (
          this.tipoMedidas[medida].id ===
          this.datoExtendido[medidaDato].tipoMedidaId
        ) {
          this.datoExtendido[medidaDato].tipoMedidaText = this.tipoMedidas[
            medida
          ].nombre;
        }
      }
    }
    this.recargarDatos();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          id: this.formFields.codigo.value,
          nombre: this.formFields.nombre.value,
          tipoDispositivoId: this.formFields.tipoDispositivoId.value,
          descripcion: this.formFields.descripcion.value,
          isGps: this.formFields.isGps.value,
          iconoBase64: this.iconoBase64,
          dispositivoCampoVm: this.datoExtendido,
          estado: this.formFields.estado.value,
        } as DispositivoNuevo,
      },
      this
    );
  }

  mounted() {
    this.handleFormChange();
    this.handleSeleccionadoChange();
    const validator = makeValidatorDictionary(this.formFields);
    validator.custom.codigo.excluded = '* Código no permitido.';
    this.$validator.localize('es', validator);
  }

  /* util */

  validarNombreDispositivo(nombre: string) {
    const axios = new AxiosVue(ServicioProxy.Dispositivo);
    const id =
      this.dispositivoSeleccionado === undefined
        ? 0
        : this.dispositivoSeleccionado.id;
    this.mensajeDispositivo = ' Dispositivo ya existe';
    if (this.nombre === nombre) {
      return true;
    }
    return axios.http.get(`Dispositivo/ChequearNombreUnico/${id}/${nombre}`);
  }

  async onFilePicked(e: any) {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (files[0] !== undefined) {
      const file = e.target.files[0];
      fileReader.readAsDataURL(file);

      await fileReader.addEventListener('load', () => {
        this.icono = file;
        this.iconoUrl = String(fileReader.result);
        this.iconoBase64 = String(fileReader.result).split(',')[1];
        this.emitFormChangeIcono(this.iconoBase64);
      });
    } else {
      this.icono = {};
      this.iconoUrl = '';
      this.iconoBase64 = '';
      this.emitFormChange();
    }
  }

  emitFormChangeIcono(base64: any) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        id: this.formFields.codigo.value,
        nombre: this.formFields.nombre.value,
        tipoDispositivoId: this.formFields.tipoDispositivoId.value,
        descripcion: this.formFields.descripcion.value,
        isGps: this.formFields.isGps.value,
        iconoBase64: base64,
        dispositivoCampoVm: this.datoExtendido,
        estado: this.formFields.estado.value,
      } as DispositivoNuevo,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

  fetchTipoDispositivos() {
    this.loadingService.showLoading();
    return fetchTiposDispositivo()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de dispositivo',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchTipoMedida() {
    return fetchTiposMedida();
  }

  crearIcono({ data: datoExtendido }: { data: DatoExtendido }) {
    if (datoExtendido.iconoBase64 == '' || datoExtendido.iconoBase64 == null) {
      return;
    }
    return `<img src='${'data:image/jgp;base64,' +
      datoExtendido.iconoBase64}' style='height: 40px; width: 40px;padding-right: 2px'/>`;
  }

  constructor() {
    super();
    this.registrarValidadores();
  }
  created() {
    this.cambio();
  }

  registrarValidadores() {
    const self = this;

    Validator.extend('NombreUnico', {
      getMessage(field: any, params: any, data: any) {
        return self.mensaje[0];
      },
      validate(value: any) {
        const axios = new AxiosVue(ServicioProxy.Dispositivo);
        if (self.nombre === value) {
          return true;
        }
        return axios.http
          .get(`dispositivo/ChequearNombreUnico/${self.dispositivoId}/${value}`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: !response.data,
                data: !response.data
                  ? undefined
                  : {
                      message: self.mensaje,
                    },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });
    Validator.extend('codigoUnico', {
      getMessage(field: any, params: any, data: any) {
        return self.mensaje[1];
      },
      validate(value: any) {
        const axios = new AxiosVue(ServicioProxy.Dispositivo);
        return axios.http
          .get(`dispositivo/ChequearIdUnico/${value}`)
          .then(res => {
            return new Promise(resolve => {
              resolve({
                valid: !res.data,
                data: !res.data
                  ? undefined
                  : {
                      message: self.mensaje[1],
                    },
              });
            });
          });
      },
    });
  }

  cambio() {
    if (this.estado) {
      this.formFields.estado.value = 1;
      this.seleccionEstado = 1;
      this.formFields.estado.label = 'Activo';
      this.hint = '';
    } else {
      this.formFields.estado.value = 0;
      this.seleccionEstado = 2;
      this.formFields.estado.label = 'Inactivo';
      this.hint = 'Al dejar como inactivo, no se podrán realizar asociaciones.';
    }
    this.$emit('estadoSwitch', this.estado);
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
</style>
