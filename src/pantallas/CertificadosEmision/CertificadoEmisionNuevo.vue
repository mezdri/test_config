<template>
  <div>
    <ModalMantenedor :show="mostrarModal">
      <CabeceraModalCrear
        :titulo="'Certificado Emisión'"
        @cerrar="handleCerrar"
        v-if="!mostrarPDF"
      >
        <NavegacionModalCrud
          v-model="pasoActivoIndex"
          :pasos="pasos"
          @guardar="handleGuardar"
        />
      </CabeceraModalCrear>

      <v-stepper v-model="pasoActivoIndex" v-if="!mostrarPDF">
        <CrudStepperHeader
          :pasos="pasos"
          :paso-activo-index="pasoActivoIndex"
        />
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <div align="center">
            <v-flex md10>
              <v-card class="rounded-card">
                <v-container grid-list-md>
                  <v-form class="col-md-12">
                    <v-select
                      v-model="formFields.tipocertificado.value"
                      :label="formFields.tipocertificado.label"
                      :items="listatipocertificado"
                      item-text="nombre"
                      item-value="id"
                      prepend-icon="find_in_page"
                      @seleccionarCertificado="
                        handleFormChangeSeleccionCertificado
                      "
                    />
                  </v-form>
                </v-container>
              </v-card>
            </v-flex>
          </div>

          <AsociarFlotaEtiquetaVehiculoIndividual
            :col-def-vehiculo="vehiculoColDefs"
            @change="handleAsociacionesChange"
          />
        </CrudStepperContent>

        <CrudStepperContent :paso="pasos.visualizacionCertificado">
          <div>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex md10>
                  <v-card
                    class="rounded-card mb-3"
                    v-for="(item, index) in htmlTemplate"
                    :key="index"
                  >
                    <v-container grid-list-md>
                      <v-form class="col-md-12">
                        <div v-html="item.template"></div>
                      </v-form>
                    </v-container>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
        </CrudStepperContent>
      </v-stepper>

      <Confirmation
        :show="dialogConfirmacionGuardar"
        :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Certificado' })"
        :mensaje="mensajeConfirmacion"
        v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
        :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
        :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
      ></Confirmation>

      <div id="CertificadoPDF" v-if="mostrarPDF">
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex md10>
              <v-card class="rounded-card mb-3">
                <v-container grid-list-md>
                  <v-btn
                    depressed
                    color="primary"
                    elevation="2"
                    @click="IraEmision"
                  >
                    Salir
                  </v-btn>
                  <v-form class="col-md-12">
                    <embed
                      class="mipdf"
                      :src="urlPdf"
                      type="application/pdf"
                      width="100%"
                      height="600px"
                    />
                  </v-form>
                </v-container>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </div>
    </ModalMantenedor>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import Confirmation from '@/components/Confirmation.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

import { Watch } from 'vue-property-decorator';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

import config from '@/config/index';

import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

import {
  fetchTipoCertificado,
  TipoCertificado,
} from '@/pantallas/CertificadosEmision/fetchTipoCertificadoEmision';

import { ColDef } from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    GuardarButton,
    Confirmation,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoIndividual,
    FormFieldsContainer,
    // ComandoVelocidadAsignacion,
  },
})
export default class CertificadoEmisionNuevo extends Vue {
  @Prop({ default: false }) mostrarModalPantalla: boolean;

  listatipocertificado: TipoCertificado[] = [];
  readonly Controller: string = 'Certificados';
  readonly estaPantalla: string = 'PantallaHija';

  htmlTemplate: string[] = [];
  urlPdf: string = null;
  clienteId: number = config.getClienteSesion();
  lsVehiculo: any = null;
  mostrarPDF: boolean = false;
  mostrarHTML: boolean = true;
  mostrarModal: boolean = false;
  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    asociarVehiculos: {
      accion: 'otro',
      visible: true,
      step: 1,
      title: 'Asociar Flotas Etiquetas o Vehículos',
      icon: 'directions_car',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },

    visualizacionCertificado: {
      accion: 'otro2',
      visible: true,
      step: 2,
      title: 'Vista previa',
      icon: 'directions_car',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.asociarVehiculosPermitirContinuar;
    this.pasos.visualizacionCertificado.permitirContinuar = this.visualizacionCertificadoPermitirContinuar;
    this.obtieneFechaCertificado();
  }

  @Watch('mostrarModalPantalla')
  CambiarPropiedadMostrarModal() {
    console.log('mostrarModalPantalla----->>' + this.mostrarModalPantalla);
    this.mostrarModal = this.mostrarModalPantalla;
  }

  IraEmision() {
    //this.$router.push('/emitir-certificado');
    this.pasoActivoIndex = 1;
    this.mostrarPDF = false;
    this.mostrarModal = false;
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.mostrarPDF = false;
    this.mostrarModal = false;
    this.$emit('mostrarModalPantalla', false);
  }

  visualizacionCertificadoPermitirContinuar() {
    console.log('visualizacionCertificadoPermitirContinuar');
    return true;
  }

  asociarVehiculosPermitirContinuar() {
    if (
      typeof this.idTipoCertificado === 'undefined' ||
      this.asociacionesVehiculos.vehiculos.length +
        this.asociacionesVehiculos.etiquetas.length +
        this.asociacionesVehiculos.flotas.length ===
        0
    ) {
      return false;
    } else {
      this.handleCertificadoPreview();
      return true;
    }
  }
  formFields: FormFieldDefMap = {
    tipocertificado: {
      label: 'Tipo Certificado',
      id: 'IdTipoCertificado',
      value: '',
    },
  };

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  mensajeConfirmacion: any = '';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  EmisionSeleccion: boolean = true;
  /*Valores de envio al servicio*/
  idTipoCertificado: number;

  /* validacion */
  showValidacion: boolean = false;
  showValidacionLineal: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  itemsNoValidos: string[] = [];
  isValidCamposZonas = true;
  showAsociarVehiculos = true;
  camposZonaEmpty: any = '';

  asociacionesVehiculos: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  vehiculoColDefs: ColDef[] = [
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      lockPinned: true,
    },
    {
      headerName: 'Flota',
      field: 'flota.nombre',
    },
  ];
  axiosCertificadoEmision: AxiosVue = new AxiosVue(ServicioProxy.Comercial);

  @Watch('formFields', { deep: true })
  handleFormChangeSeleccionCertificado() {
    this.idTipoCertificado = parseInt(
      this.formFields.tipocertificado.value.toString()
    );
  }

  async obtieneFechaCertificado() {
    this.listatipocertificado = (await this.fetchTipoCertificado()) || [];
  }

  fetchTipoCertificado() {
    // this.loadingService.showLoading();
    return fetchTipoCertificado()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los dispositivos',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociacionesVehiculos = event;
  }

  PermiteContinuarAsociarEvento() {
    this.mensajeValidacion = '';
    this.itemsNoValidos = [];
    return true;
  }

  PermiteContinuarAsociarVehiculo() {
    return true;
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  obtieneListaVehiculosEtiquetaFlota() {
    this.lsVehiculo = null;

    this.loadingService.showLoading();

    this.lsVehiculo = [];
    if (this.asociacionesVehiculos.vehiculos.length) {
      this.lsVehiculo = [];
      for (let z = 0; z < this.asociacionesVehiculos.vehiculos.length; z++) {
        this.lsVehiculo.push({
          Id: this.asociacionesVehiculos.vehiculos[z].id,
          TipoID: 'V',
        });
      }
    }
    if (this.asociacionesVehiculos.flotas.length) {
      for (let z = 0; z < this.asociacionesVehiculos.flotas.length; z++) {
        this.lsVehiculo.push({
          Id: this.asociacionesVehiculos.flotas[z].id,
          TipoID: 'F',
        });
      }
    }

    if (this.asociacionesVehiculos.etiquetas.length) {
      for (let z = 0; z < this.asociacionesVehiculos.etiquetas.length; z++) {
        this.lsVehiculo.push({
          Id: this.asociacionesVehiculos.etiquetas[z].id,
          TipoID: 'E',
        });
      }
    }
  }

  async handleCertificadoPreview() {
    try {
      console.log('--------->previsualizar'); // borrar despues de las prubas
      this.obtieneListaVehiculosEtiquetaFlota();
      const certificados = await this.axiosCertificadoEmision.http.post(
        `CertificadoEmision/PostGeneraCertificado/${this.idTipoCertificado}`,
        this.lsVehiculo
      );
      this.htmlTemplate = certificados.data;
    } catch (error) {
      this.$snotify.error(
        'Ha ocurrido un error al intentar generar vista previa de los certificados',
        {
          timeout: 2000,
        }
      );
    } finally {
      this.loadingService.hideLoading();
      this.$snotify.success('Generando vista previa de los certificados', {
        timeout: 2000,
      });
    }
  }

  async handleConfirmacionGuardar(val: boolean) {
    if (!val) {
      this.dialogConfirmacionGuardar = false;
    } else {
      try {
        this.obtieneListaVehiculosEtiquetaFlota();
        const certificadosPDF = await this.axiosCertificadoEmision.http.post(
          `CertificadoEmision/PostGeneraCertificadoPDF/${this.idTipoCertificado}`,
          this.lsVehiculo,
          { responseType: 'arraybuffer' }
        );
        var file = new Blob([certificadosPDF.data], {
          type: 'application/pdf',
        });
        if (file.size > 0) {
          var fileURL = URL.createObjectURL(file);

          this.urlPdf = fileURL;
          this.mostrarPDF = true;
        }
      } catch (error) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar generar los certificados',
          {
            timeout: 2000,
          }
        );
      } finally {
        this.loadingService.hideLoading();
        this.$snotify.success('Generando certificados', {
          timeout: 2000,
        });
      }
    }
  }

  async handleContinuar() {
    console.log('Certificado de emision nuevo --> handleContinuar ');
  }

  async handleGuardar() {
    const isValid = true;
    this.mensajeConfirmacion =
      '¿Está seguro que desea generar este certificado? ';
    if (isValid) {
      this.dialogConfirmacionGuardar = true;
    }
  }
}
</script>
