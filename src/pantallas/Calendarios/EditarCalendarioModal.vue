<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Calendario" @cerrar="handleCerrar">
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
        color="transparent"
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
      <CalendarioForm
        @change="handleFormChange"
        :calendarioSeleccionado="calendarioSeleccionado"
        @estadoSwitch="handleEstadoSwitch"
      />
    </div>

    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Calendario',
          nombreEntidad: nombreCalendarioEditado,
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
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
              <v-card-text v-if="inactivaInividual">
                {{
                  $t('mensajes.crud.editar.titulo', {
                    entidad: 'Calendario',
                    nombreEntidad: nombreCalendarioEditado,
                  })
                }}
              </v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="inactivaInividual">
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
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';

import CalendarioForm from '@/pantallas/Calendarios/CalendarioForm.vue';
import { editarCalendario } from '@/pantallas/Calendarios/editarCalendario';

import {
  Calendario,
  CalendarioNuevoForm,
} from '@/pantallas/Calendarios/Calendario';

type CrearCalendarioFormState = {
  entity: CalendarioNuevoForm;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    CalendarioForm,
    ModalMantenedor,
    VolverButton,
    ContinuarButton,
    GuardarCambiosButton,
  },
})
export default class EditarCalendarioModal extends Vue {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) calendarioSeleccionado: CalendarioNuevoForm;

  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  form: CrearCalendarioFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };
  showInfo: boolean = true;
  showGuardar: boolean = true;
  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  disableBtnContinuar: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  hasErrors = false;
  isValid = false;
  estadoSwitch: boolean = true;
  nombreCalendarioEditado: string = '';

  /*Inactivar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogEliminar: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeInactiva: string = '';
  inactivaInividual: Boolean = false;
  tituloEliminar: any = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.dialogConfirmacionClose = true;
  }

  handleCierreConfirmacionCerrar(isConfirmado: boolean) {
    this.dialogConfirmacionClose = false;
    if (!isConfirmado) {
      return;
    }
    this.$emit('cerrar');
  }

  handleConfirmacionGuardar(isConfirmado: boolean) {
    this.dialogConfirmacionGuardar = false;
    this.hasErrors = false;
    if (!isConfirmado) {
      return;
    }
    this.loadingService.showLoading();
    const calendarioEditado: CalendarioNuevoForm = {
      ...this.form.entity,
      id: this.calendarioSeleccionado.id,
    };
    return editarCalendario(calendarioEditado)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.editar', {
            entidad: 'Calendario',
            creadoA: 'editado',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar editar el Calendario.`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.$emit('cerrarBtnGuardar');
      });
  }

  async handleGuardarClick() {
    this.handleEstadoSwitch(this.form.entity.estado);
    if (
      this.form.entity.frecuenciaSeleccionada === 1 &&
      (!this.form.entity.semanalDiasSemana ||
        this.form.entity.semanalDiasSemana.length === 0)
    ) {
      this.$snotify.error('Debe seleccionar al menos un día de la semana');
    } else {
      this.isValid = await this.form.validator.validateAll();
      this.hasErrors = true;
      if (this.isValid) {
        const totalAsociados = this.calendarioSeleccionado.totalAsociados;
        if (this.estadoSwitch) {
          this.nombreCalendarioEditado = this.form.entity.nombreCalendario;
          this.dialogConfirmacionGuardar = true;
        } else {
          if (totalAsociados === 0) {
            this.nombreCalendarioEditado = this.form.entity.nombreCalendario;
            this.dialogConfirmacionGuardar = true;
          } else {
            this.mensajeInactiva =
              'El Calendario tiene ' +
              (totalAsociados > 1
                ? 'asociaciones activas, '
                : 'una asociación activa, ') +
              'por esta razón no se podrá dejar inactivo.';
            this.dialogErrorAsoc = true;
            this.inactivaInividual = true;
          }
        }
      } else {
        this.form.isDirty = true;
      }
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.form = event;
    this.isValid = true;
    if (this.form.isDirty) {
      this.hasErrors = this.form.validator.errors.items.length > 0;
    }
  }

  handleEstadoSwitch(estadoSwitch: boolean) {
    this.estadoSwitch = estadoSwitch;
    if (this.estadoSwitch) {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'el Calendario' }
      );
    } else {
      this.mensajeConfirmacionInactivo =
        'Al dejar como inactivo, no se podrán realizar asociaciones.' +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', {
          entidad: 'el Calendario',
        });
    }
  }
}
</script>
