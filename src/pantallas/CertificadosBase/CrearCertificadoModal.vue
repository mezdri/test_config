<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Configuración Base"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        :estado-id="estadoId"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.configurarCertificado">
          <ConfigurarCertificadoForm
            @change="handleFormChange"
            @handleFormChange="handleFormChange"
            @handleLogoTercero="handleLogoChange"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.editarTexto">
          <ConfigurarCertificadoFormTexto
            @handleTexto="handleTextoChange"
            @handleFormTextoChange="handleFormTextoChange"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.gpsVehiculo">
          <ConfigurarCertificadoFormGps @handleFormGps="handleFormGps" />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Configuración Base' })
      "
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'la Configuración Base' })
      "
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import SeleccionarCodigosForm from '@/pantallas/ConfigurarBase/SeleccionarCodigosForm.vue';
import AgregarCamposGrid from '@/pantallas/ConfigurarBase/AgregarCamposGrid.vue';
import ValidacionExtendidaForm from '@/pantallas/ConfigurarBase/ValidacionExtendidaForm.vue';
import HtmlTemplateForm from '@/pantallas/ConfigurarBase/HtmlTemplateForm.vue';

import { Component, Prop, Watch } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import ConfigurarCertificadoForm from '@/pantallas/CertificadosBase/ConfigurarCertificadoForm.vue';
import ConfigurarCertificadoFormTexto from '@/pantallas/CertificadosBase/ConfigurarCertificadoFormTexto.vue';
//import ConfigurarNotificacionForm from '@/pantallas/Alertas/ConfigurarNotificacionForm.vue';
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
  makepasosCertificadoBaseCrear,
  Marca,
  Modelo,
  Serie,
  TipoGps,
  TipoVehiculo,
  Texto,
  Gps,
} from '@/pantallas/CertificadosBase/ConfiguracionBase';

type CrearFormState = {
  entity: Texto;
  validator: Validator;
};

@Component({
  components: {
    Confirmation,
    ModalMantenedor,
    CabeceraModalCrear,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    ConfigurarCertificadoForm,
    ConfigurarCertificadoFormTexto,
    ConfigurarCertificadoFormGps,
    MensajeValidacion,
  },
})
export default class CrearCertificadoModal extends OperacionCrud {
  @Prop({ required: true }) show: boolean;
  //@Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Alertas;
  permisosActuales: PermisoAccionVm[] = [];

  pasos: PasosCrud = makepasosCertificadoBaseCrear();

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

  async handleGuardar() {
    const isValid = true; //await this.pasos.configurarCertificado.formState.validator.validateAll();
    if (isValid) {
      // this.handleEstadoSwitch(
      //   this.pasos.configurarCertificado.formState.entity.estado
      // );

      //this.handleFormGpsChange;
      this.handleFormTextoChange;
      this.dialogConfirmacionGuardar = true;
    }
  }

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacion =
        'Al dejar como inactivo, no se permitirá recibir notificaciones de esta Alerta. ¿Esta seguro que desea crear la Alerta?';
    } else {
      this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
        entidad: 'la Alerta',
      });
    }
  }

  handleConfirmacionGuardar(val: boolean) {
    this.dialogConfirmacionGuardar = false;

    if (val) {
      this.loadingService.showLoading();
      var configurarCertificadoForm = this.pasos.configurarCertificado.formState
        .entity;

      //var texto = this.pasos.editarTexto.formState.entity;

      //var notificarForm = this.pasos.configurarNotificaciones.formState.entity;
      configurarCertificadoForm.logoTercero = this.logo;
     

      this.certificadoCliente.nombre = configurarCertificadoForm.nombre; //configurarCertificadoForm;
      this.certificadoCliente.tipoCertificadoId =
        configurarCertificadoForm.tipoCertificado;
      this.certificadoCliente.firmaCertificadoId =
        configurarCertificadoForm.firmaCertificado;
      this.certificadoCliente.estado = configurarCertificadoForm.activo;

      // console.log(texto.entity);
      this.certificadoCliente.contenido = this.contenido;
      this.certificadoCliente.contenido.fechaExpiracion =
        configurarCertificadoForm.expiracion == '1' ? true : false;

      this.certificadoCliente.contenido.codigoQr = configurarCertificadoForm.qr;
      this.certificadoCliente.estado = configurarCertificadoForm.activo;
      this.certificadoCliente.contenido.logoTercero =
        configurarCertificadoForm.logoTercero;
      this.certificadoCliente.contenido.glosa = this.oTexto.glosa;
      this.certificadoCliente.contenido.anexo = this.anexo;
      this.certificadoCliente.contenido.anexo.visible = this.oTexto.activo;
      this.certificadoCliente.contenido.anexo.contenido = this.oTexto.anexo;

      this.certificadoCliente.contenido.informacionGps = this.informacionGps;
      this.certificadoCliente.contenido.informacionGps.serie = this.serie;
      this.certificadoCliente.contenido.informacionGps.tipoGps = this.tipoGps;

      this.certificadoCliente.contenido.informacionGps.visible = this.oGps.datosGps;
      this.certificadoCliente.contenido.informacionGps.serie.visible = this.oGps.serieGps;
      this.certificadoCliente.contenido.informacionGps.tipoGps.visible = this.oGps.tipoGps;

      this.certificadoCliente.contenido.informacionVehiculo = this.informacionVehiculo;
      this.certificadoCliente.contenido.informacionVehiculo.marca = this.marca;
      this.certificadoCliente.contenido.informacionVehiculo.modelo = this.modelo;
      this.certificadoCliente.contenido.informacionVehiculo.anio = this.anio;
      this.certificadoCliente.contenido.informacionVehiculo.tipoVehiculo = this.tipoVehiculo;

      this.certificadoCliente.contenido.informacionVehiculo.visible = this.oGps.datosVehiculo;
      this.certificadoCliente.contenido.informacionVehiculo.marca.visible = this.oGps.marca;
      this.certificadoCliente.contenido.informacionVehiculo.modelo.visible = this.oGps.modelo;
      this.certificadoCliente.contenido.informacionVehiculo.anio.visible = this.oGps.anio;
      this.certificadoCliente.contenido.informacionVehiculo.tipoVehiculo.visible = this.oGps.tipovehiculo;

      
     
      this.axios.http
        .post(`${this.Controller}`, this.certificadoCliente)
        .then(res => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Certificado',
              creadoA: 'creado',
            })
          );
          this.handleCerrar();
          this.dialogConfirmacionGuardar = false;
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'Certificado',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'Certificado',
              })
            );
          }
        });
    }
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
  }

  handleFormTextoChange(event: any) {
    console.log('1');
  }

  handleLogoChange(event: any) {
    this.logo = event;
  }

  handleTextoChange(event: any) {
    this.oTexto.glosa = event.glosa;
    this.oTexto.anexo = event.anexo;
    this.oTexto.activo = event.activo;
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

  get estadoId() {
    const { entity } = this.pasos.configurarCertificado.formState;
    if (!entity) {
      return null;
    }

    return entity.estado;
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

  handleFormNotificarChange(event: FormChangeEvent) {
    this.pasos.configurarNotificaciones.formState = event;
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

  permitirContinuarConfigurarNotificaciones() {
    this.tituloValidacion = 'Configurar Notificación';
    this.mensajeValidacion = 'Debe seleccionar:';
    this.itemsNoValidos = [];

    if (
      this.listaDistribucionSeleccionados.length ||
      this.contactosSeleccionados.length ||
      this.usuariosSeleccionados.length
    ) {
      //
    } else {
      this.itemsNoValidos.push('Lista de Distribución, Contacto o Usuario');
    }

    var notificarForm = this.pasos.configurarNotificaciones.formState.entity;

    if (
      !notificarForm.notificaGps &&
      !notificarForm.notificaBrowser &&
      !notificarForm.notificaEmail
    ) {
      this.itemsNoValidos.push('Medio de Notificación');
    }

    if (this.itemsNoValidos && this.itemsNoValidos.length > 0) {
      this.showValidacion = true;
      return false;
    }

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
