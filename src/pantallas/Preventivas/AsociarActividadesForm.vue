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
            <v-layout row wrap>
              <div align="left">
                <v-flex md12>
                  <h2 class="h2_title">Asociar Actividades</h2>
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
                :grid-options="computedGridOptions"
              />
              <AsociacionGrid
                v-else
                :grid-options="computedGridOptions"
                :esEditar="!preventivaSeleccionada ? false : true"
              />
            </div>
          </v-container>
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Actividades Extra Realizadas">
              <slot name="prependActividadesExtra" />
              <v-flex sm12 md12>
                <v-textarea
                  :label="formFields.actividadeExtras.label"
                  :error-messages="
                    errors.collect(formFields.actividadeExtras.id)
                  "
                  :data-vv-name="formFields.actividadeExtras.id"
                  v-model="formFields.actividadeExtras.value"
                  v-validate="'max:1000'"
                  :disabled="readonly"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.horasHombre.label"
                  :error-messages="errors.collect(formFields.horasHombre.id)"
                  :data-vv-name="formFields.horasHombre.id"
                  v-model="formFields.horasHombre.value"
                  v-validate="'max:80|numeric'"
                  :counter="80"
                  :disabled="readonly"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.costoHH.label"
                  :error-messages="errors.collect(formFields.costoHH.id)"
                  :data-vv-name="formFields.costoHH.id"
                  v-model="formFields.costoHH.value"
                  v-validate="'max:80|numeric'"
                  :counter="80"
                  :disabled="readonly"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.costoInsum.label"
                  :error-messages="errors.collect(formFields.costoInsum.id)"
                  :data-vv-name="formFields.costoInsum.id"
                  v-model="formFields.costoInsum.value"
                  v-validate="'max:80|numeric'"
                  :counter="80"
                  :disabled="readonly"
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
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Validator } from 'vee-validate';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  CellValueChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { differenceBy } from 'lodash';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';

import { fetchActividades } from '@/pantallas/Preventivas/fetchActividades';
import { PreventivaNuevo, Actividad } from '@/pantallas/Preventivas/Preventiva';

@Component({
  components: {
    FormFieldsContainer,
    AsociacionGrid,
    BuscadorOperacionCrud,
    MantenedorGridVerDetalle,
    CabeceraTabla,
  },
})
export default class AsociarActividadesForm extends Vue {
  @Prop() preventivaSeleccionada: PreventivaNuevo;
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: 0 }) idPauta: number;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  formFields: FormFieldDefMap = {
    actividadeExtras: {
      label: 'Actividades Extra Realizadas',
      id: 'actividadeExtras',
      value: '',
    },
    horasHombre: {
      label: 'Horas Hombre',
      id: 'horasHombre',
      value: '',
    },
    costoHH: {
      label: 'Costo Horas Hombre',
      id: 'costoHH',
      value: '',
    },
    costoInsum: {
      label: 'Costo Insumos',
      id: 'costoInsum',
      value: '',
    },
  };

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
      },
      {
        headerName: 'Nombre ',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Acción ',
        field: 'accion',
        lockPinned: true,
        width: 200,
        minWidth: 200,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.onSelectionChanged,
  };
  listas: Actividad[] = [];
  listasSeleccionadas: Actividad[] = [];

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* handle */
  @Watch('preventivaSeleccionada', { deep: true })
  handlelistaSeleccionadaChange() {
    const self = this;
    if (!this.preventivaSeleccionada) {
      return;
    }
    this.formFields.actividadeExtras.value = this.preventivaSeleccionada.actividadeExtras;
    this.formFields.horasHombre.value = this.preventivaSeleccionada.horasHombre;
    this.formFields.costoHH.value = this.preventivaSeleccionada.costoHH;
    this.formFields.costoInsum.value = this.preventivaSeleccionada.costoInsum;
    this.actualizadaGrilla(
      this.preventivaSeleccionada.mantenimientoPautaActividadId
    );
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          mantenimientoActividadMantId: this.listasSeleccionadas.map(
            lista => lista.id
          ),
          actividadeExtras: this.formFields.actividadeExtras.value,
          horasHombre: this.formFields.horasHombre.value,
          costoHH: this.formFields.costoHH.value,
          costoInsum: this.formFields.costoInsum.value,
        } as PreventivaNuevo,
      },
      this
    );
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  onSelectionChanged() {
    this.listasSeleccionadas = this.gridApi.getSelectedRows();
    this.handleFormChange();
  }

  @Watch('idPauta', { deep: true })
  async handlePautaChange() {
    if (this.idPauta === 0) {
      return;
    }
    this.actualizadaGrilla(this.idPauta);
  }

  /*template*/

  get computedGridOptions() {
    const {
      gridOptions: { columnDefs },
    } = this;

    return this.gridOptions;
  }

  /* Util */

  async actualizadaGrilla(id: number) {
    const self = this;
    this.listas = (await this.fetchActividades(id)) || [];

    this.gridApi.setRowData(this.listas);

    if (self.preventivaSeleccionada) {
      this.gridApi.forEachNode(function(node: any) {
        var index = self.preventivaSeleccionada.mantenimientoActividadMantId.findIndex(
          x => x == node.data.id
        );
        if (index !== -1) {
          node.setSelected(true);
        }
      });
    }

    if (this.readonly) {
      let seleccionadas: Actividad[] = this.gridApi.getSelectedRows();
      this.gridApi.setRowData(seleccionadas);
    }
  }

  fetchActividades(idLista: number) {
    this.loadingService.showLoading();
    return fetchActividades(idLista)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar las actividades. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  /*Lifecicly Hook */

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleFormChange();
    this.handlelistaSeleccionadaChange();
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
