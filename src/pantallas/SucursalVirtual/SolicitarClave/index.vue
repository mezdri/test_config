<template>
  <div class="text-xs-center">
    <v-dialog v-model="dialog" width="800">
      <template v-slot:activator="{ on }">
        <v-btn color="colorbtn" v-on="on"> Solicitar Clave </v-btn>
      </template>
      <v-card>
        <v-card-title
          class="headline colortitle"
          primary-title
          color="white--text"
        >
          Crear solicitud de clave
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="form" :v-model="isValid.form">
            <v-container>
              <v-layout>
                <v-flex md12 xs12 s12>
                  <h3>Información Empresa</h3>
                  <v-text-field
                    label="RUT Empresa *"
                    :counter="12"
                    :maxlength="12"
                    v-model="dataForm.RutCuenta"
                    v-validate="'required'"
                    :error-messages="errors.collect('rutEmpresa')"
                    data-vv-name="rutEmpresa"
                    @change="validateRut($event, 'empresa')"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex md12 xs12 s12 class="pb-1 mb-1">
                  <h3>Mis Datos</h3>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex md6 xs12 s12 class="pt-1 mt-1">
                  <v-text-field
                    class="pt-1 mt-1"
                    label="Nombre *"
                    v-model="dataForm.NombreSolicitante"
                    v-validate="'required'"
                    :error-messages="errors.collect('nombre')"
                    data-vv-name="nombre"
                    @change="dataValidate()"
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex md6 xs12 s12 class="pt-1 mt-1">
                  <v-text-field
                    class="pt-1 mt-1"
                    label="Apellido *"
                    v-model="dataForm.ApellidoSolicitante"
                    v-validate="'required'"
                    :error-messages="errors.collect('apellido')"
                    data-vv-name="apellido"
                    @change="dataValidate()"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex md6 xs12 s12>
                  <v-text-field
                    label="Rut *"
                    v-model="dataForm.RutSolicitante"
                    v-validate="'required'"
                    :error-messages="errors.collect('rut')"
                    data-vv-name="rut"
                    @change="validateRut($event, 'usuario')"
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex md6 xs12 s12>
                  <v-text-field
                    v-model="dataForm.EmailSolicitante"
                    v-validate="'required|email'"
                    :error-messages="errors.collect('email')"
                    label="E-mail"
                    data-vv-name="email"
                    @change="dataValidate()"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex md6 xs12 s12>
                  <v-text-field
                    label="Télefono *"
                    :counter="11"
                    :maxlength="11"
                    v-model="dataForm.TelefonoSolicitante"
                    v-validate="{
                      required,
                      max: 11,
                      regex: /^(56)[0-9]\d{8}$/,
                    }"
                    :error-messages="errors.collect('telefono')"
                    data-vv-name="telefono"
                    pattern="^[0-9]"
                    @change="dataValidate()"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pt-4">
          <v-spacer></v-spacer>
          <div class="mb-2">
            <v-btn
              class="colortitle"
              color="white--text"
              @click="sendDataCrearSolicitud()"
              :disabled="boton"
            >
              Enviar solicitud
            </v-btn>
            <v-btn color="grey white--text" @click="dialog = false"
              >Cerrar</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogInvalidRut" width="400">
      <v-card>
        <v-card-title
          class="headline colortitle"
          primary-title
          color="white--text"
        >
          Crear solicitud de clave
        </v-card-title>
        <v-card-text><h4>El rut ingresado es invalido</h4></v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pt-4">
          <v-spacer></v-spacer>
          <v-btn color="grey white--text" @click="dialogInvalidRut = false"
            >Cerrar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogServiceResponse" width="400">
      <v-card>
        <v-card-title
          class="headline colortitle"
          primary-title
          color="white--text"
        >
          Crear solicitud de clave
        </v-card-title>
        <v-card-text
          ><h4>{{ messageServiceResponse }}</h4></v-card-text
        >
        <v-divider></v-divider>
        <v-card-actions class="pt-4">
          <v-spacer></v-spacer>
          <v-btn color="grey white--text" @click="dialogServiceResponse = false"
            >Cerrar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { LoadingService } from '@/services/loadingService';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Snotify } from '@/snotify/Snotify';
import { Funcionalidades } from '../../../config/funcionalidades';
import { ComponenteBase } from '../../../views/base/ComponenteBase';
import { SolicitarClaveService } from './SolicitarClave.service';

@Component({
  name: 'SolicitarClave',
})
export default class SolicitarClave extends Vue {
  //96941960-2
  SolicitarClaveService: SolicitarClaveService = new SolicitarClaveService();
  accionesTotales: any[];
  readonly funcionalidad: Funcionalidades = Funcionalidades.VerFacturacion;
  $snotify: Snotify;
  readonly loadingService = new LoadingService();
  dialog: boolean = false;
  dialogInvalidRut: boolean = false;
  dialogServiceResponse: boolean = false;
  messageServiceResponse: string = '';
  boton: boolean = true;
  submitted = false;
  rut: string = null;
  isValid = {
    form: false,
    rutEmpresa: false,
    nombre: false,
    apellido: false,
    rutUsuario: false,
    email: false,
    telefono: false,
  };

  dataForm = {
    RutCuenta: '',
    NombreSolicitante: '',
    ApellidoSolicitante: '',
    RutSolicitante: '',
    EmailSolicitante: '',
    TelefonoSolicitante: '',
  };
  dataValidate() {
    if (
      this.dataForm.ApellidoSolicitante === '' ||
      this.dataForm.EmailSolicitante === '' ||
      this.dataForm.NombreSolicitante === '' ||
      this.dataForm.EmailSolicitante === '' ||
      this.dataForm.RutCuenta === '' ||
      this.dataForm.TelefonoSolicitante === ''
    ) {
      return (this.boton = true);
    } else {
      return (this.boton = false);
    }
  }
  sendDataCrearSolicitud() {
    //this.dialog = false;
    if (this.isValid.rutEmpresa && this.isValid.rutUsuario) {
      this.postNewKey();
    } else {
      this.dialogInvalidRut = true;
    }
  }
  /*cambio($event: any) {
    console.log('event', $event);
  }*/
  validateRut(rut: string, tipo: string) {
    const sanitised = this.sanitiseRut(rut);
    const correlative = sanitised.slice(0, -1);
    const checkDigit = sanitised[sanitised.length - 1];
    const verifiedDigit = this.getCheckDigit(correlative);
    if (tipo == 'empresa') {
      this.isValid.rutEmpresa =
        checkDigit.toLowerCase() === verifiedDigit.toLowerCase();
      if (!this.isValid.rutEmpresa) {
        this.$snotify.error('El RUT Empresa ingresado no es válido', {
          timeout: 3000,
        });
      }
    } else {
      this.isValid.rutUsuario =
        checkDigit.toLowerCase() === verifiedDigit.toLowerCase();
      if (!this.isValid.rutUsuario) {
        this.$snotify.error('El RUT Solicitante ingresado no es válido', {
          timeout: 3000,
        });
      }
    }
  }
  sanitiseRut(rut: string): string {
    return rut.toString().replace(/[^\dKk]/g, '');
  }
  getCheckDigit(rut: string): string {
    const local = [...reverseStr(fullySanitiseRut(rut))];
    let sum = 0;
    let v = 2;
    for (let i = 0; i < local.length; i++, v < 7 ? v++ : (v = 2)) {
      sum += +local[i] * v;
    }

    const result = 11 - (sum % 11);
    if (result === 11) {
      return '0';
    } else if (result <= 9) {
      return result.toString();
    } else {
      return 'K';
    }
  }

  async postNewKey() {
    const axiosResponse = await this.SolicitarClaveService.postNewKey(
      this.dataForm
    );
    const msResponse = axiosResponse.data;
    console.log(msResponse);
    if (axiosResponse.status === 200) {
      if (msResponse.CODIGO_RESPUESTA == '1') {
        //console.log(msResponse.MensajeR);
        this.dialog = false;
        this.messageServiceResponse = msResponse.MENSAJE_RESPUESTA;
        this.dialogServiceResponse = true;
        this.dataForm.ApellidoSolicitante = '';
        this.dataForm.EmailSolicitante = '';
        this.dataForm.NombreSolicitante = '';
        this.dataForm.EmailSolicitante = '';
        this.dataForm.RutCuenta = '';
        this.dataForm.TelefonoSolicitante = '';
        this.dataForm.RutSolicitante = '';
      } else {
        this.$snotify.error(msResponse.MENSAJE_RESPUESTA, { timeout: 3000 });
      }
    } else {
      this.$snotify.error('Ha ocurrido un error. Intente nuevamente.', {
        timeout: 3000,
      });
    }
  }
}

function reverseStr(rut: string): string {
  return rut.split('').reduce((acc, char) => char + acc, '');
}

function fullySanitiseRut(rut: string): string {
  return rut.toString().replace(/\D/g, '');
}
</script>
<style scoped>
.colorbtn {
  background-color: #ffe700 !important;
}
.colortitle {
  background-color: #27488e !important;
  color: white;
}
</style>
