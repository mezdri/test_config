<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Programación de Informe"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Programación Informe'"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :estadoEntidad="estadoEntidad"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre
          : ''
      "
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <ProgramacionInformeForm
        @change="handleFormChange"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        :informeProgramadoSeleccionado="informeProgramadoSeleccionado"
        :accion="2"
      />

      <ConfigurarNotificacion
        @change="handleFormChangeNotificacion"
        @distribucionChange="handleListaDistChange"
        @calendarioChange="handleCalendarioChange"
        :distribucionSeleccionada="distribucion"
        :calendarioSeleccionado="notificacion ? notificacion.calendarios : []"
        :informeProgramadoSeleccionado="informeProgramadoSeleccionado"
        v-show="pasoActivoIndex === pasos.configurarNotificacion.step"
        :accion="2"
      />
      <MensajeValidacion
        :showDialog="showValidacion"
        :titulo="$t(tituloValidacion)"
        :mensaje="$t(mensajeValidacion)"
        v-on:modalConfirmationEmit="showValidacion = false"
      ></MensajeValidacion>
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';

import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import {
  ProgramacionInforme,
  makeProgramacioninformePasos,
  Notificacion,
} from '@/pantallas/ProgramacionInforme/ProgramacionInforme';
import ConfigurarNotificacion from '@/pantallas/PlanesMantenimiento/ConfigurarNotificacion.vue';
import ProgramacionInformeForm from './ProgramacionInformeForm.vue';
import {
  DistribucionPlanMantenimiento,
  CalendarioPlanMantenimiento,
  NotificacionPlanMantenimiento,
  ContactosPlanMantenimiento,
  ListaDistribucionPlanMantenimiento,
  NotificacionPlanMantenimientoDetalle,
} from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import { IInformeProgramadoBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import { editarInformeProgramado } from '@/pantallas/ProgramacionInforme/editarProgramacionInformes';
import { Usuario } from '@/reusable/ListDistrContactosUsuarios/fetchListDistrContactosUsuarios';
import { TipoDeInforme } from './crearProgramacionInformes';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

type EditarFormState = {
  entity: ProgramacionInforme;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModalEditar,
    ModalMantenedor,
    GuardarCambiosButton,
    Confirmation,
    CrudStepsNavBar,
    ContenidoModal,
    ConfigurarNotificacion,
    ProgramacionInformeForm,
    MensajeValidacion,
  },
})
export default class EditarProgramacionInformesModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: false })
  informeProgramadoSeleccionado: IInformeProgramadoBackend;
  @Prop({ required: false })
  programacionInformeSeleccionada: ProgramacionInforme;
  @Prop() notificacion: Notificacion;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  modificable: boolean = true;
  estadoEntidad: boolean = true;

  /*Data */
  distribucion: DistribucionPlanMantenimiento[] = [];
  calendario: CalendarioPlanMantenimiento[] = [];

  form: EditarFormState = {
    entity: null,
    validator: null,
  };

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
  tituloValidacion: string = '';
  mensajeValidacion: string = '';
  showValidacion: boolean = false;

  constructor() {
    super();
    this.pasos.informacionGeneral.permitirContinuar = this.permitirContinuarAsociarVehiculos;
  }

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
      // } //else if (tipoInforme == TipoDeInforme.Descargas) {
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

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
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

    let programacionInforme: ProgramacionInforme = {
      ...this.pasos.informacionGeneral.formState.entity,
      id: this.informeProgramadoSeleccionado.id,
    };

    /*Periodo */
    programacionInforme.periodo.id = this.informeProgramadoSeleccionado.periodo.id;

    /*Notificaciones */
    programacionInforme.notificacionId = this.notificacion.id;
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
    console.log(programacionInforme);
    return editarInformeProgramado(programacionInforme)
      .then(() => {
        this.$snotify.success(
          'Los cambios han sido guardados de forma exitosa',
          {
            timeout: 3000,
          }
        );
        this.$emit('crear');
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar editar la Programacion de Informes',
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
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

  handleInactivo() {}

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.handleCerrar();
    }
  }

  @Watch('notificacion', { deep: true, immediate: true })
  handleNotificacionSeleccionada() {
    if (!this.notificacion) {
      return;
    }

    this.makeDistribucionSeleccionada(this.notificacion);
  }

  makeDistribucionSeleccionada(
    notificacion: NotificacionPlanMantenimientoDetalle
  ) {
    const makeDistribucionConGridId = (prependTexto: string) => (
      x:
        | ContactosPlanMantenimiento
        | ListaDistribucionPlanMantenimiento
        | Usuario
    ): DistribucionPlanMantenimiento => ({
      ...x,
      agGridId: `${prependTexto}-${x.id}}`,
    });
    this.distribucion = [
      ...this.notificacion.listaDistribuciones.map(
        makeDistribucionConGridId('Lista')
      ),
      ...this.notificacion.contactos.map(makeDistribucionConGridId('Contacto')),
      ...this.notificacion.usuarios.map(makeDistribucionConGridId('Usuario')),
    ];
  }
}
</script>
