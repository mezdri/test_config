<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardnew">
        <br />
        <br />
        <br />

        <v-container fluid fill-height class="cardnew" grid-list-md>
          <v-layout align-center justify-center>
            <v-flex xs10 sm10 md10>
              <v-card class="cardnew">
                <ContactoEjecutivoForm
                  :contactoEjecutivoSeleccionado="lstContactoEjecutivo[0]"
                  v-if="hayContacto"
                />
                <v-flex
                  v-if="!hayContacto"
                  style="padding-top:330px"
                  class="text-sm-left text-md-center"
                  ><p>No se han encontrado Ejecutivos</p>
                </v-flex>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
        <v-toolbar dark color="primary" fixed>
          <v-btn icon dark @click="closeModal()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Contacto Ejecutivo</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            :class="btnClass"
            :color="btnColor"
            style="max-height: 75%;"
            @click="closeModal()"
          >
            <span
              :style="[
                btnText == 'ACEPTAR' ? { color: 'white' } : { color: 'black' },
              ]"
              >{{ btnText }}</span
            >
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import HandleErrors from '@/config/handleErrors';
import { LoadingService } from '@/services/loadingService';
// import Validadores from '@/config/validaRut';
import router from '../../router';
import { Validator } from 'vee-validate';
import ContactoEjecutivoForm from '@/views/auth/ContactoEjecutivoForm.vue';
const { AgGridVue } = require('ag-grid-vue'); //
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { fetchContactoEjecutivo } from '@/views/auth/fetchContactoEjecutivo';
import { Snotify } from '@/snotify/Snotify';

@Component({
  components: {
    ContactoEjecutivoForm,
  },
})
export default class ContactoEjecutivo extends Vue {
  //variables globales
  btnText: string = 'Aceptar';
  btnClass: string = 'btn-aceptar';
  btnColor: string = '#ffe800';

  @Prop({ default: false }) show: boolean;

  //propiedades
  dialog: boolean = false;
  lstContactoEjecutivo: any = {};

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  show1: boolean = false;

  ContactoEjecutivo: boolean = false;
  loadingService = new LoadingService();
  modoVer: boolean = true;

  redireccionaAceptarInfo: string = '0';
  hayContacto: boolean = true;

  mounted() {}

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.btnText = 'Aceptar';
    this.btnClass = 'btn-aceptar';
    this.dialog = value;
    this.show1 = false;
    this.buscarContactoEjecutivo();
  }

  closeModal(val: boolean) {
    val = false;
    this.show1 = false;
    this.$emit('modalContactoEjecutivoEmit', false);
    this.dialog = false;
  }

  readonly $snotify: Snotify;

  fetchContactoEjecutivo() {
    this.loadingService.showLoading();
    return fetchContactoEjecutivo()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Contactos Ejecutivos',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async buscarContactoEjecutivo() {
    this.lstContactoEjecutivo = (await this.fetchContactoEjecutivo()) || [];
    if (this.lstContactoEjecutivo === []) {
      this.hayContacto = false;
    } else {
      this.hayContacto = true;
    }
  }
}
</script>

<style lang="stylus" scoped></style>
