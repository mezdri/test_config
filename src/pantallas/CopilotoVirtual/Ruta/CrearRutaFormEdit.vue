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
                    v-validate="'required'"
                    :data-vv-name="formFields.nombre.id"
                    id="txtNombre"
                    :disabled="isVerDetalle"
                    :readonly="esEditar"
                    :error-messages="errors.collect(formFields.nombre.id)"
                  />
                </v-flex>
                <v-flex x12 sm12 md12>
                  <v-autocomplete
                    :label="formFields.zona.label"
                    v-model="formFields.zona.value"
                    :items="lsZonas"
                    item-value="id"
                    item-text="nombre"
                    v-validate="'required'"
                    required
                    :error-messages="errors.collect('lsZonas')"
                    data-vv-name="lsZonas"
                    no-data-text="Sin resultados"
                    :disabled="isVerDetalle"
                    autocomplete
                  ></v-autocomplete>
                </v-flex>
                <v-flex x12 sm12 md12>
                  <v-autocomplete
                    :label="formFields.color.label"
                    v-model="formFields.color.value"
                    :items="lsColor"
                    item-value="colorhexadecimal"
                    item-text="color"
                    v-validate="'required'"
                    required
                    :error-messages="errors.collect('Colores')"
                    no-data-text="Sin resultados"
                    data-vv-name="Colores"
                    :disabled="isVerDetalle"
                    autocomplete
                  ></v-autocomplete>
                </v-flex>

                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="number"
                    :label="formFields.vminima.label"
                    v-model="formFields.vminima.value"
                    v-validate="'numeric|max_value:200|min_value:0|integer'"
                    :data-vv-name="formFields.vminima.id"
                    :id="formFields.vminima.id"
                    counter="50"
                    :disabled="isVerDetalle"
                    :error-messages="errors.collect(formFields.vminima.id)"
                  />
                </v-flex>
                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="number"
                    :label="formFields.vmaxima.label"
                    v-model="formFields.vmaxima.value"
                    v-validate="'numeric|max_value:200|min_value:0|integer'"
                    :data-vv-name="formFields.vmaxima.id"
                    :id="formFields.vmaxima.id"
                    counter="50"
                    :disabled="isVerDetalle"
                    :error-messages="errors.collect(formFields.vmaxima.id)"
                  />
                </v-flex>
                <v-flex x6 sm6 md6>
                  <v-checkbox
                    :label="formFields.permiteDetencion.label"
                    v-model="formFields.permiteDetencion.value"
                    :data-vv-name="formFields.permiteDetencion.id"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="number"
                    :label="formFields.tiempoPernencia.label"
                    v-model="formFields.tiempoPernencia.value"
                    :data-vv-name="formFields.tiempoPernencia.id"
                    :id="formFields.tiempoPernencia.id"
                    counter="50"
                    :disabled="isVerDetalle"
                    v-validate="{
                      rules: {
                        required: isValidateTP,
                      },
                    }"
                    :error-messages="
                      errors.collect(formFields.tiempoPernencia.id)
                    "
                  />
                </v-flex>
                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="time"
                    :label="formFields.horaDesde.label"
                    v-model="formFields.horaDesde.value"
                    :data-vv-name="formFields.horaDesde.id"
                    :id="formFields.horaDesde.id"
                    counter="50"
                    :disabled="isVerDetalle"
                  />
                </v-flex>
                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="time"
                    :label="formFields.horaHasta.label"
                    v-model="formFields.horaHasta.value"
                    :data-vv-name="formFields.horaHasta.id"
                    :id="formFields.horaHasta.id"
                    counter="50"
                    :disabled="isVerDetalle"
                  />
                </v-flex>
                <v-flex x6 sm6 md6>
                  <v-checkbox
                    :label="formFields.RepetirMensaje.label"
                    v-model="formFields.RepetirMensaje.value"
                    :data-vv-name="formFields.RepetirMensaje.id"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="number"
                    :label="formFields.tiempoRepeticionMensaje.label"
                    v-model="formFields.tiempoRepeticionMensaje.value"
                    :data-vv-name="formFields.tiempoRepeticionMensaje.id"
                    :id="formFields.tiempoRepeticionMensaje.id"
                    counter="50"
                    v-validate="{
                      rules: {
                        required: isValidateRM,
                      },
                    }"
                    :disabled="isVerDetalle"
                    :error-messages="
                      errors.collect(formFields.tiempoRepeticionMensaje.id)
                    "
                  />
                </v-flex>

                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="number"
                    :label="formFields.tiempoEntrada.label"
                    v-model="formFields.tiempoEntrada.value"
                    :data-vv-name="formFields.tiempoEntrada.id"
                    :id="formFields.tiempoEntrada.id"
                    v-validate="'numeric|max_value:200|min_value:0|integer'"
                    counter="50"
                    :disabled="isVerDetalle"
                    :error-messages="
                      errors.collect(formFields.tiempoEntrada.id)
                    "
                  />
                </v-flex>
                <v-flex x4 sm4 md4></v-flex>

                <v-flex x2 sm2 md2>
                  <v-btn round color="yellow" @click="setForm()">
                    <v-icon>add</v-icon>
                    Agregar</v-btn
                  >
                </v-flex>
              </v-layout>
              <v-flex xs12 sm12 md12>
                <MantenedorGrid :grid-options="gridOptions" />
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
import { Color, BaseRuta, TipoEventoCopiloto, Ruta } from './rutas';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  RowNode,
} from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { actionsEvent } from '@/setup';
import NumericEditor from '@/reusable/Grid/Editors/NumericEditor.vue';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
    MantenedorGrid,
  },
})
export default class CrearRutaFormEdit extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: (): [] => [] }) rutasDetalles: BaseRuta[];

  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];

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

  /* misc */
  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);
  gridApi: GridApi = null;

  isValidateTP: boolean = false;
  isValidateRM: boolean = false;

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
        cellEditorFramework: NumericEditor,
        field: 'vmax',
      },

      {
        headerName: 'Velocidad mínima',
        cellEditorFramework: NumericEditor,
        field: 'vmin',
      },
      {
        headerName: 'Permite detención',
        field: 'pdetenciontxt',
      },
      {
        headerName: 'Tiempo de permanecia',
        cellEditorFramework: NumericEditor,
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
        cellEditorFramework: NumericEditor,
        field: 'trmensaje',
      },
      {
        headerName: 'Tiempo entrada a geocerca',
        cellEditorFramework: NumericEditor,
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
    this.gridApi.setRowData(this.rutasDetalles || []);
  }

  mounted() {
    if (!this.isVerDetalle) {
      this.getZonas();
      this.setColor();
    }
  }

  created() {
    this.cambio();
    this.isValidateTP = false;
    this.isValidateRM = false;
    const validator = makeValidatorDictionary(this.formFields);
    this.$validator.localize('es', validator);
    if (this.isVerDetalle) {
      this.titulo = 'Ver detalle ruta';
    }
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  handleEliminarClick(params: ICellRendererParams) {
    let deletedRow = params;

    this.gridApi.updateRowData({ remove: [deletedRow] }); // removeItems(row,false);
    this.gridApi.refreshCells();
    this.gridApi.redrawRows();
    let zonaIndex = this.rutasDetalles.indexOf(params.data);
    this.rutasDetalles.splice(zonaIndex, 1);

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
    actionsEvent.onEliminar(this.handleEliminarClick);
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

  async getZonas() {
    this.lsZonas = (await this.fetchZonas()) || [];
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
    ];
  }

  async setForm(): Promise<void> {
    await this.valForm();

    let element = document.getElementById('txtNombre');
    element.setAttribute('disabled', 'disabled');

    if (this.$validator.errors.count() == 0) {
      let zonNombre = this.lsZonas.find(x => x.id == this.formFields.zona.value)
        .nombre;

      let idZona = Number(this.formFields.zona.value);

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
      ];

      this.rutasDetalles.filter(
        e => e.zona !== Number(this.formFields.zona.value)
      );

      // this.lsZonas = this.lsZonas.filter(
      //   (item) => item.id != this.formFields.zona.value
      // );

      this.rutasDetalles.push({
        nombre: this.formFields.nombre.value.toString(),
        zona: Number(this.formFields.zona.value),
        zonaNombre: zonNombre,
        colorHex: this.formFields.color.value.toString(),
        velocidadMinima: Number(this.formFields.vminima.value),
        velocidadMaxima: Number(this.formFields.vmaxima.value),
        pdetenciontxt:
          Boolean(this.formFields.permiteDetencion.value) == true ? 'Sí' : 'No',
        permitirDetencion: Boolean(this.formFields.permiteDetencion.value),
        rmensajetxt:
          Boolean(this.formFields.RepetirMensaje.value) == true ? 'Sí' : 'No',
        repetirMensaje: Boolean(this.formFields.RepetirMensaje.value),
        tiempoMaximo: Number(this.formFields.tiempoPernencia.value),
        tiempoRepetir: Number(this.formFields.tiempoRepeticionMensaje.value),
        horaDesde: this.formFields.horaDesde.value.toString(),
        horaHasta: this.formFields.horaHasta.value.toString(),
        tiempoEntradaGeocerca: Number(this.formFields.tiempoEntrada.value),
        lstTipoEventoCopiloto: this.eventosCopiloto,
        lstRutaEventoMensaje: null,
        id: 0,
        rutaId: 0,
        color: this.formFields.color.value.toString(),
        coordenadaId: Number(this.formFields.zona.value),
      });

      // this.lsZonas = this.lsZonas.filter(
      //   (item) => item.id != this.formFields.zona.value
      // );

      this.gridApi.setRowData(this.rutasDetalles || []);
    }
    this.$emit('changeDatosZonas', this.rutasDetalles);
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

  @Watch('rutasDetalles')
  rutasDetallesChange() {
    if (this.esEditar) {
      this.gridApi.setRowData(this.rutasDetalles || []);

      this.titulo = 'Editar ruta';
      this.formFields.nombre.label = this.rutasDetalles[0].nombre;
      this.formFields.nombre.value = this.rutasDetalles[0].nombre;
    }
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
