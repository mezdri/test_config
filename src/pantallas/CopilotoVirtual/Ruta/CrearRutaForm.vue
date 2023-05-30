<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md>
            <FormFieldsContainer :titulo="titulo">
              <slot name="prependInformacionGeneral" />

              <v-layout row wrap v-show="!isVerDetalle">
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
                  ></v-switch>
                </v-flex>

                <v-flex xs12 sm12 md12>
                  <v-text-field
                    :label="formFields.nombre.label"
                    v-model="formFields.nombre.value"
                    v-validate="`required`"
                    :data-vv-name="formFields.nombre.id"
                    id="txtNombre"
                    :disabled="isVerDetalle"
                    :error-messages="errors.collect(formFields.nombre.id)"
                    @change="handleNombre"
                  />
                </v-flex>
                <v-flex xs12 sm6 md6>
                  <v-select
                    :label="formFields.tipoZona.label"
                    :error-messages="errors.collect(formFields.tipoZona.id)"
                    :data-vv-name="formFields.tipoZona.id"
                    v-model="formFields.tipoZona.value"
                    :items="lstTipoZonas"
                    item-text="nombre"
                    item-value="id"
                    @change="handleTipoZonaChange"
                  />
                </v-flex>
                <v-flex xs12 sm6 md6>
                  <Buscador
                    :filter="
                      gridApiZonasRutas &&
                        gridApiZonasRutas.setQuickFilter.bind(gridApiZonasRutas)
                    "
                  />
                </v-flex>
              </v-layout>

              <v-flex xs12 sm12 md12>
                <v-card>
                  <MantenedorGridVerDetalle
                    v-if="isVerDetalle"
                    :grid-options="gridOptionsZonasRutas"
                    :row-data="lsZonas"
                  />
                  <AsociacionGrid
                    v-else
                    :grid-options="gridOptionsZonasRutas"
                    :esEditar="modoEditar"
                    :headerCheckbox="modoEditar"
                  />
                </v-card>
                <!-- <MantenedorGrid :grid-options="gridOptions" /> -->
              </v-flex>
            </FormFieldsContainer>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import {
  emitFormChangeEvent,
  FormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import { makeAccionesModal } from '@/reusable/Grid/aggridColumnDefUtils';
import { OperacionesCrud } from '../../../reusable/Mantenedor/mantenedorUtils';
import moment from 'moment';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { fetchZonas } from '@/pantallas/Alertas/Services/fetchZonas';
import {
  Color,
  BaseRuta,
  TipoEventoCopiloto,
  Ruta,
  TipoEventoCopilotoSeleccionado,
  MensajeSeleccionado,
  RutaCoordenada,
} from './rutas';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import NumericEditor from '@/reusable/Grid/Editors/NumericEditor.vue';
import Buscador from '@/reusable/Grid/Buscador.vue';
import numericEditorBus from '@/reusable/Grid/Editors/NumericEditorBus';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import { IZona, ITipoZona } from '@/interfaces/Zonas';
import { ZonaRow } from '@/interfaces/Alertas';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import {
  checkboxColumnDefAsoEditar,
  checkboxColumnDefAsoCrear,
} from '@/reusable/Grid/aggridColumnDefUtils';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import { Validator } from 'vee-validate';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import { Mensaje, MensajeSelected } from '../Mensaje/mensaje';
import { fetchMensaje } from '../Mensaje/fetchMensaje';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
    MantenedorGrid,
    Buscador,
    MantenedorGridVerDetalle,
    AsociacionGrid,
    MensajeValidacion,
  },
})
export default class CrearRutaForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() rutaSeleccionada: Ruta;
  @Prop({ default: (): [] => [] }) rutasDetalles: BaseRuta[];

  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];
  lsRuta: BaseRuta[] = [];

  mostrarConfirmacionEliminar: boolean = false;
  mostrarDatos: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;

  hint: string = '';
  estado: boolean = true;
  seleccionEstado: number = 0;
  titulo: string = 'Crear Ruta';

  modalCrudActivo: OperacionesCrud = null;
  eventosCopiloto: TipoEventoCopiloto[] = [];
  lstRutaCoordenada: RutaCoordenada[] = [];

  /* misc */
  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);
  gridApi: GridApi = null;

  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  lstTipoZonas: ITipoZona[] = [];
  gridApiZonasRutas: GridApi = null;
  lstZonas: ZonaRow[] = [];
  lstZonasVerDetalle: ZonaRow[] = [];

  isValidateTP: boolean = false;
  isValidateRM: boolean = false;
  primeraCarga: boolean = true;
  contador: number = 0;
  contadorSel: number = 0;

  idRuta: number = null;
  vehiculosIdSeleccionar: number[] = [];
  etiquetasIdSeleccionar: number[] = [];
  flotasIdSeleccionar: number[] = [];

  mensajes: Mensaje[] = [];
  mensajeSeleccionados: MensajeSelected[] = [];

  lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[] = [];
  lstSelectedRutas: BaseRuta[] = [];
  lsSelectedMsj: MensajeSeleccionado[] = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    estado: {
      label: 'Estado',
      id: 'id',
      value: '',
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    zona: {
      label: 'Zonas',
      id: 'zona',
      value: '',
    },
    color: {
      label: 'Color',
      id: 'colorHexadecimal',
      value: '',
    },

    vminima: {
      label: 'Velocidad Mínima',
      id: 'vminima',
      value: '',
    },
    vmaxima: {
      label: 'Velocidad Máxima',
      id: 'vmaxima',
      value: '',
    },

    permiteDetencion: {
      label: 'Permite Detención',
      id: 'pdetencion',
      value: '',
    },
    tiempoPernencia: {
      label: 'Tiempo máximo de permanecia en la zona',
      id: 'tmin',
      value: '',
    },
    horaDesde: {
      label: 'Hora desde (HH:mm)',
      id: 'hdesde',
      value: '',
    },
    horaHasta: {
      label: 'Hora hasta (HH:mm)',
      id: 'hhasta',
      value: '',
    },
    RepetirMensaje: {
      label: 'Repetir Mensaje',
      id: 'rmensaje',
      value: '',
    },
    tiempoRepeticionMensaje: {
      label: 'Tiempo repetición mensaje',
      id: 'trepeticion',
      value: '',
    },
    tiempoEntrada: {
      label: 'Tiempo próximo entrar a zona',
      id: 'tiempoEntradaGeocerca',
      value: '',
    },
    tipoZona: {
      label: 'Filtro por Tipo de Zona',
      id: 'tipoZona',
      value: 0,
    },
  };

  readonly gridOptionsZonasRutas: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
        pinned: 'left',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Tipo',
        field: 'tipoZonaNombre',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Color',
        field: 'color',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Azul', 'Amarillo', 'Rojo', 'Verde'],
        },
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Velocidad máx en km/h',
        field: 'velocidadMax',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Velocidad min en km/h',
        field: 'velocidadMin',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Permite detención',
        field: 'pdetenciontxt',
        editable: this.editCell,
        cellRenderer: this.formatEditable,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Tiempo de permanecia en min',
        field: 'tmin',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Hora desde (HH:mm)',
        field: 'hdesde',
        editable: this.editCell,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Hora hasta (HH:mm)',
        field: 'hhasta',
        editable: this.editCell,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Repetir mensaje',
        field: 'rmensajetxt',
        editable: this.editCell,
        cellRenderer: this.formatEditable,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Tiempo repetición mensaje en seg.',
        field: 'trmensaje',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Tiempo entrada a geocerca en seg.',
        field: 'tiempoEntradaGeocerca',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Codigo Ruta Base',
        field: 'rutaId',
        hide: true,
      },

      {
        headerName: 'Codigo Zona',
        field: 'rutaCorId',
        hide: true,
      },
      {
        headerName: 'Codigo',
        field: 'Id',
        hide: true,
      },
    ],
    onGridReady: this.handleGridZonaRutasReady,
    onCellValueChanged: this.onCellValueChanged,
    onSelectionChanged: this.onCellValueChanged,
    singleClickEdit: true,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Zona',
        field: 'zonaNombre',
      },
      {
        headerName: 'Velocidad máxima',
        field: 'vmax',
      },

      {
        headerName: 'Velocidad mínima',
        field: 'vmin',
      },
      {
        headerName: 'Permite detención',
        field: 'pdetenciontxt',
      },
      {
        headerName: 'Tiempo de permanecia',
        field: 'tmin',
      },
      {
        headerName: 'Hora desde (HH:mm)',
        field: 'hdesde',
      },
      {
        headerName: 'Hora hasta (HH:mm)',
        field: 'hhasta',
      },
      {
        headerName: 'Repetir mensaje',
        field: 'rmensajetxt',
      },
      {
        headerName: 'Tiempo repetición mensaje',
        field: 'trmensaje',
      },
      {
        headerName: 'Tiempo entrada a geocerca',
        field: 'tiempoEntradaGeocerca',
      },

      makeAccionesModal({
        onEliminar: this.handleEliminarClick,
      }),
    ].map(x => ({
      width: 130,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,

    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.lstZonas || []);
  }

  mounted() {
    this.getZonas();
    this.setColor();
    this.getLstTipoZonas();
    this.handleRutasSeleccionadas();
  }

  created() {
    this.cambio();
    this.isValidateTP = false;
    this.isValidateRM = false;
    const validator = makeValidatorDictionary(this.formFields);
    this.$validator.localize('es', validator);
    if (this.isVerDetalle) {
      this.titulo = 'Ver detalle ruta';
      // this.gridApiZonasRutas.stopEditing();
    } else if (this.modoEditar) {
      this.titulo = 'Editar Ruta';
      this.gridOptionsZonasRutas.singleClickEdit = this.modoEditar;
    }
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  handleEliminarClick(params: any) {
    this.modalCrudActivo = OperacionesCrud.eliminar;
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
  }
  async handleCierreModalBtnGuardarEditar(e: FormChangeEvent) {}

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  constructor() {
    super();
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

  getZonas() {
    //if(this.modoEditar){
    this.loadingService.showLoading();
    this.fetchZonas()
      .then(res => {
        this.lstZonas = res || [];

        if (!this.isVerDetalle) {
          this.gridApiZonasRutas.setRowData(this.lstZonas);
        } else {
          this.lstZonas.forEach(z => {
            this.rutasDetalles.forEach(r => {
              if (r.zona == z.id) {
                this.$set(r, 'nombre', z.nombre);
                this.$set(r, 'tipoZonaNombre', z.tipoZonaNombre);
                this.$set(
                  r,
                  'color',
                  this.getColorHex(r.colorHex == null ? '#3ac873' : r.colorHex)
                );
                this.$set(r, 'velocidadMax', r.velocidadMaxima);
                this.$set(r, 'velocidadMin', r.velocidadMinima);
                this.$set(r, 'trmensaje', r.tiempoRepetir);
                this.$set(r, 'hdesde', r.horaDesde);
                this.$set(r, 'hhasta', r.horaHasta);
                this.$set(r, 'tmin', r.tiempoMaximo);
              }
            });
          });

          this.gridApiZonasRutas.setRowData(this.rutasDetalles);

          //se devuelve para ver detalle
          if (this.isVerDetalle) {
            this.$emit('changeDatosZonas', this.rutasDetalles);
          }
        }
      })
      .finally(() => this.loadingService.hideLoading());

    // }else{
    //   //this.rutasDetalle()
    // }
  }

  fetchZonas() {
    this.loadingService.showLoading();
    return fetchZonas()
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener zonas.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener zonas.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  setColor() {
    this.lsColor = [
      { color: 'Verde', colorhexadecimal: '#3ac873' },
      { color: 'Rojo', colorhexadecimal: '#ff0000' },
      { color: 'Amarillo', colorhexadecimal: '#f8ff00' },
      { color: 'Azul', colorhexadecimal: '#366d9f' },
    ];
  }
  getColor(color: String) {
    switch (color) {
      case 'Verde':
        return '#3ac873';
      case 'Rojo':
        return '#ff0000';
      case 'Amarillo':
        return '#f8ff00';
      case 'Azul':
        return '#366d9f';
    }
  }

  getColorHex(color: String) {
    switch (color) {
      case '#3ac873':
        return 'Verde';
      case '#ff0000':
        return 'Rojo';
      case '#f8ff00':
        return 'Amarillo';
      case '#366d9f':
        return 'Azul';
    }
  }

  async valForm() {
    if (this.formFields.permiteDetencion.value) {
      this.isValidateTP = true;
    } else {
      this.isValidateTP = false;
    }

    if (this.formFields.RepetirMensaje.value) {
      this.isValidateRM = true;
    } else {
      this.isValidateRM = false;
    }
  }
  cleanform() {
    this.formFields.zona.value = '';
  }

  @Watch('rutaSeleccionada', { deep: true })
  async handleRutasSeleccionadas() {
    if (this.rutaSeleccionada) {
      this.formFields.nombre.value = this.rutaSeleccionada.nombre;
      this.formFields.nombre.label = this.rutaSeleccionada.nombre;
      this.$emit('nombre', this.formFields.nombre.value.toString());

      this.datosGrillaFormCrear();
      //this.getMensajes(this.rutaSeleccionada.id);
    }
  }

  async datosGrillaFormCrear() {
    //this.rutasDetalles = [];
    let rutaBase = {
      id: this.rutaSeleccionada.id,
      nombre: this.rutaSeleccionada.nombre,
    };

    this.idRuta = rutaBase.id;

    this.loadingService.showLoading();
    this.axiosCopiloto.http
      .get(`RutaCopiloto/getRutaDetalle/${rutaBase.id}`)
      .then(response => {
        if (response !== null && response !== undefined) {
          for (let index = 0; index < response.data.length; index++) {
            this.rutasDetalles.push({
              nombre: response.data[index].nombre,
              zonaNombre: response.data[index].zonaNombre,
              zona: response.data[index].zona,
              colorHex: response.data[index].colorHx,
              velocidadMinima: response.data[index].vmin,
              velocidadMaxima: response.data[index].vmax,
              pdetenciontxt: response.data[index].pdetenciontxt,
              permitirDetencion: response.data[index].pdetencion,
              repetirMensaje: response.data[index].rmensaje,
              rmensajetxt: response.data[index].rmensajetxt,
              tiempoMaximo: response.data[index].tmin,
              tiempoRepetir: response.data[index].trmensaje,
              horaDesde: response.data[index].hdesde,
              horaHasta: response.data[index].hhasta,
              tiempoEntradaGeocerca: response.data[index].tiempoEntradaGeocerca,
              lstTipoEventoCopiloto: [],
              lstRutaEventoMensaje: [],
              id: response.data[index].id,
              rutaId: response.data[index].rutaId,
              color: response.data[index].colorHx,
              coordenadaId: response.data[index].zona,
            });

            //       this.lstRutaCoordenada.push({
            //     id: response.data[index].rutaCoordenadaId,
            //     rutaId: response.data[index].rutaId,
            //     coordenadaId: response.data[index].coordenadaId,
            //     color: response.data[index].colorHx,
            //     velocidadMaxima: response.data[index].vmax,
            //     velocidadMinima: response.data[index].vmin,
            //     permitirDetencion: response.data[index].pdetencion,
            //     tiempoMaximo: response.data[index].tmin,
            //     horaDesde: response.data[index].hdesde,
            //     horaHasta: response.data[index].hhasta,
            //     colorHex: response.data[index].colorHx,
            //     tiempoEntradaGeocerca: response.data[index].tiempoEntradaGeocerca,
            //     repetirMensaje: response.data[index].rmensaje,
            //     tiempoRepetir: response.data[index].trmensaje
            // });
          }
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });

    this.getVehiculos(rutaBase.id);
  }

  async getVehiculos(rutaId: number) {
    let vehiculos = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getVehiculos/${rutaId}`
    );
    this.vehiculosIdSeleccionar = vehiculos.data[0];
    this.flotasIdSeleccionar = vehiculos.data[1];
    this.etiquetasIdSeleccionar = vehiculos.data[2];
  }

  async getMensajes(rutaId: number) {
    this.mensajes = (await this.fetchMensaje()) || [];

    for (let i = 0; i < this.lstselectedTipoEvento.length; i++) {
      for (let y = 0; y < this.mensajes.length; y++) {
        this.lsSelectedMsj.push({
          idMensaje: this.mensajes[y].id,
          titulo: this.mensajes[y].titulo,
          idZona: this.lstselectedTipoEvento[i].idZona,
          nombreRuta: this.lstselectedTipoEvento[i].nombreRuta,
          zonaNombre: this.lstselectedTipoEvento[i].zonaNombre,
          nombreEvento: this.lstselectedTipoEvento[i].nombreEvento,
          idEvento: this.lstselectedTipoEvento[i].idEvento,
          selected: false,
        });
      }
    }

    let respMensajes = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getMensajes/${rutaId}`
    );

    //this.mensajes
    for (let x = 0; x < respMensajes.data.length; x++) {
      for (let i = 0; i < this.lsSelectedMsj.length; i++) {
        if (
          this.lsSelectedMsj[i].idMensaje == respMensajes.data[x].id &&
          this.lsSelectedMsj[i].idEvento == respMensajes.data[x].idEvento
        ) {
          this.lsSelectedMsj[i].selected = true;
        }
      }
    }
  }

  fetchMensaje() {
    this.loadingService.showLoading();
    return fetchMensaje()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los mensajes',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  @Watch('rutasDetalles')
  rutasDetallesChange() {}

  editCell(params: any) {
    if (!this.modoVer) {
      if (params.node.isSelected()) {
        if (
          params != null
          //this.muestraAlertaDetencionNoAutorizada === true &&
          //this.formFields.vehiculoIgnicion.value === 'sinIgnicion'
        ) {
          if (
            params.column.colId === 'temporalidad' ||
            params.column.colId === 'eventos'
          ) {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  formatEditable(params: ValueFormatterParams) {
    if (
      params.value === undefined ||
      params.value === null ||
      params.value === ''
    ) {
      if (params.node.isSelected()) {
        return '<i class="material-icons" style="font-size:19px;opacity:0.2;">create</i>';
      } else {
        return '';
      }
    }
    return params.value;
  }
  async onCellValueChanged() {
    this.contador++;
    if (this.contador >= this.contadorSel) this.primeraCarga = false;
    if (!this.primeraCarga) {
      let rowSelected = this.gridApiZonasRutas.getSelectedRows();

      this.lsRuta = [];

      for (let index = 0; index < rowSelected.length; index++) {
        let zona = rowSelected[index];

        let idZona = zona.id;

        let color = zona.color == null ? 'Verde' : zona.color;

        let detenciontxt = 'Sí';
        if (zona.pdetenciontxt == null) {
          detenciontxt = 'No';
        } else {
          detenciontxt = zona.pdetenciontxt;
        }
        let mensajetxt = 'Sí';
        if (zona.rmensajetxt == null) {
          mensajetxt = 'No';
        } else {
          mensajetxt = zona.rmensajetxt;
        }
        // let detenciontxt =
        //   typeof zona.pdetenciontxt === undefined ? 'No' : 'Sí';
        // let mensajetxt = typeof zona.rmensajetxt === undefined ? 'No' : 'Sí';

        this.eventosCopiloto = [
          { id: 1, idZona: idZona, nombre: 'Entrada', selected: false },
          {
            id: 2,
            idZona: idZona,
            nombre: 'Exceso de velocidad',
            selected: false,
          },
          {
            id: 3,
            idZona: idZona,
            nombre: 'Velocidad bajo la mínima',
            selected: false,
          },
          { id: 4, idZona: idZona, nombre: 'Detención', selected: false },
          { id: 5, idZona: idZona, nombre: 'Permanencia', selected: false },
          {
            id: 6,
            idZona: idZona,
            nombre: 'Restricción horaria',
            selected: false,
          },
          { id: 7, idZona: idZona, nombre: 'Salida', selected: false },
          {
            id: 8,
            idZona: idZona,
            nombre: 'Próximo a entrar a la zona',
            selected: false,
          },
        ];

        this.lsRuta.push({
          nombre: this.formFields.nombre.value.toString(),
          zona: zona.id,
          zonaNombre: zona.nombre,
          colorHex: this.getColor(color), //this.setColor this.formFields.color.value.toString(),
          velocidadMinima:
            zona.velocidadMin == null ? 0 : Number(zona.velocidadMin), // Number(this.formFields.vminima.value),
          velocidadMaxima:
            zona.velocidadMax == null ? 0 : Number(zona.velocidadMax), //Number(this.formFields.vmaxima.value),
          pdetenciontxt: detenciontxt,
          //Boolean(this.formFields.permiteDetencion.value) == true ? 'Sí' : 'No',
          permitirDetencion: detenciontxt === 'Sí' ? true : false, //Boolean(this.formFields.permiteDetencion.value),
          rmensajetxt: mensajetxt,
          //Boolean(this.formFields.RepetirMensaje.value) == true ? 'Sí' : 'No',
          repetirMensaje: mensajetxt === 'Sí' ? true : false, //Boolean(this.formFields.RepetirMensaje.value),
          tiempoMaximo: zona.tmin == null ? 0 : Number(zona.tmin), //Number(this.formFields.tiempoPernencia.value),
          tiempoRepetir: zona.trmensaje == null ? 0 : Number(zona.trmensaje), //Number(this.formFields.tiempoRepeticionMensaje.value),
          horaDesde: zona.hdesde == null ? null : zona.hdesde, // this.formFields.horaDesde.value.toString(),
          horaHasta: zona.hhasta == null ? null : zona.hhasta,
          tiempoEntradaGeocerca:
            zona.tiempoEntradaGeocerca == null
              ? 0
              : Number(zona.tiempoEntradaGeocerca), //Number(this.formFields.tiempoEntrada.value),
          lstTipoEventoCopiloto: this.eventosCopiloto,
          lstRutaEventoMensaje: null,
          rutaId: zona.rutaId == null ? 0 : zona.rutaId,
          id: zona.Id == null ? 0 : zona.Id,
          color: this.getColor(color),
          coordenadaId: zona.id,
        });
      }

      // rowSelected.forEach(async  (zona: any) => {

      //   let idZona = zona.id;

      //   let color = zona.color == null ? 'Verde' : zona.color;

      //   let detenciontxt = 'Sí';
      //   if (zona.pdetenciontxt == null) {
      //     detenciontxt = 'No';
      //   } else {
      //     detenciontxt = zona.pdetenciontxt;
      //   }
      //   let mensajetxt = 'Sí';
      //   if (zona.mensajetxt == null) {
      //     mensajetxt = 'No';
      //   } else {
      //     mensajetxt = zona.mensajetxt;
      //   }
      //   // let detenciontxt =
      //   //   typeof zona.pdetenciontxt === undefined ? 'No' : 'Sí';
      //   // let mensajetxt = typeof zona.rmensajetxt === undefined ? 'No' : 'Sí';

      //   this.eventosCopiloto = [
      //     { id: 1, idZona: idZona, nombre: 'Entrada', selected: false },
      //     {
      //       id: 2,
      //       idZona: idZona,
      //       nombre: 'Exceso de velocidad',
      //       selected: false,
      //     },
      //     {
      //       id: 3,
      //       idZona: idZona,
      //       nombre: 'Velocidad bajo la mínima',
      //       selected: false,
      //     },
      //     { id: 4, idZona: idZona, nombre: 'Detención', selected: false },
      //     { id: 5, idZona: idZona, nombre: 'Permanencia', selected: false },
      //     {
      //       id: 6,
      //       idZona: idZona,
      //       nombre: 'Restricción horaria',
      //       selected: false,
      //     },
      //     { id: 7, idZona: idZona, nombre: 'Salida', selected: false },
      //     {
      //       id: 8,
      //       idZona: idZona,
      //       nombre: 'Próximo a entrar a la zona',
      //       selected: false,
      //     },
      //   ];

      //   this.lsRuta.push({
      //     nombre: this.formFields.nombre.value.toString(),
      //     zona: zona.id,
      //     zonaNombre: zona.nombre,
      //     colorHex: this.getColor(color), //this.setColor this.formFields.color.value.toString(),
      //     velocidadMinima:
      //       zona.velocidadMin == null ? 0 : Number(zona.velocidadMin), // Number(this.formFields.vminima.value),
      //     velocidadMaxima:
      //       zona.velocidadMax == null ? 0 : Number(zona.velocidadMax), //Number(this.formFields.vmaxima.value),
      //     pdetenciontxt: detenciontxt,
      //     //Boolean(this.formFields.permiteDetencion.value) == true ? 'Sí' : 'No',
      //     pdetencion: detenciontxt === 'Sí' ? true : false, //Boolean(this.formFields.permiteDetencion.value),
      //     rmensajetxt: mensajetxt,
      //     //Boolean(this.formFields.RepetirMensaje.value) == true ? 'Sí' : 'No',
      //     rmensaje: mensajetxt === 'Sí' ? true : false, //Boolean(this.formFields.RepetirMensaje.value),
      //     tmin: zona.tmin == null ? 0 : Number(zona.tmin), //Number(this.formFields.tiempoPernencia.value),
      //     trmensaje: zona.trmensaje == null ? 0 : Number(zona.trmensaje), //Number(this.formFields.tiempoRepeticionMensaje.value),
      //     horaDesde: zona.hdesde == null ? null : zona.hdesde, // this.formFields.horaDesde.value.toString(),
      //     horaHasta: zona.hhasta == null ? null : zona.hhasta,
      //     tiempoEntradaGeocerca:
      //       zona.tiempoEntradaGeocerca == null
      //         ? 0
      //         : Number(zona.tiempoEntradaGeocerca), //Number(this.formFields.tiempoEntrada.value),
      //     lstTipoEventoCopiloto: this.eventosCopiloto,
      //     lstRutaEventoMensaje: null,
      //     rutaId: zona.rutaId == null ? 0 : zona.rutaId,
      //     id: zona.Id == null ? 0 : zona.Id,
      //     color: this.getColor(color),
      //     coordenadaId: zona.id,
      //   });
      // });

      this.$emit('changeDatosZonas', this.lsRuta);
    }
  }
  tipo: number = 0;
  isExternalFilterPresent() {
    return this.tipo != 0;
  }
  doesExternalFilterPass(node: any) {
    return node.data.tipoZonaId == this.tipo;
  }

  async getLstTipoZonas() {
    this.loadingService.showLoading();
    this.axios.http
      .get('Alerta/GetListTipoZona')
      .then(res => {
        this.lstTipoZonas.push({
          id: 0,
          nombre: 'Todos',
        });

        if (res !== null && res !== undefined) {
          res.data.forEach((a: ITipoZona) => {
            this.lstTipoZonas.push(a);
          });
        }
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener el tipo de zonas.'
            );
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener el tipo de zonas.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }
  handleTipoZonaChange(tipoZona: number) {
    this.tipo = tipoZona;
    this.gridApiZonasRutas.onFilterChanged();
  }

  handleNombre() {
    this.onCellValueChanged();
    this.$emit('nombre', this.formFields.nombre.value.toString());
  }
  handleGridZonaRutasReady(event: GridReadyEvent) {
    this.gridApiZonasRutas = event.api;
    // numericEditorBus.handleFocusout(this.$options.name, () =>
    //   this.gridApiZonasRutas.stopEditing()
    // );
    if (this.lstZonas.length === 0) {
      this.loadingService.showLoading();
      this.fetchZonas()
        .then(response => {
          if (response !== null && response !== undefined) {
            this.setZonasSeleccionadas();
          }
        })
        .finally(() => this.loadingService.hideLoading());
    } else {
      this.setZonasSeleccionadas();
    }
  }

  async setZonasSeleccionadas() {
    this.gridApiZonasRutas.stopEditing();
    this.gridOptionsZonasRutas.onCellEditingStopped;
    this.lstZonasVerDetalle = [];
    if (this.isVerDetalle) {
      console.log('');
    } else if (this.rutaSeleccionada && !this.isVerDetalle) {
      if (this.rutasDetalles.length > 0) {
        this.loadingService.showLoading();

        for (let index = 0; index < this.rutasDetalles.length; index++) {
          let zs = this.rutasDetalles[index];
          let color = this.getColorHex(zs.colorHex);
          this.gridApiZonasRutas.forEachNode(async (node: any) => {
            if (node.data.id == zs.zona) {
              node.data.color = color;
              node.data.hdesde = zs.horaDesde;
              node.data.hhasta = zs.horaHasta;
              //node.data.nombre = zs.nombre;
              node.data.pdetencion = zs.permitirDetencion;
              node.data.pdetenciontxt = zs.pdetenciontxt;
              node.data.velocidadMin = zs.velocidadMinima;
              node.data.velocidadMax = zs.velocidadMaxima;
              node.data.rmensajetxt = zs.rmensajetxt;
              node.data.trmensaje = zs.tiempoRepetir;
              node.data.tiempoEntradaGeocerca = zs.tiempoEntradaGeocerca;
              node.data.tmin = zs.tiempoMaximo;
              node.data.rutaId = zs.rutaId;
              node.data.rutaCorId = zs.zona;
              node.data.Id = zs.id;

              node.setSelected(true);
              this.contadorSel++;
            }
          });
        }

        // this.rutasDetalles.forEach((zs) => {
        //   let color = this.getColorHex(zs.colorHex);
        //   this.gridApiZonasRutas.forEachNode(function (node: any) {
        //     if (node.data.id == zs.zona) {
        //       node.data.color = color;
        //       node.data.hdesde = zs.horaDesde;
        //       node.data.hhasta = zs.horaHasta;
        //       //node.data.nombre = zs.nombre;
        //       node.data.pdetencion = zs.pdetencion;
        //       node.data.pdetenciontxt = zs.pdetenciontxt;
        //       node.data.velocidadMin = zs.velocidadMinima;
        //       node.data.velocidadMax = zs.velocidadMaxima;
        //       node.data.rmensajetxt = zs.rmensajetxt;
        //       node.data.trmensaje = zs.trmensaje;
        //       node.data.tiempoEntradaGeocerca = zs.tiempoEntradaGeocerca;
        //       node.data.tmin = zs.tmin;
        //       node.data.rutaId = zs.rutaId;
        //       node.data.rutaCorId = zs.zona;
        //       node.data.Id = zs.id;

        //       node.setSelected(true);
        //     }
        //   });
        // });

        //this.gridApiZonasRutas.refreshCells();
      }
      this.loadingService.hideLoading();
    }
  }
  setGridZonas() {
    this.gridApiZonasRutas.setRowData(this.lstZonas);
    this.$emit('changeDatosZonas', []);
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
