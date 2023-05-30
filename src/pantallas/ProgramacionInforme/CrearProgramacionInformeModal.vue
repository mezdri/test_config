<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Programación de Informes"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        :estado-id="estadoId"
        @guardar="handleGuardarClick"
      />
    </CabeceraModalCrear>

    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <ProgramacionInformeForm @change="handleFormChange" :accion="1" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.configurarNotificacion">
          <ConfigurarNotificacion
            @change="handleFormChangeNotificacion"
            @distribucionChange="handleListaDistChange"
            @calendarioChange="handleCalendarioChange"
            :informeProgramadoSeleccionado="informeProgramadoSeleccionado"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Programación de Informes',
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { Snotify } from '@/snotify/Snotify';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import Confirmation from '@/components/Confirmation.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import ConfigurarNotificacion from '@/pantallas/PlanesMantenimiento/ConfigurarNotificacion.vue';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import ProgramacionInformeForm from './ProgramacionInformeForm.vue';
import { IInformeProgramadoBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import {
  ProgramacionInforme,
  makeProgramacioninformePasos,
} from '@/pantallas/ProgramacionInforme/ProgramacionInforme';
import {
  crearInformeProgramado,
  TipoDeInforme,
} from '@/pantallas/ProgramacionInforme/crearProgramacionInformes';
import {
  DistribucionPlanMantenimiento,
  CalendarioPlanMantenimiento,
} from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperHeader,
    CrudStepperItems,
    ConfigurarNotificacion,
    ProgramacionInformeForm,
    Confirmation,
    MensajeValidacion,
  },
})
export default class CrearProgramacionInformeModal extends Vue {
  @Prop({ default: true }) show: boolean;

  /* template */

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
      title: 'Información General',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
    configurarNotificacion: {
      accion: 'Crear - Configurar Notificación',
      visible: true,
      step: 2,
      title: 'Configurar Notificación',
      icon: 'notifications',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  mensajeConfirmacionInactivo: any = '';
  dialogConfirmacion: boolean = false;

  /*Data */
  distribucion: DistribucionPlanMantenimiento[] = [];
  calendario: CalendarioPlanMantenimiento[] = [];
  informeProgramadoSeleccionado: IInformeProgramadoBackend = {
    notificaEmail: true,
  };
  tituloValidacion: string = '';
  mensajeValidacion: string = '';
  showValidacion: boolean = false;

  constructor() {
    super();
    this.pasos.informacionGeneral.permitirContinuar = this.permitirContinuarAsociarVehiculos;
  }

  validaMensajeFalse() {}

  permitirContinuarAsociarVehiculos() {
    var tipoInforme = this.pasos.informacionGeneral.formState.entity
      .tipoInformeId;

    if (tipoInforme == TipoDeInforme.Actividad) {
      if (
        this.pasos.informacionGeneral.formState.entity.vehiculos.length < 1 &&
        this.pasos.informacionGeneral.formState.entity.actividadTipo.length < 1
      ) {
        this.tituloValidacion = 'Seleccionar Actividad y Vehículo';
        this.mensajeValidacion =
          'Debe seleccionar al menos una Actividad y un Vehículo.';
        this.showValidacion = true;
        return false;
      } else if (
        this.pasos.informacionGeneral.formState.entity.vehiculos.length < 1
      ) {
        this.tituloValidacion = 'Seleccionar Vehículo';
        this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
        this.showValidacion = true;
        return false;
      } else if (
        this.pasos.informacionGeneral.formState.entity.actividadTipo.length < 1
      ) {
        this.tituloValidacion = 'Seleccionar Actividad';
        this.mensajeValidacion = 'Debe seleccionar al menos una Actividad.';
        this.showValidacion = true;
        return false;
      }
      return true;
      // } else if (tipoInforme == TipoDeInforme.Descargas) {
      //   if (
      //     this.pasos.informacionGeneral.formState.entity.descargas.length < 1 &&
      //     this.pasos.informacionGeneral.formState.entity.proveedores.length < 1 &&
      //     this.pasos.informacionGeneral.formState.entity.clienteProveedores
      //       .length < 1
      //   ) {
      //     this.tituloValidacion =
      //       'Seleccionar Servicio de Descarga, Proveedor o Cliente Proveedor';
      //     this.mensajeValidacion =
      //       'Debe seleccionar al menos un Servicio de Descarga, Proveedor o Cliente Proveedor.';
      //     this.showValidacion = true;
      //     return false;
      //   }
      //   return true;
    } else {
      if (tipoInforme != TipoDeInforme.Geotec) {
        if (
          this.pasos.informacionGeneral.formState.entity.vehiculos.length < 1
        ) {
          this.tituloValidacion = 'Seleccionar Vehículo';
          this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
          this.showValidacion = true;
          return false;
        }
      }
      return true;
    }
  }

  /* event handlers */
  handleGuardarClick() {
    this.handleEstadoSwitch(
      this.pasos.informacionGeneral.formState.entity.estado
    );
    this.dialogConfirmacion = true;
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleFormChangeNotificacion(event: FormChangeEvent) {
    this.pasos.configurarNotificacion.formState = event;
  }

  handleListaDistChange(distribucion: DistribucionPlanMantenimiento[]) {
    this.distribucion = distribucion;
  }

  handleCalendarioChange(calendario: CalendarioPlanMantenimiento[]) {
    this.calendario = calendario;
  }

  created() {
    InformeEventBus.$on('valides', (valide: boolean) => {
      console.log(this.pasos.informacionGeneral);
      //this.alertaBaseCliente = info;
    });
  }

  async handleFormChange(event: FormChangeEvent) {
    //console.log(event)
    this.pasos.informacionGeneral.formState = event;
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacion = false;
    if (isConfirm) {
      this.loadingService.showLoading();

      const contactos: number[] = [];
      const listasDistribucion: number[] = [];
      const calendarios: number[] = [];
      const usuarios: number[] = [];

      this.calendario.forEach(x => {
        calendarios.push(x.id);
      });
      this.distribucion.forEach(x => {
        if (x.tipo === 'Contacto') {
          contactos.push(x.id);
        } else if (x.tipo === 'Lista de Distribución') {
          listasDistribucion.push(x.id);
        } else if (x.tipo === 'Usuario') {
          usuarios.push(x.id);
        }
      });

      let programacionInforme: ProgramacionInforme = this.pasos
        .informacionGeneral.formState.entity;

      /*Notificaciones */
      programacionInforme.contactos = contactos;
      programacionInforme.listasDistribucion = listasDistribucion;
      programacionInforme.usuarios = usuarios;
      programacionInforme.calendarios = calendarios;

      programacionInforme.notificaGps = this.pasos.configurarNotificacion.formState.entity.medioNotificacion.find(
        (x: number) => x === 1
      )
        ? true
        : false;
      programacionInforme.notificaBrowser = this.pasos.configurarNotificacion.formState.entity.medioNotificacion.find(
        (x: number) => x === 2
      )
        ? true
        : false;
      programacionInforme.notificaEmail = this.pasos.configurarNotificacion.formState.entity.medioNotificacion.find(
        (x: number) => x === 3
      )
        ? true
        : false;

      return crearInformeProgramado(programacionInforme)
        .then(() => {
          this.$snotify.success(
            'Programación de Infomes ha sido creado de forma exitosa',
            {
              timeout: 3000,
            }
          );
          this.$emit('crear');
        })
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar crear la Programación de Infomes',
            { timeout: 3000 }
          )
        )
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'la Programación de Informes',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Programación de Informes' }
      );
    }
  }

  get estadoId() {
    const { entity } = this.pasos.informacionGeneral.formState;
    if (!entity) {
      return null;
    }
    return entity.estado;
  }
}
</script>

<style scoped></style>
