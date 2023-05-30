<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Dispositivo"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Dispositivo'"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre
          : ''
      "
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <DispositivoForm
        @change="handleFormChange"
        :dispositivoSeleccionado="dispositivoSeleccionado"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        :esEditar="true"
        testId="EditarDispositivoModal"
      />
    </ContenidoModal>
  </ModalMantenedor>
  <!-- <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Dispositivo" @cerrar="handleCerrar">
      <GuardarCambiosButton
        @click="handleGuardarClick"
        v-show="showGuardar"
        :disabled="form.isDirty ? hasErrors : false"
      />
    </CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.informacionGeneral.step"
        absolute
        color="tansparent"
      >
        <v-btn
          v-show="pasos.informacionGeneral.visible"
          :value="pasos.informacionGeneral.step"
          color="primary"
          flat
        >
          <span>Información General</span>
          <v-icon>info</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />
      <DispositivoForm
        @change="handleFormChange"
        :dispositivoSeleccionado="dispositivoSeleccionado"
        :esEditar="true"
        @estadoSwitch="handleSwitch"
        testId="EditarDispositivoModal"
      />
    </div>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Dispositivo',
          nombreEntidad: nombre,
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
      test-id="EditarDispositivo"
    ></Confirmation>
    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="handleCierreConfirmacionCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></Confirmation>
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
            >
              <v-card-text v-if="inactivaIndividual">
                {{
                  $t('mensajes.crud.editar.titulo', {
                    entidad: 'Dispositivo',
                    nombreEntidad: nombre,
                  })
                }}
              </v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="inactivaIndividual">
              {{ mensajeInactiva }}
            </v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              depressed
              small
              @click="dialogErrorAsoc = false"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </ModalMantenedor>-->
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
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

import DispositivoForm from '@/pantallas/Dispositivos/DispositivoForm.vue';
import { editarDispositivo } from '@/pantallas/Dispositivos/editarDispositivo';
import { Dispositivo } from '@/reusable/Dispositivos/dispositivos';

type EditarDispositivoFormState = {
  entity: Dispositivo;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModalEditar,
    ModalMantenedor,
    GuardarCambiosButton,
    Confirmation,
    DispositivoForm,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class EditarDispositivoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) dispositivoSeleccionado: Dispositivo;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  modificable: boolean = true;

  form: EditarDispositivoFormState = {
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
  };

  /* Event Handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    var dispositivo: Dispositivo = {
      ...this.pasos.informacionGeneral.formState.entity,
      id: this.dispositivoSeleccionado.id,
    };

    this.loadingService.showLoading();
    return editarDispositivo(dispositivo)
      .then(() => {
        this.$snotify.success(
          'Los cambios han sido guardados de forma exitosa',
          {
            timeout: 3000,
          }
        );
        this.handleCerrar();
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar editar el dispositivo',
          {
            timeout: 3000,
          }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (
      this.dispositivoSeleccionado.totalAsociados2 > 0 &&
      this.pasos.informacionGeneral.formState.entity.estado == 0
    ) {
      this.modificable = false;
    } else {
      this.modificable = true;
    }
  }

  handleInactivo() {}

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.handleCerrar();
    }
  }

  // pasos = {
  //   informacionGeneral: {
  //     accion: 'Crear - Información General',
  //     visible: true,
  //     step: 1,
  //   },
  // };
  // form: EditarDispositivoFormState = {
  //   entity: null,
  //   validator: null,
  //   isDirty: null,
  // };

  // /* state */

  // nombre: string = this.dispositivoSeleccionado.nombre;
  // showInfo: boolean = true;
  // showGuardar: boolean = true;
  // dialogConfirmacionClose: boolean = false;
  // dialogConfirmacionGuardar: boolean = false;
  // mensajeConfirmacionInactivo: any = '';
  // hasErrors = false;
  // isValid = false;
  // estadoSwitch: boolean = true;

  // /* Inactivar */
  // mensajeInactiva: string = '';
  // inactivaIndividual: Boolean = false;
  // dialogErrorAsoc: Boolean = false;

  // /* event handlers */

  // handleCerrar() {
  //   this.dialogConfirmacionClose = true;
  // }

  // handleCierreConfirmacionCerrar(isConfirmado: boolean) {
  //   this.dialogConfirmacionClose = false;
  //   if (!isConfirmado) {
  //     return;
  //   }
  //   this.$emit('cerrar');
  // }

  // handleConfirmacionGuardar(isConfirmado: boolean) {
  //   this.dialogConfirmacionGuardar = false;
  //   this.hasErrors = false;
  //   if (!isConfirmado) {
  //     return;
  //   }
  //   this.loadingService.showLoading();

  //   const dispositivoEditado: Dispositivo = {
  //     ...this.form.entity,
  //     id: this.dispositivoSeleccionado.id,
  //   };
  //   return editarDispositivo(dispositivoEditado)
  //     .then(() =>
  //       this.$snotify.success(
  //         this.$t('mensajes.mensajesExito.editar', {
  //           entidad: 'Dispositivo',
  //           creadoA: 'editado',
  //         })
  //       )
  //     )
  //     .catch(() =>
  //       this.$snotify.error(
  //         `Ha ocurrido un error al intentar editar el dispositivo.`,
  //         { timeout: 3000 }
  //       )
  //     )
  //     .finally(() => {
  //       this.loadingService.hideLoading();
  //       this.$emit('cerrarBtnGuardar');
  //     });
  // }

  // async handleGuardarClick() {
  //   this.handleSwitch(Boolean(this.form.entity.estado));
  //   this.nombre = this.form.entity.nombre;
  //   this.isValid = await this.form.validator.validateAll();
  //   if (this.isValid) {
  //     const totalAsociados =
  //       this.dispositivoSeleccionado.totalAsociados === undefined
  //         ? 0
  //         : this.dispositivoSeleccionado.totalAsociados;
  //     if (this.estadoSwitch) {
  //       this.dialogConfirmacionGuardar = true;
  //     } else {
  //       if (totalAsociados === 0) {
  //         this.dialogConfirmacionGuardar = true;
  //       } else {
  //         this.mensajeInactiva =
  //           'El Dispositivo tiene ' +
  //           (totalAsociados > 1
  //             ? 'asociaciones activas, '
  //             : 'una asociacion activa, ') +
  //           'por esta razón no se podrá dejar inactivo.';
  //         this.dialogErrorAsoc = true;
  //         this.inactivaIndividual = true;
  //       }
  //     }
  //   } else {
  //     this.form.isDirty = true;
  //   }
  // }

  // async handleFormChange(event: FormChangeEvent) {
  //   this.form = event;
  //   if (this.form.isDirty) {
  //     this.hasErrors = this.form.validator.errors.items.length > 0;
  //   }
  // }
  // handleSwitch(estadoSwitch: boolean) {
  //   this.estadoSwitch = estadoSwitch;
  //   if (this.estadoSwitch) {
  //     this.mensajeConfirmacionInactivo = this.$t(
  //       'mensajes.crud.editar.mensaje',
  //       {
  //         entidad: 'el Dispositivo',
  //       }
  //     );
  //   } else {
  //     this.mensajeConfirmacionInactivo =
  //       'Al dejar como inactivo, no se podrán realizar asociaciones.' +
  //       ' ' +
  //       this.$t('mensajes.crud.editar.mensaje', {
  //         entidad: 'el Dispositivo',
  //       });
  //   }
  // }
}
</script>
