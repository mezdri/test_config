<template>
  <div>
    <v-flex sucursal-virutal wrapper-widget>
      <!--v-flex sm12 md12>
        <p>{{ Empresa }}</p>
      </v-flex-->
      <v-flex sm12 md12>
        <p>Ejecutivo<br />{{ Ejecutivo }}</p>
      </v-flex>
      <v-btn class="contactar-ejecutivo" @click="contactarEjecutivo">
        <v-icon>mail</v-icon><span>Ejecutivo</span>
      </v-btn>
    </v-flex>
    <ContactarEjecutivoModal
      v-if="mostrarModalContactarEjecutivo"
      @cerrar="handleCierreModalContactarEjecutivo"
      :usuarioSeleccionado="usuarioSeleccionado"
    />
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

@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
    ContactarEjecutivoModal,
  },
})
export default class WidgetUser extends Vue {
  mostrarModalContactarEjecutivo: boolean = false;
  usuarioSeleccionado: any = null;
  readonly $snotify: Snotify;

  Empresa: string = '';
  Ejecutivo: string = '';

  get_ejecutivo() {
    let ejecutivo = JSON.parse(window.localStorage.user)['Ejecutivo'];
    if (ejecutivo == undefined || ejecutivo == '') {
      ejecutivo = 'No asignado';
    }
    return ejecutivo;
  }

  contactarEjecutivo() {
    this.mostrarModalContactarEjecutivo = true;
  }
  getNombreEmpresa() {
    const axios = new AxiosVue(ServicioProxy.Metabase);
    let that = this;
    axios.http
      .post(`Metabase/PostgenericA/track/get_razon_social`, {
        clienteid: window.localStorage.clienteDefecto,
      })
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          that.Empresa = data.data.nombre;
        } else {
          this.$snotify.error(
            'Error al obtener Razón Social para Sucursal Virtual',
            { timeout: 3000 }
          );
          return false;
        }
      });
  }
  handleCierreModalContactarEjecutivo() {
    this.mostrarModalContactarEjecutivo = false;
  }

  constructor() {
    super();
  }
  async mounted() {
    this.Ejecutivo = this.get_ejecutivo();
    //this.getNombreEmpresa();
    //let el1 = document.getElementsByClassName('wrapper-widget')[0];
    //console.log(el1);
    //document.getElementsByTagName('main')[0].appendChild(el1);
    let mt = document.getElementsByTagName('nav')[0].children[0] as HTMLElement;
    let h = mt.style.height;
    //console.log(mt);
    let wr = document.getElementsByClassName(
      'wrapper-widget'
    )[0] as HTMLElement;
    wr.style.marginTop = h;
    //document.getElementsByClassName('wrapper-widget')[0].style.height=mt;
  }
}
</script>
<style>
.sucursal-virutal {
  display: flex;
  flex-direction: column;
}

.sucursal-virutal.wrapper-widget .contactar-ejecutivo {
  background-color: #ffe700 !important;
}
.sucursal-virutal.wrapper-widget {
  margin-top: 64px;
  position: fixed;
  top: 10px;
  right: 10px;
  max-width: 205px;
  background-color: #f5f5f5;
  /*border: 1px solid #e0e0e0;*/
  padding: 10px;
  word-wrap: break-word;
  z-index: 2;
  border: none;
}
.sucursal-virutal.wrapper-widget p {
  margin-bottom: 0px;
  color: #4f4f4f !important;
  font-weight: 600;
  position: relative;
  pointer-events: none;
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
  .sucursal-virutal.wrapper-widget {
    background-color: transparent !important;
  }
}
</style>
