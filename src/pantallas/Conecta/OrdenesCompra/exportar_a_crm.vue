<template>
  <ModalMantenedor :show="show" v-model="show">
    <CabeceraModal titulo="Exportar a CRM" @cerrar="closeModal"></CabeceraModal>
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
          <span>Detalle</span>
          <v-icon>info</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />

      <div align="center" class="orden_compra">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-form ref="form" lazy-validation class="col-md-12">
              <v-container grid-list-md>
                <h1 v-if="id_orden_compra != null">
                  Exportar a CRM Orden de Compra: {{ id_orden_compra }}
                </h1>

                <FormFieldsContainer titulo="Exportar">
                  <!--  https://fonts.google.com/icons  -->
                  <!--
                    <v-flex sm6 md6>
                      <div class="layout row wrap">
                        <div class="flex xs8 sm8 md8">
                          <v-text-field
                            xs3
                            sm3
                            md3
                            label="Seleccione Archivo Para carga masiva de series"
                            heigh
                            @click="$refs.image.click()"
                            v-model="fileName"
                            :error-messages="errors.collect('archivo')"
                            data-vv-name="archivo"
                            readonly="readonly"
                          >
                          </v-text-field>
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            clearable
                            ref="image"
                            style="display: none;"
                            @change="prepare_file_upload"
                            id="archivoExcel"
                          />
                        </div>
                        <div class="flex xs2 sm2 md2">
                          <v-btn
                            style="margin-top: 10px;"
                            v-show="fileName"
                            @click="quitarRegistro"
                            >✖</v-btn
                          >
                        </div>
                        <div class="flex xs2 sm2 md2">
                          <v-btn
                            class="btn-sucursal"
                            style="margin-top: 10px;"
                            @click="subirExcel"
                            v-bind:disabled="archivoB64 == ''"
                          >
                            <v-icon>attach_file</v-icon>Cargar
                          </v-btn>
                        </div>
                      </div>
                    </v-flex>
  
                    <br />
                    -->
                  <v-divider></v-divider>
                  <br />
                  <v-flex xs12 sm12 md12 layout>
                    <div align="left" class="divP">
                      <p class="aclaracion">
                        Se recomienda utilizar el formato de la siguiente
                        plantilla para evitar conflictos al momento de cargar la
                        solicitud.
                        <br />
                        Por favor, ingresar los datos según los formatos que se
                        muestran en la fila de ejemplo de la plantilla.
                      </p>
                      <v-btn
                        flat
                        small
                        color="primary"
                        class="btnPlantilla"
                        @click="descargarPlantilla"
                        style=" padding: 0; margin-left: 0; "
                      >
                        <v-icon class="importExportBtnIcon"
                          >cloud_download</v-icon
                        >&nbsp;&nbsp;
                        <span class="importExportBtnTexto"
                          >Descargar Plantilla</span
                        >
                      </v-btn>
                    </div>
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-form>
          </v-card>
        </v-flex>
      </div>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

import { AlertaGrilla } from '@/pantallas/Camaras/Alertas/fetchAlerta';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import moment from 'moment';
import { fetchOrdenesCompra } from './fetchOrdenesCompra';
import { utils, writeFileXLSX } from 'xlsx';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    FormFieldsContainer,
    DatePicker,
  },
})
export default class ModalExportarCRM extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: false }) dialog: boolean;
  @Prop({ default: null }) id_orden_compra: any;
  //@Prop({ default: null }) po_sel: any;

  archivoB64: any = '';
  fileName: any = '';

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };

  showInfo: boolean = true;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  //showReporteGenerado: boolean = false;
  //texto_reporte: string = 'TEXTO CUERPO MODAL';

  handleInfoGeneral() {
    this.showInfo = true;
  }
  mounted() {
    console.log('onDialogChanged');
    console.log('abro modal cargar archivo');
  }

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    console.log(id);
    return id;
  }

  closeModal() {
    console.log('closeModal Cargar archivo');
    this.$emit('modalOrdenCompraEmit', false);
  }

  getCliente() {
    /*  TODO VERIFICAR */
    let user = localStorage.getItem('user');
    let clienteDefecto = JSON.parse(
      localStorage.getItem('user').replace(/'/g, '"')
    ).clienteDefecto;
    return clienteDefecto;
  }

  descargarPlantilla() {
    this.loadingService.showLoading(undefined, 'get_tipoeqname_from_oc');
    return fetchOrdenesCompra(
      {
        id_orden_compra: this.id_orden_compra,
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/get_tipoeqname_from_oc'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('get_tipoeqname_from_oc');
        if (Number(data.data.CODIGO_RESPUESTA) > 1) {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA);
        } else {
          console.log(data.data.LISTA);
          let headers = {
            //header: ['Equipo y Periferico','Suma de comprobación de fila','Fecha de modificación','Nombre','Identificador','Razón para el estado','Propiedad Equipo','Propietario','Producto','Serie','Plataforma','Cambio de Batería','Simcard','Fecha Cambio de Batería','Observaciones'],
          };
          const ws = utils.json_to_sheet(data.data.LISTA, headers);
          const wb = utils.book_new();
          utils.book_append_sheet(wb, ws, 'Plantilla');
          writeFileXLSX(wb, 'ExportarCRM.xlsx');
          this.$snotify.success('Plantilla Excel descargada con éxito');
        }
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  } //end descargar plantilla
} //end class
</script>
