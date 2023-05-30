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
              <!-- <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  @change="cambioEstadoSwitch"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.activo.id)"
                  :data-vv-name="formFields.activo.id"
                  :hint="mensajeEstado"
                  persistent-hint
                  :readonly="isVerDetalle"
                />
              </v-flex>-->
              <v-flex xs12 sm12 md12>
                <CampoUnico
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :id="formFields.nombre.id"
                  counter="80"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :validate="validarNombreLista"
                  message=" Ya existe una Lista de Distribución con este nombre."
                ></CampoUnico>
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.descripcion.label"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  v-validate="'required|max:200'"
                  :counter="200"
                  :disabled="isVerDetalle"
                />
              </v-flex>
            </FormFieldsContainer>
            <br />
            <v-layout row wrap>
              <div align="left">
                <v-flex md12>
                  <h2 class="h2_title">Lista de Contactos</h2>
                </v-flex>
              </div>
            </v-layout>
            <v-divider></v-divider>
            <v-layout row wrap>
              <v-flex xs12 sm12 md6>
                <BuscadorOperacionCrud
                  :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
                  prepend="person"
                />
              </v-flex>
            </v-layout>
            <div align="left">
              <MantenedorGridVerDetalle
                v-if="isVerDetalle"
                :grid-options="computedGridOptions"
              />
              <AsociacionGrid
                v-else
                :grid-options="computedGridOptions"
                :esEditar="!listaSeleccionada ? false : true"
              />
              <!-- <MantenedorGrid :grid-options="computedGridOptions" /> -->
            </div>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import SwitchForm from '@/reusable/Form/SwitchForm.vue';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import { fetchContactosAsociados } from '@/pantallas/ListaDistribucion/fetchContactosUsuarios';
import {
  emitFormChangeEvent,
  FormChangeEvent,
  formErrors,
  FormErrors,
  FormFieldDefMap,
  FormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  ListaDistribucion,
  ListaDistribucionNueva,
  ContactoAsociado,
} from '@/pantallas/ListaDistribucion/ListaDistribucion';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  CellValueChangedEvent,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
} from '@/reusable/Grid/aggridColumnDefUtils';
import CampoUnico, { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';

import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { differenceBy } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

@Component({
  components: {
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
    CabeceraTabla,
    CampoUnico,
    MantenedorGridVerDetalle,
    AsociacionGrid,
  },
})
export default class ListaDistribucionForm extends Vue {
  @Prop() listaSeleccionada: ListaDistribucion;
  @Prop({ default: false }) isVerDetalle: boolean;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  uniqueFieldRule = uniqueFieldRule;
  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    // activo: {
    //   label: 'Activo',
    //   id: 'activo',
    //   value: 'false',
    // },
  };

  axios = new AxiosVue(ServicioProxy.Contacto);

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre ',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Tipo ',
        field: 'tipoText',
        lockPinned: true,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Correo Electrónico',
        field: 'correo',
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.onSelectionChanged,
  };
  listas: ContactoAsociado[] = [];
  listasSeleccionadas: ContactoAsociado[] = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* handle */
  @Watch('listaSeleccionada', { deep: true })
  handlelistaSeleccionadaChange() {
    if (!this.listaSeleccionada) {
      this.actualizadaGrilla(0);
      return;
    }
    this.formFields.nombre.value = this.listaSeleccionada.nombre;
    //this.formFields.activo.value = this.listaSeleccionada.estado;
    this.formFields.descripcion.value = this.listaSeleccionada.descripcion;
    //this.cambioEstadoSwitch(this.formFields.activo.value);
    this.actualizadaGrilla(this.listaSeleccionada.id);
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        nombre: this.formFields.nombre.value,
        estado: true,
        descripcion: this.formFields.descripcion.value,
        listaTodosServ: this.listasSeleccionadas,
      } as ListaDistribucionNueva,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  onSelectionChanged() {
    let asociados: ContactoAsociado[] = this.gridApi.getSelectedRows();
    const conSeleccionados = asociados.map(con => ({ ...con, estado: 'S' }));

    const conNoSeleccionados = differenceBy(
      this.listas,
      conSeleccionados,
      con => con.correo
    ).map(con => ({
      ...con,
      estado: 'N',
    }));

    if (!this.listaSeleccionada) {
      this.listasSeleccionadas = asociados.map(con => ({
        ...con,
        estado: 'S',
      }));
    } else {
      this.listasSeleccionadas = [];
      this.listasSeleccionadas = conSeleccionados.concat(conNoSeleccionados);
    }

    this.handleFormChange();
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

  cambioEstadoSwitch(isActivo: boolean) {
    this.fields[this.formFields.activo.id].dirty = true;
    this.handleFormChange();
    if (isActivo) {
      this.mensajeEstado = '';
      this.formFields.activo.label = 'Activo';
    } else {
      this.mensajeEstado =
        'Al dejar como inactivo, no se podrán realizar asociaciones.';
      this.formFields.activo.label = 'Inactivo';
    }
    this.$emit('estadoSwitch', isActivo);
  }

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleFormChange();
    this.handlelistaSeleccionadaChange();
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
    this.listas = (await this.fetchContactosAsociados(id)) || [];
    const seleccionadas = this.listas.filter(lista => lista.estado == 'S');

    if (this.isVerDetalle) {
      this.listas = seleccionadas;
    }

    this.gridApi.setRowData(this.listas);

    this.gridApi.forEachNode(function(node: any) {
      var index = seleccionadas.findIndex(x => x.correo == node.data.correo);
      if (index !== -1) {
        node.setSelected(true);
      }
    });
  }

  fetchContactosAsociados(idLista: number) {
    this.loadingService.showLoading();
    return fetchContactosAsociados(idLista)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el listado de contactos y usuarios. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  validarNombreLista(nombre: string) {
    const axios = new AxiosVue(ServicioProxy.Contacto);
    const id =
      this.listaSeleccionada === undefined ? 0 : this.listaSeleccionada.id;
    return axios.http.get(
      `ListaDistribucionB/ChequearNombreUnico/${id}/${nombre}/${config.getClienteSesion()}`
    );
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
