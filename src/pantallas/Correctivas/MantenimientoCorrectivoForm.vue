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
            <FormFieldsContainer titulo="Registrar Información">
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.nombre.label"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  :data-testid="`${testId}--cliente-proveedor-gps`"
                  :disabled="readonly"
                  v-model="formFields.nombre.value"
                  v-validate="'required|max:80'"
                  :counter="80"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer>
              <v-flex sm12 md6>
                <v-select
                  :label="formFields.taller.label"
                  :error-messages="errors.collect(formFields.taller.id)"
                  :data-vv-name="formFields.taller.id"
                  :data-testid="`${testId}--taller`"
                  :items="formFields.taller.items"
                  :disabled="readonly"
                  item-text="nombre"
                  item-value="id"
                  v-model="formFields.taller.value"
                  v-validate="'required'"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.responsable.label"
                  :error-messages="errors.collect(formFields.responsable.id)"
                  :data-vv-name="formFields.responsable.id"
                  :data-testid="`${testId}--cliente-proveedor-gps`"
                  :disabled="readonly"
                  v-model="formFields.responsable.value"
                  v-validate="'required|max:80'"
                  :counter="80"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaIngreso.label"
                  :error-messages="errors.collect(formFields.fechaIngreso.id)"
                  :id="formFields.fechaIngreso.id"
                  :test-id="`${testId}--fecha-inicio`"
                  :disabled="readonly"
                  v-model="formFields.fechaIngreso.value"
                  v-validate="'required'"
                />
              </v-flex>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaSalida.label"
                  :error-messages="errors.collect(formFields.fechaSalida.id)"
                  :id="formFields.fechaSalida.id"
                  :test-id="`${testId}--fecha-termino`"
                  :disabled="readonly"
                  :min="fechaMinimaFin.format('YYYY-MM-DD')"
                  v-model="formFields.fechaSalida.value"
                />
              </v-flex>

              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.kilometraje.label"
                  :error-messages="errors.collect(formFields.kilometraje.id)"
                  :data-vv-name="formFields.kilometraje.id"
                  :data-testid="`${testId}--intervalo-transmiciones`"
                  :disabled="readonly"
                  v-model="formFields.kilometraje.value"
                  v-validate="'required|max:80|numeric'"
                  :counter="80"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.horasMotor.label"
                  :error-messages="errors.collect(formFields.horasMotor.id)"
                  :data-vv-name="formFields.horasMotor.id"
                  :data-testid="`${testId}--cantidadActividadesBloque`"
                  :disabled="readonly"
                  v-model="formFields.horasMotor.value"
                  v-validate="'max:80|numeric'"
                  :counter="80"
                />
              </v-flex>
              <v-flex sm12 md4>
                <DatePicker
                  :label="formFields.fechaRealizacion.label"
                  :error-messages="
                    errors.collect(formFields.fechaRealizacion.id)
                  "
                  :id="formFields.fechaRealizacion.id"
                  :test-id="`${testId}--fecha-termino`"
                  :disabled="readonly"
                  :min="fechaMinimaFin.format('YYYY-MM-DD')"
                  v-model="formFields.fechaRealizacion.value"
                />
              </v-flex>
            </FormFieldsContainer>
            <br />
            <v-layout row wrap>
              <div align="left">
                <v-flex md12>
                  <h2 class="h2_title">Seleccionar Actividades Realizadas</h2>
                </v-flex>
              </div>
            </v-layout>
            <v-divider></v-divider>
            <CabeceraTabla>
              <template v-slot:izquierda>
                <BuscadorOperacionCrud
                  :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
                />
              </template>
            </CabeceraTabla>
            <div align="left">
              <MantenedorGridVerDetalle
                v-if="readonly"
                :grid-options="gridOptions"
                :row-data="actividades"
              />
              <MantenedorGrid
                v-else
                :grid-options="gridOptions"
                :row-data="actividades"
              />
            </div>
            <br />
            <FormFieldsContainer titulo="Actividades Extras">
              <v-flex sm12 md12>
                <v-textarea
                  :label="formFields.actividadesExtras.label"
                  :error-messages="
                    errors.collect(formFields.actividadesExtras.id)
                  "
                  :data-vv-name="formFields.actividadesExtras.id"
                  :disabled="readonly"
                  v-model="formFields.actividadesExtras.value"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.horasHombre.label"
                  :error-messages="errors.collect(formFields.horasHombre.id)"
                  :data-vv-name="formFields.horasHombre.id"
                  :disabled="readonly"
                  v-model="formFields.horasHombre.value"
                  v-validate="'max:80|numeric'"
                  :counter="80"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.costoHorasHombre.label"
                  :error-messages="
                    errors.collect(formFields.costoHorasHombre.id)
                  "
                  :data-vv-name="formFields.costoHorasHombre.id"
                  :data-testid="`${testId}--cantidadActividadesBloque`"
                  :disabled="readonly"
                  v-model="formFields.costoHorasHombre.value"
                  v-validate="'max:80|numeric'"
                  :counter="80"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.costoInsumos.label"
                  :error-messages="errors.collect(formFields.costoInsumos.id)"
                  :data-vv-name="formFields.costoInsumos.id"
                  :data-testid="`${testId}--cantidadActividadesBloque`"
                  :disabled="readonly"
                  v-model="formFields.costoInsumos.value"
                  v-validate="'max:80|numeric'"
                  :counter="80"
                />
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { debounce } from 'lodash';
import moment from 'moment';

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import TextField from '@/reusable/Form/TextField.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  FormState as BaseFormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import {
  ClienteProveedorGps,
  fetchClientesProveedorGps,
} from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import AgregarButton from '@/reusable/Grid/AgregarButton.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import { Correctiva } from '@/pantallas/Correctivas/Data/Correctiva';
import { GridReadyEvent, GridApi, GridOptions } from 'ag-grid-community';
import { checkboxColumnDef } from '../../reusable/Grid/aggridColumnDefUtils';
import { fetchActividades } from './Data/fetchActividades';
import { ActividadesCorrectivas } from './Data/Correctiva';
import { TallerMantenimiento } from '@/reusable/TalleresMantenimientos/talleresMantenimiento';
import { intersectionBy } from 'lodash';
import {
  fetchTalleres,
  Taller,
} from '@/pantallas/Correctivas/Data/fetchTalleres';

export interface MantenimientoCorrectivaFormState extends BaseFormState {
  entity: Pick<Correctiva, Exclude<keyof Correctiva, 'id'>>;
}

@Component({
  components: {
    DatePicker,
    TextField,
    FormFieldsContainer,
    StepTitle,
    BuscadorOperacionCrud,
    AgregarButton,
    CabeceraTabla,
    MantenedorGrid,
    MantenedorGridVerDetalle,
  },
})
export default class MantenimientoCorrectivoForm extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: null }) correctivoSeleccionado: Correctiva;

  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    taller: {
      label: 'Seleccionar Taller',
      id: 'taller',
      value: '',
      items: [],
    },
    responsable: {
      label: 'Responsable',
      id: 'responsable',
      value: '',
    },
    fechaIngreso: {
      label: 'Fecha de Ingreso a Taller',
      id: 'fechaIngreso',
      value: null,
    },
    fechaSalida: {
      label: 'Fecha de Salida Taller',
      id: 'fechaSalida',
      value: null,
    },
    kilometraje: {
      label: 'Kilometraje',
      id: 'kilometraje',
      value: '',
    },
    horasMotor: {
      label: 'Horas de Motor',
      id: 'horasMotor',
      value: '',
    },
    fechaRealizacion: {
      label: 'Fecha Realización',
      id: 'fechaRealizacion',
      value: null,
    },
    actividadesExtras: {
      label: 'Actividad Extra Realizada',
      id: 'actividadesExtras',
      value: null,
    },
    horasHombre: {
      label: 'Horas Hombre',
      id: 'horasHombre',
      value: null,
    },
    costoHorasHombre: {
      label: 'Costo Horas Hombre',
      id: 'costoHorasHombre',
      value: null,
    },
    costoInsumos: {
      label: 'Costo Insumos',
      id: 'costosInsumos',
      value: null,
    },
  };

  fechaMinimaInicio: moment.Moment = moment();
  fechaMaximaInicio: moment.Moment = null;
  fechaMinimaFin: moment.Moment = moment();
  fechaMaximaFin: moment.Moment;

  gridApi: GridApi = null;
  gridApiRO: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.estado);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        minWidth: 80,
      },
      {
        headerName: 'Nombre',
        field: 'nombreActividad',
        lockVisible: true,
        width: 200,
        minWidth: 200,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.onSelectionChanged,
  };

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  clientesProveedorGps: Promise<ClienteProveedorGps[]> = null;
  actividades: ActividadesCorrectivas[] = [];
  taller: Taller[] = [];
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  created() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.cargarListaTalleres();
    this.handleCorrectivoSeleccionado();
  }

  @Watch('correctivoSeleccionado', { deep: true })
  handleCorrectivoSeleccionado() {
    if (!this.correctivoSeleccionado) {
      return;
    }
    this.formFields.nombre.value = this.correctivoSeleccionado.nombre;
    this.formFields.taller.value = this.correctivoSeleccionado.taller;
    this.formFields.fechaIngreso.value = this.correctivoSeleccionado.fechaIngreso;
    this.formFields.fechaSalida.value = this.correctivoSeleccionado.fechaSalida;
    this.formFields.kilometraje.value = this.correctivoSeleccionado.kilometraje;
    this.formFields.horasMotor.value = this.correctivoSeleccionado.horasMotor;
    this.formFields.responsable.value = this.correctivoSeleccionado.responsable;
    this.formFields.actividadesExtras.value = this.correctivoSeleccionado.actividadesExtras;
    this.formFields.horasHombre.value = this.correctivoSeleccionado.horasHombre;
    this.formFields.costoHorasHombre.value = this.correctivoSeleccionado.costoHoraHombre;
    this.formFields.costoInsumos.value = this.correctivoSeleccionado.costoInsumos;
    this.formFields.fechaRealizacion.value = this.correctivoSeleccionado.fechaRealizacion;

    if (this.readonly) {
      this.formFields.costoHorasHombre.value = this.correctivoSeleccionado
        .costoHoraHombre
        ? `$ ${this.correctivoSeleccionado.costoHoraHombre.toLocaleString()}`
        : '';
      this.formFields.costoInsumos.value = this.correctivoSeleccionado
        .costoInsumos
        ? `$ ${this.correctivoSeleccionado.costoInsumos.toLocaleString()}`
        : '';
    }
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    const { formFields } = this;
    const taller = formFields.taller.items.find(
      x => x.id === formFields.taller.value
    );

    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: formFields.nombre.value,
          taller: formFields.taller.value,
          fechaIngreso: formFields.fechaIngreso.value,
          fechaSalida: formFields.fechaSalida.value,
          kilometraje: formFields.kilometraje.value,
          horasMotor: formFields.horasMotor.value,
          responsable: formFields.responsable.value,
          actividadesExtras: formFields.actividadesExtras.value,
          horasHombre: formFields.horasHombre.value,
          costoHoraHombre: formFields.costoHorasHombre.value,
          costoInsumos: formFields.costoInsumos.value,
          fechaRealizacion: formFields.fechaRealizacion.value,
        },
      },
      this
    );
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.actividades = (await this.fetchActividadesCorrectivas()) || [];
    this.setActividadesSeleccionadas();
  }

  async handleGridReadyRO(event: GridReadyEvent) {
    this.gridApiRO = event.api;
  }

  setActividadesSeleccionadas() {
    if (!this.correctivoSeleccionado) {
      return;
    }

    this.actividades = intersectionBy(
      [
        ...this.correctivoSeleccionado.actividades.map(
          actividadSeleccionada => {
            const actividad = this.actividades.find(
              x => x.id === actividadSeleccionada.id
            );
            return {
              ...actividadSeleccionada,
              nombreActividad: actividad
                ? actividad.nombreActividad
                : actividadSeleccionada.nombreActividad,
            };
          }
        ),
        ...this.actividades,
      ],
      (actividad: ActividadesCorrectivas) => actividad.id
    );

    setTimeout(() => {
      this.gridApi.forEachNode(nodo => {
        const seleccionada = this.correctivoSeleccionado.actividades.find(
          x => x.id === nodo.data.id
        );

        nodo.setSelected(seleccionada ? true : false);

        if (this.readonly) {
          this.actividades = this.gridApi.getSelectedRows();
        }
      });
    });
  }

  makePautaActividadesMantenimiento(
    rowData: ActividadesCorrectivas
  ): ActividadesCorrectivas {
    return {
      id: rowData.id,
      nombreActividad: rowData.nombreActividad,
    };
  }

  onActividadesChange() {
    const actividades: ActividadesCorrectivas[] = this.gridApi
      .getSelectedNodes()
      .map(node => this.makePautaActividadesMantenimiento(node.data));
    this.$emit('actividadesChange', actividades);
  }

  onSelectionChanged() {
    this.onActividadesChange();
  }

  fetchActividadesCorrectivas() {
    return fetchActividades().catch(() => {
      this.$snotify.error(
        'Ha ocurrido un error al intentar obtener las actividades',
        { timeout: 3000 }
      );
      return [];
    });
  }

  async cargarListaTalleres() {
    let talleres: any = (await this.fetchTalleres()) || [];
    this.taller = talleres.data;
    this.formFields.taller.items = this.taller;
  }

  fetchTalleres() {
    this.loadingService.showLoading();
    return fetchTalleres()
      .catch(() => {
        this.$snotify.error(
          `Ha ocurrido un error al intentar obtener los talleres`,
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
