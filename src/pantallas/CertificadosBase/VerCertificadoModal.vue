<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Configuración Base"
      @cerrar="handleCerrar"
    >
    </CabeceraModal>
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <ConfigurarCertificadoForm
        :certificadoSeleccionado="certificadoSeleccionado"
        @change="handleFormChange"
        @handleFormChange="handleFormChange"
        @handleLogoTercero="handleLogoChange"
        v-show="pasoActivoIndex === pasos.configurarCertificado.step"
        :modoVer="true"
      />
      <ConfigurarCertificadoFormTexto
        :certificadoSeleccionado="certificadoSeleccionado"
        @handleTexto="handleTextoChange"
        @handleFormTextoChange="handleFormTextoChange"
        v-if="pasoActivoIndex === pasos.editarTexto.step"
        :modoVer="true"
      />
      <ConfigurarCertificadoFormGps
        :certificadoSeleccionado="certificadoSeleccionado"
        @handleFormGps="handleFormGps"
        v-if="pasoActivoIndex === pasos.gpsVehiculo.step"
        :modoVer="true"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import SeleccionarCodigosForm from '@/pantallas/ConfigurarBase/SeleccionarCodigosForm.vue';
import AgregarCamposGrid from '@/pantallas/ConfigurarBase/AgregarCamposGrid.vue';
import ValidacionExtendidaForm from '@/pantallas/ConfigurarBase/ValidacionExtendidaForm.vue';
import HtmlTemplateForm from '@/pantallas/ConfigurarBase/HtmlTemplateForm.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';

import { Component, Prop, Watch } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import ConfigurarCertificadoForm from '@/pantallas/CertificadosBase/ConfigurarCertificadoForm.vue';
import ConfigurarCertificadoFormTexto from '@/pantallas/CertificadosBase/ConfigurarCertificadoFormTexto.vue';
import ConfigurarCertificadoFormGps from '@/pantallas/CertificadosBase/ConfigurarCertificadoFormGps.vue';

import { Validator } from 'vee-validate';

import { AlertaBackend } from '@/interfaces/Alertas';

import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import AsociarFlotaEtiquetaVehiculoXMantenimiento from '@/pantallas/Informes/partes/AsociarFlotaEtiquetaVehiculoXMantenimiento.vue';
import { fetchTiposCertificados } from './fetchTiposCertificados';
import {
  Anexo,
  Anio,
  CertificadoBaseBackend,
  CertificadoBaseCliente,
  Contenido,
  InformacionGps,
  InformacionVehiculo,
  Marca,
  Modelo,
  Serie,
  TipoGps,
  TipoVehiculo,
  Texto,
  Gps,
  makepasosCertificadoBaseEditar,
} from '@/pantallas/CertificadosBase/ConfiguracionBase';

type CrearFormState = {
  entity: Texto;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    ConfigurarCertificadoForm,
    ConfigurarCertificadoFormTexto,
    ConfigurarCertificadoFormGps,
    MensajeValidacion,
  },
})
export default class VerCertificadoModal extends OperacionCrud {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) certificadoSeleccionado: CertificadoBaseCliente;
  //@Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Alertas;
  permisosActuales: PermisoAccionVm[] = [];

  pasos: PasosCrud = makepasosCertificadoBaseEditar();

  // Variables Globales
  readonly $snotify: Snotify;
  pasoActivoIndex: number = 1;
  isValidCampos = true;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  axios: AxiosVue = new AxiosVue(ServicioProxy.Comercial);
  loadingService = new LoadingService();
  tipoBase: number = -1;

  showContinuar: boolean = true;
  showVolver: boolean = false;

  certificado: CertificadoBaseBackend = {};

  certificadoCliente: CertificadoBaseCliente = {};
  contenido: Contenido = {};
  informacionVehiculo: InformacionVehiculo = {};
  marca: Marca = {};
  modelo: Modelo = {};
  anio: Anio = {};
  tipoVehiculo: TipoVehiculo = {};
  informacionGps: InformacionGps = {};
  serie: Serie = {};
  tipoGps: TipoGps = {};
  anexo: Anexo = {};

  /* validacion */
  showValidacion: boolean = false;
  showValidacionLineal: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  itemsNoValidos: string[] = [];
  isValidCamposZonas = true;
  showAsociarVehiculos = true;
  showEditarTexto = true;
  showAsociarGpsVehiculo = true;

  tipoNotificacionSeleccionado: number = 1;
  listaDistribucionSeleccionados: number[] = [];
  contactosSeleccionados: number[] = [];
  idsPlanesSeleccionados: number[] = [];
  usuariosSeleccionados: number[] = [];
  camposZonaEmpty: any = '';
  logo: any = '';
  texto: any;

  oTexto?: Texto = {};
  oGps?: Gps = {};

  //controllers
  readonly Controller: string = 'CertificadosBase';

  //lstTiposCertificados : TiposCertificadosBackend[]=[];

  constructor() {
    super();

    this.pasos.configurarCertificado.permitirContinuar = this.permitirContinuarConfigurarCertificado;
    this.pasos.editarTexto.permitirContinuar = this.permitirContinuarEditarTexto;
    this.pasos.gpsVehiculo.permitirContinuar = this.permitirContinuarGpsVehiculo;
  }

  @Watch('certificadoSeleccionado', { deep: true })
  handleCertificadoSeleccionadoChange() {
    if (this.certificadoCliente) {
      //this.certificadoCliente = this.certificadoSeleccionado;
      this.certificadoCliente.id = this.certificadoSeleccionado.id;
      this.certificadoCliente.nombre = this.certificadoSeleccionado.nombre;
      this.certificadoCliente.tipoCertificadoId = this.certificadoSeleccionado.tipoCertificadoId;
      this.certificadoCliente.firmaCertificadoId = this.certificadoSeleccionado.firmaCertificadoId;
      this.certificadoCliente.estado = this.certificadoSeleccionado.estado;
      this.certificadoCliente.contenido = this.certificadoSeleccionado.contenido;
      this.certificadoCliente.contenido.logoTercero = this.certificadoSeleccionado.contenido.logoTercero;
      this.certificadoCliente.contenido.informacionVehiculo = this.certificadoSeleccionado.contenido.informacionVehiculo;
      this.certificadoCliente.contenido.informacionGps = this.certificadoSeleccionado.contenido.informacionGps;
    }
  }

  created() {
    //this.chequearPermisos();
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.showContinuar = true;
    this.showVolver = false;
    this.$validator.reset();
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.$validator.reset();
    this.$emit('cerrar');
  }

  // async handleGuardar() {
  //   const isValid = true;//await this.pasos.configurarCertificado.formState.validator.validateAll();
  //   if (isValid) {
  //     // this.handleEstadoSwitch(
  //     //   this.pasos.configurarCertificado.formState.entity.estado
  //     // );

  //     //this.handleFormGpsChange;
  //     this.handleFormTextoChange;
  //     this.dialogConfirmacionGuardar = true;
  //   }
  // }

  handleGuardar() {
    var isCamposValidos = true;
    this.loadingService.showLoading();
    var configurarCertificadoForm = this.pasos.configurarCertificado.formState
      .entity;
    // var textoForm = this.pasos.editarTexto.formState.entity;
    // var gpsForm = this.pasos.gpsVehiculo.formState.entity;

    //var texto = this.pasos.editarTexto.formState.entity;

    //var notificarForm = this.pasos.configurarNotificaciones.formState.entity;
    configurarCertificadoForm.logoTercero = this.logo;

    var certificadoEditado: CertificadoBaseCliente = {};

    this.tipoBase = this.certificadoSeleccionado.id;
    certificadoEditado.id = this.certificadoSeleccionado.id;
    certificadoEditado.nombre = configurarCertificadoForm.nombre; //configurarCertificadoForm;
    certificadoEditado.tipoCertificadoId =
      configurarCertificadoForm.tipoCertificado;
    certificadoEditado.firmaCertificadoId =
      configurarCertificadoForm.firmaCertificado;
    certificadoEditado.estado = configurarCertificadoForm.activo;
    certificadoEditado.contenido = this.contenido;
    certificadoEditado.contenido.codigoQr = configurarCertificadoForm.qr;
    certificadoEditado.contenido.fechaExpiracion =
      configurarCertificadoForm.expiracion == '1' ? true : false;
    certificadoEditado.contenido.logoTercero =
      configurarCertificadoForm.logoTercero;
    certificadoEditado.contenido.glosa = this.certificadoCliente.contenido.glosa;
    certificadoEditado.contenido.anexo = this.anexo;
    certificadoEditado.contenido.anexo.visible = this.certificadoCliente.contenido.anexo.visible;
    certificadoEditado.contenido.anexo.contenido = this.certificadoCliente.contenido.anexo.contenido;

    certificadoEditado.contenido.informacionVehiculo = this.informacionVehiculo;

    certificadoEditado.contenido.informacionVehiculo.visible = this.certificadoCliente.contenido.informacionVehiculo.visible;

    certificadoEditado.contenido.informacionVehiculo.marca = this.marca;
    certificadoEditado.contenido.informacionVehiculo.marca.visible = this.certificadoCliente.contenido.informacionVehiculo.marca.visible;

    certificadoEditado.contenido.informacionVehiculo.modelo = this.modelo;
    certificadoEditado.contenido.informacionVehiculo.modelo.visible = this.certificadoCliente.contenido.informacionVehiculo.modelo.visible;

    certificadoEditado.contenido.informacionVehiculo.anio = this.anio;
    certificadoEditado.contenido.informacionVehiculo.anio.visible = this.certificadoCliente.contenido.informacionVehiculo.anio.visible;

    certificadoEditado.contenido.informacionVehiculo.tipoVehiculo = this.tipoVehiculo;
    certificadoEditado.contenido.informacionVehiculo.tipoVehiculo.visible = this.certificadoCliente.contenido.informacionVehiculo.tipoVehiculo.visible;

    certificadoEditado.contenido.informacionGps = this.informacionGps;

    certificadoEditado.contenido.informacionGps.visible = this.certificadoCliente.contenido.informacionGps.visible;

    certificadoEditado.contenido.informacionGps.serie = this.serie;
    certificadoEditado.contenido.informacionGps.serie.visible = this.certificadoCliente.contenido.informacionGps.serie.visible;

    certificadoEditado.contenido.informacionGps.tipoGps = this.tipoGps;
    certificadoEditado.contenido.informacionGps.tipoGps.visible = this.certificadoCliente.contenido.informacionGps.tipoGps.visible;

    console.log(certificadoEditado);

    console.log('antes de servicio');
    this.axios.http
      .put(`${this.Controller}`, certificadoEditado)
      .then(res => {
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.editar', {
            entidad: 'Certificado',
            creadoA: 'guardado',
          })
        );
        this.handleCerrar();
        this.loadingService.hideLoading();
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.editar', {
                entidad: 'Certificado',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.editar', {
              entidad: 'Certificado',
            })
          );
        }
      });
  }

  // async fetchTiposCertificados() {
  //     this.loadingService.showLoading();
  //     return fetchTiposCertificados()
  //       .then(res => {
  //         this.lstTiposCertificados = res;

  //         this.lstTiposCertificados.push({
  //           id: 0,
  //           nombre: 'Todos',
  //         });
  //         res.forEach(a => {
  //           this.lstTiposCertificados.push(a);
  //         });
  //       })
  //       .catch(() =>
  //         this.$snotify.error(
  //           'Ha ocurrido un error al intentar obtener los tipos de Certificados',
  //           { timeout: 3000 }
  //         )
  //       )
  //       .finally(() => this.loadingService.hideLoading());
  //   }

  /* Configurar Alerta */

  handleFormChange(event: any) {
    this.pasos.configurarCertificado.formState = event;
    //console.log(event);
  }

  handleFormTextoChange(event: FormChangeEvent) {
    console.log(event);
    this.pasos.editarTexto.formState = event;
  }

  // handleFormGpsChange(event:any){
  //   this.oGps.datosGps = event.datosGps;
  //   this.oGps.serieGps = event.serieGps;
  //   this.oGps.tipoGps = event.tipoGps;
  //   this.oGps.datosVehiculo = event.datosVehiculo;
  //   this.oGps.marca = event.marca;
  //   this.oGps.modelo = event.modelo;
  //   this.oGps.anio = event.anio;
  //   this.oGps.tipovehiculo = event.tipovehiculo;
  //   console.log(this.oGps);

  // }

  handleFormGps(event: any) {
    this.oGps.datosGps = event.datosGps;
    this.oGps.serieGps = event.serieGps;
    this.oGps.tipoGps = event.tipoGps;
    this.oGps.datosVehiculo = event.datosVehiculo;
    this.oGps.marca = event.marca;
    this.oGps.modelo = event.modelo;
    this.oGps.anio = event.anio;
    this.oGps.tipovehiculo = event.tipovehiculo;
    this.certificadoCliente.contenido.informacionVehiculo.visible =
      event.datosVehiculo;
    this.certificadoCliente.contenido.informacionGps.visible = event.datosGps;
    this.certificadoCliente.contenido.informacionGps.serie.visible =
      event.serieGps;
    this.certificadoCliente.contenido.informacionGps.tipoGps.visible =
      event.tipoGps;
    this.certificadoCliente.contenido.informacionVehiculo.marca.visible =
      event.marca;
    this.certificadoCliente.contenido.informacionVehiculo.modelo.visible =
      event.modelo;
    this.certificadoCliente.contenido.informacionVehiculo.anio.visible =
      event.anio;
    this.certificadoCliente.contenido.informacionVehiculo.tipoVehiculo.visible =
      event.tipovehiculo;
  }

  handleLogoChange(event: any) {
    this.logo = event;
  }

  handleTextoChange(event: any) {
    this.oTexto.glosa = event.glosa;
    this.oTexto.activo = event.activo;
    this.oTexto.anexo = event.anexo;
    this.certificadoCliente.contenido.glosa = event.glosa;
    this.certificadoCliente.contenido.anexo.visible = event.activo;
    this.certificadoCliente.contenido.anexo.contenido = event.anexo;
  }

  handleTipoBaseChange(tipoBase: number, esAcumulable: boolean) {
    this.tipoBase = tipoBase;
  }

  handleShowEditarTexto(showEditarTexto: boolean) {
    this.showEditarTexto = showEditarTexto;
  }

  handleShowGpsVehiculo(showAsociarGpsVehiculo: boolean) {
    this.showAsociarGpsVehiculo = showAsociarGpsVehiculo;
  }

  /* Pestaña Configurar notificacion  */

  handleDistribucionSelect(
    lstNotificacion: number[],
    tipoNotificacion: number
  ) {
    if (tipoNotificacion == 1) {
      //this.alerta.notificacionListaDistribucion = lstNotificacion;
      this.listaDistribucionSeleccionados = lstNotificacion;
    } else if (tipoNotificacion == 2) {
      //this.alerta.notificacionContacto = lstNotificacion;
      this.contactosSeleccionados = lstNotificacion;
    } else {
      //this.alerta.notificacionUsuario = lstNotificacion;
      this.usuariosSeleccionados = lstNotificacion;
    }
  }

  handleCalendarioSelect(calendarios: number[]) {
    //this.alerta.notificacionCalendario = calendarios;
  }

  handledTipoNotificacion(tipoNotificacion: number) {
    this.tipoNotificacionSeleccionado = tipoNotificacion;
  }

  /* Validacion */

  permitirContinuarAsociarVehiculos() {
    this.itemsNoValidos = [];
    this.mensajeValidacion = '';

    return true;
  }

  permitirContinuarEditarTexto() {
    return true;
  }

  permitirContinuarGpsVehiculo() {
    return true;
  }

  permitirContinuarConfigurarCertificado() {
    // if (
    //   this.nombre.length === 0
    // ) {
    //   this.tituloValidacion = 'Seleccionar Plan de Mantenimiento';
    //   this.mensajeValidacion =
    //     'Debe seleccionar al menos un plan de mantenimiento.';
    //   this.showValidacion = true;
    //   return false;
    // }
    return true;
  }
}
</script>
