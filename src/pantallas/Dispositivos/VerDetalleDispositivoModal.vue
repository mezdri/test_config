<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Ver Detalle Dispositivo" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <DispositivoForm
        :dispositivoSeleccionado="dispositivoSeleccionado"
        :isVerDetalle="true"
        test-id="VerDetalleDispositivoModal"
      />
    </ContenidoModal>
  </ModalMantenedor>
  <!-- <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Dispositivo"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.informacionGeneral.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.informacionGeneral.visible"
          @click="handleInfoGeneral"
          color="primary"
          flat
          :value="pasos.informacionGeneral.step"
        >
          <span>Información General</span>
          <v-icon>info</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />
      <DispositivoForm
        :dispositivoSeleccionado="dispositivoSeleccionado"
        :isVerDetalle="true"
        test-id="VerDetalleDispositivoModal"
      />
    </div>
  </ModalMantenedor> -->
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import DispositivoForm from '@/pantallas/Dispositivos/DispositivoForm.vue';
import { Dispositivo } from '@/reusable/Dispositivos/dispositivos';
@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    DispositivoForm,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class VerDetalleDispositivoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) dispositivoSeleccionado: Dispositivo;

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
  };

  /* Event Handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }
}
// export default class VerDetalleDispositivoModal extends Vue {
//   @Prop({ default: true }) show: boolean;
//   @Prop({ required: true }) dispositivoSeleccionado: Dispositivo;

//   pasoActivoIndex = 1;
//   pasos = {
//     informacionGeneral: {
//       accion: 'Crear - Información General',
//       visible: true,
//       step: 1,
//     },
//   };

//   showInfo = true;

//   readonly $snotify: Snotify;
//   readonly loadingService = new LoadingService();

//   handleCerrar() {
//     this.$emit('cerrar');
//   }

//   handleInfoGeneral() {
//     this.showInfo = true;
//   }
// }
</script>
