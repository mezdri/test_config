<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar " @cerrar="handleCerrar">
      <div
        class="numero_sim"
        style="
  
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 16px;
  ;"
      >
        <div class="boton_crear" style="height: 37px;">
          <v-btn
            @click="EditarBaja"
            v-show="estado != 'desactivado'"
            class="icon"
            style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;
  
  margin: 0 0 0 auto;"
          >
            <span style="color: white;" class="color-blanco"
              >Guardar Cambios</span
            >
          </v-btn>
        </div>
      </div>
    </CabeceraModal>

    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />

    <div align="center">
      <v-flex md10>
        <v-card class="rounded-card">
          <v-form ref="form" lazy-validation class="col-md-12">
            <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
              <FormFieldsContainer titulo="Motivo de baja SIM">
                <slot name="prependInformacionGeneral" />

                <v-flex style="display: none;" xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.Id.label"
                    v-model="formFields.Id.value"
                    disbaled
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.Motivo.label"
                    v-model="formFields.Motivo.value"
                    :disabled="estado == 'desactivado'"
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.FechaActual.label"
                    v-model="formFields.FechaActual.value"
                    @change="fechaMaxima"
                    disabled
                  />
                </v-flex>

                <v-flex xs4 sm4 md4>
                  <v-combobox
                    :label="formFields.estado.label"
                    v-model="formFields.estado.value"
                    :items="Listaestado"
                    :disabled="estado == 'desactivado'"
                  />
                </v-flex>
              </FormFieldsContainer>
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

// import AsociarMensajesForm from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesForm.vue';
import AsociarMensajesFormDetalle from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesFormDetalle.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';

import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

import AsociarFlotaEtiquetaVehiculoIndividual from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

import { Vue, Component, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { fetchReportesSerie } from '@/pantallas/Conecta/EditarVehiculos/fetchReporteSerie';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';
import { string } from 'yup';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    CabeceraModalCrear,
    TextField,
    FormFieldsContainer,
    // AsociarMensajesForm,
    AsociarMensajesFormDetalle,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class EditarGrilla extends Vue {
  @Prop({ default: null }) estado: any;
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) Motivo: any; //prop recibe un parametro
  @Prop({ default: null }) motiid: any;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  correcto: boolean = true;

  lstEventoMensajes: any[] = [];

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: '',
      visible: true,
      step: 1,
      title: 'Detalle Motivo de Baja ',
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) nuncaEdit: boolean;
  cambio: boolean = false;
  vr: ValidaRut = new ValidaRut();
  anio: any = '';
  dictionaryFormErrors: any = {};
  marcaslist: any[] = [];
  modelolist: any[] = [];
  Listaestado: string[] = ['Dado de baja', 'Vigente'];
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly funcionalidad: Funcionalidades = Funcionalidades.MotivodeBaja;
  estadolist: any = [];

  userID = JSON.parse(localStorage.getItem('user')).id;

  async EditarBaja() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        motiid: self.formFields.Id.value,
        Motivo: self.formFields.Motivo.value,
        estado: self.formFields.estado.value,
        userID: self.userID,
      },

      'MotivodeBaja/editando_motivobaja'
    )
      .then((data: any) => {
        console.log(data);
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.handleCerrar();
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  CambiandoNombre() {
    if (this.estado == 'vigente') {
      this.formFields.estado.value = 'Vigente';
    } else {
      this.formFields.estado.value = 'Dado de baja';
    }
  }

  get fechaMaxima() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let fechaMax = yyyy + '-' + mm + '-' + dd;
    return fechaMax;
  }

  formFields: FormFieldDefMap = {
    Id: {
      label: 'Id',
      id: this.motiid,
      value: this.motiid,
    },
    Motivo: {
      label: 'Motivo',
      id: this.Motivo,
      value: this.Motivo,
    },
    FechaActual: {
      label: 'Fecha Modificacion',
      id: this.fechaMaxima,
      value: this.fechaMaxima,
    },

    Usuario: {
      label: 'Usuario',
      id: '',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: this.estado,
      value: this.estado,
    },
    fechamodi: {
      label: 'Fecha Modificacion',
      id: 'configid',
      value: '',
    },
    anio: {
      label: '',
      id: '',
      value: '',
    },
  };
  initialize() {
    this.getnumero_usuario();
    this.dictionaryFormErrors = {
      custom: {
        ano: {
          required: () => config.errorMensajes.textoRequerido,
          numeric: config.errorMensajes.soloNumeros,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  mounted() {
    this.initialize();

    this.CambiandoNombre();
    this.getnumero_usuario();
  }
  async getnumero_usuario() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { id: JSON.parse(localStorage.getItem('user')).id },
      'MotivodeBaja/usuario_numero'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.formFields.Usuario.value = data.data.usuario.concat_ws;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  @Watch('ReporteSeleccionado')
  handleRutasSeleccionadas() {
    return;
  }

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>
<style></style>
