<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Programación de Informe"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <ProgramacionInformeForm
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        :informeProgramadoSeleccionado="informeProgramadoSeleccionado"
        :accion="3"
      />

      <ConfigurarNotificacion
        v-show="pasoActivoIndex === pasos.configurarNotificacion.step"
        :distribucionSeleccionada="distribucion"
        :calendarioSeleccionado="notificacion ? notificacion.calendarios : []"
        :informeProgramadoSeleccionado="informeProgramadoSeleccionado"
        :disabled="true"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { Notificacion } from '@/pantallas/ProgramacionInforme/ProgramacionInforme';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import ProgramacionInformeForm from './ProgramacionInformeForm.vue';
import ConfigurarNotificacion from '@/pantallas/PlanesMantenimiento/ConfigurarNotificacion.vue';
import { IInformeProgramadoBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import {
  DistribucionPlanMantenimiento,
  CalendarioPlanMantenimiento,
  NotificacionPlanMantenimiento,
  ContactosPlanMantenimiento,
  ListaDistribucionPlanMantenimiento,
  NotificacionPlanMantenimientoDetalle,
} from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import { Usuario } from '@/reusable/ListDistrContactosUsuarios/fetchListDistrContactosUsuarios';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    ConfigurarNotificacion,
    ProgramacionInformeForm,
  },
})
export default class VerProgramacionInformeModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: false })
  informeProgramadoSeleccionado: IInformeProgramadoBackend;
  @Prop({ required: false })
  tipoMantenimientoSeleccionado: ProgramacionInformeForm;
  @Prop() notificacion: Notificacion;

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

  /*Data */
  distribucion: DistribucionPlanMantenimiento[] = [];
  calendario: CalendarioPlanMantenimiento[] = [];

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
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
