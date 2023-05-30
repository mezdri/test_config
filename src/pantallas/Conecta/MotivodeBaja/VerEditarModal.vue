<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Crear" @cerrar="handleCerrar">
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
            class="icon"
            style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;

margin: 0 0 0 auto;"
          >
            <span style="color: white;" class="color-blanco" @click="guardar"
              >Guardar</span
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

                <v-flex style="display:none" xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.Id.label"
                    v-model="formFields.Id.value"
                    disabled
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.Motivo.label"
                    v-model="formFields.Motivo.value"
                    :value="Motivo"
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
                <v-flex style="display:none" xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.Usuario.label"
                    v-model="formFields.Usuario.value"
                    disabled
                  />
                </v-flex>
                <v-flex style="display:none" xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.fechamodi.label"
                    v-model="formFields.fechamodi.value"
                    disabled
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.estado.label"
                    v-model="formFields.estado.value"
                    disabled
                    :items="modelolist"
                    item-text="configvalor"
                    item-value="configid"
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
export default class VerEditarModal extends Vue {
  @Prop({ default: null }) Motivo: any;
  @Prop({ default: true }) show: boolean;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  correcto: boolean = true;
  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

  idRuta: number = null;
  demo: any = {};

  lstEventoMensajes: any[] = [];

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Editar Vehiculos',
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
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly funcionalidad: Funcionalidades = Funcionalidades.MotivodeBaja;
  estadolist: any = [];
  fecha_sim: any = '';
  evt: any;

  userID = JSON.parse(localStorage.getItem('user')).id;

  guardar() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        id: self.formFields.Id.value,
        Motivo: self.formFields.Motivo.value,
        userID: self.userID,
      },
      'MotivodeBaja/Creando'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          self.handleCerrar();
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
      id: '',
      value: '',
    },
    Motivo: {
      label: 'Motivo',
      id: '',
      value: '',
    },
    FechaActual: {
      label: 'Fecha Creacion',
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
      id: '',
      value: 'Vigente',
    },
    fechamodi: {
      label: 'Fecha Modificacion',
      id: 'configid',
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
          self.formFields.Id.value = Number(data.data.numero.max) + 1;
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
