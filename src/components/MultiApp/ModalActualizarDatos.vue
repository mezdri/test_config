<template>
  <div class="wrap-evidencia">
    <div id="myModal2" class="modalEnvio">
      <!-- Modal content -->
      <div class="modalEnvio-content" style="width:40%!important;">
        <div>
          <div class="titleEvidencia">
            <h3
              class="importExportBtnIcon"
              style="font-size: 20px!important;margin-bottom: 20px!important;"
            >
              Por favor completa los datos del contacto principal de tu empresa
            </h3>
          </div>
          <div class="buttonClose buttonCloseEvidencia" align="right">
            <v-btn flat small color="primary" @click="closeEnvio()">
              <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
              <span class="importExportBtnTexto">Cerrar</span>
            </v-btn>
          </div>
          <v-flex sm12 md12>
            <span>Nombre: </span><span>{{ nombre }}</span>
          </v-flex>
          <v-flex sm12 md12>
            <v-text-field
              v-show="edittelefono"
              v-model="telefono"
              label="Teléfono"
              single-line
              type="number"
            />
          </v-flex>
          <v-flex sm12 md12>
            <v-text-field
              show="editmail"
              v-model="correo"
              label="Email"
              type="email"
              single-line
              @blur="validateEmail"
            />
          </v-flex>
          <v-flex sm12 md12>
            <div class="text-sm-center">
              <v-btn
                flat
                icon
                small
                @click="handleActualizarDatosClick"
                style="margin-top: 20px;"
              >
                <v-icon class="importExportBtnIcon">send</v-icon>&nbsp;&nbsp;
                Actualizar
              </v-btn>
            </div>
          </v-flex>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { isFunction } from 'lodash';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import { Snotify } from '@/snotify/Snotify';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import ContactarEjecutivoModal from '@/pantallas/SucursalVirtual/ContactarEjecutivo/ContactarEjecutivo.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { fetchMS } from './reusables/fetchMS';
import { LoadingService } from '@/services/loadingService';

@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
    ContactarEjecutivoModal,
  },
})
export default class ModalActualizarDatos extends Vue {
  @Prop({ required: true }) edittelefono: boolean;
  @Prop({ required: true }) editmail: boolean;
  @Prop({ required: true }) nombre: string;

  mostrarModalContactarEjecutivo: boolean = false;
  usuarioSeleccionado: any = null;
  readonly $snotify: Snotify;
  showEnviarCorreo: boolean = true;
  loadingService = new LoadingService();

  Empresa: string = '';
  Ejecutivo: string = '';

  correo: string = '';
  telefono: string = '';

  handleCierreModalContactarEjecutivo() {
    this.mostrarModalContactarEjecutivo = false;
  }

  constructor() {
    super();
  }
  async mounted() {
    //this.Ejecutivo = this.get_ejecutivo();
    //this.getNombreEmpresa();
    //let el1 = document.getElementsByClassName('wrapper-widget')[0];
    //console.log(el1);
    //document.getElementsByTagName('main')[0].appendChild(el1);
    //let mt = document.getElementsByTagName('nav')[0].children[0] as HTMLElement;
    //let h = mt.style.height;
    //console.log(mt);
    //let wr = document.getElementsByClassName(
    'wrapper-widget';
    //)[0] as HTMLElement;
    //wr.style.marginTop = h;
    //document.getElementsByClassName('wrapper-widget')[0].style.height=mt;
  }
  validateEmail() {
    if (this.correo == '') {
      return false;
    }
    if (
      //eslint-disable-next-line
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        this.correo.trim()
      )
    ) {
      return true;
    } else {
      this.$snotify.error('Correo ' + this.correo + ' no es válido', {
        timeout: 3000,
      });
      return false;
    }
  }

  validateTelefono() {
    if (this.telefono == '') {
      return false;
    }
    if (
      //eslint-disable-next-line
      /^([+56])(\d{10})$/.test(this.telefono.trim())
    ) {
      return true;
    } else {
      this.$snotify.error(
        'Teléfono ' +
          this.telefono +
          ' no es válido. Debe incluir prefijo. (Ej: +56)',
        {
          timeout: 3000,
        }
      );
      return false;
    }
  }

  async handleActualizarDatosClick() {
    console.log(this.telefono);
    console.log(this.correo);
    if (this.edittelefono && !this.validateTelefono()) {
      return false;
    }
    if (this.editmail && !this.validateEmail()) {
      return false;
    }
    let resp: any = (await this.ActualizarDatos()) || [];
    console.log(resp);

    if (resp.data.CODIGO_RESPUESTA == '1') {
      this.$snotify.success(resp.data.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.handleCerrar();
    } else {
      this.$snotify.error(resp.data.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.handleCerrar();
    }
  }

  ActualizarDatos() {
    let body: any = {};
    let self = this;
    body.user_id = JSON.parse(window.localStorage.user).id;
    body.telefono = this.telefono;
    body.correo = this.correo;
    body.edittelefono = this.edittelefono;
    body.editmail = this.editmail;
    return fetchMS(body, 'ActualizarDatos')
      .catch((error: any) => {
        console.log(error);
        self.$snotify.error('Ocurrió un error. Intente nuevamente.', {
          timeout: 3000,
        });
      })
      .finally(() => {
        self.loadingService.hideLoading();
      });
  }

  handleCerrar() {
    this.$emit('cerrarActualizarDatos');
  }
}
</script>
<style>
.sucursal-virutal.wrapper-widget .contactar-ejecutivo {
  background-color: #ffe700 !important;
}
.sucursal-virutal.wrapper-widget {
  margin-top: 64px;
  position: fixed;
  top: 0;
  right: 0;
  max-width: 205px;
  background: #fafafa;
  /*border: 1px solid #e0e0e0;*/
  padding: 10px;
  word-wrap: break-word;
  z-index: 2;
}
.sucursal-virutal.wrapper-widget p {
  margin-bottom: 0px;
  color: #000 !important;
}
.sucursal-virutal.wrapper-widget button {
  padding: 5px;
  margin: 0 auto;
  margin-top: 5px !important;
  box-shadow: none !important;
  width: 100%;
}
.sucursal-virutal.wrapper-widget button span {
  font-size: 12px;
  margin-left: 5px;
}

@media only screen and (max-width: 600px) {
  .sucursal-virutal.wrapper-widget div.flex {
    display: none;
  }
  .sucursal-virutal.wrapper-widget button span {
    display: none;
  }
}
</style>
