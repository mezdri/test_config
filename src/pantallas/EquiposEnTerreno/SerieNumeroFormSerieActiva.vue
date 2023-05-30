<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <FormFieldsContainer titulo="Detalle de Preparación">
              <slot name="prependInformacionGeneral" />
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.epc.label"
                  v-model="formFields.epc.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4 style="display: none">
                <v-text-field
                  :label="formFields.serieactivanro.label"
                  v-model="formFields.serieactivanro.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.fecha_alta.label"
                  v-model="formFields.fecha_alta.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.arriendo.label"
                  v-model="formFields.arriendo.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-checkbox
                  v-if="formFields.serieactivaplata_ingresada.value == 'S'"
                  :label="formFields.serieactivaplata_ingresada.label"
                  v-model="formFields.serieactivaplata_ingresada.value"
                  :disabled="modoVer"
                />
                <v-checkbox
                  v-if="formFields.serieactivaplata_ingresada.value == 'N'"
                  :label="formFields.serieactivaplata_ingresada.label"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.activacion.label"
                  v-model="formFields.activacion.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.plataforma_activa.label"
                  v-model="formFields.plataforma_activa.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.id_dispositivo.label"
                  v-model="formFields.id_dispositivo.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.avl.label"
                  v-model="formFields.avl.value"
                  :disabled="modoVer"
                />
              </v-flex>

              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.simserienumero.label"
                  v-model="formFields.simserienumero.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.simmovil.label"
                  v-model="formFields.simmovil.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.telconame.label"
                  v-model="formFields.telconame.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.telcoplanname.label"
                  v-model="formFields.telcoplanname.value"
                  :disabled="modoVer"
                />
              </v-flex>

              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.estado.label"
                  v-model="formFields.estado.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.vehiculo_patente.label"
                  v-model="formFields.vehiculo_patente.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.fecha_baja.label"
                  v-model="formFields.fecha_baja.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.obs.label"
                  v-model="formFields.obs.value"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { fetchReportesSerie } from './fetchReporteSerie';
import moment from 'moment';
@Component({
  components: {
    TextField,
    FormFieldsContainer,
  },
})
export default class SerieNumeroFormSerieActiva extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;
  @Prop({ default: null }) serieactivanroSeleccionado: any;
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;
  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);

  async getSerieActiva_by_id(
    serieNumeroSeleccionado: any,
    tipoEquipoSeleccionado: any,
    serieactivanroSeleccionado: any
  ) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        serieNumeroSeleccionado: serieNumeroSeleccionado,
        tipoEquipoSeleccionado: tipoEquipoSeleccionado,
        serieactivanroSeleccionado: serieactivanroSeleccionado,
      },
      'equipo_stock_terreno/serieactiva'
    )
      .then((data: any) => {
        console.log('====>', data.data.data[0].estado, '', data.data.data[0]);
        if (data.data.CODIGO_RESPUESTA == '1') {
          if (data.data.data[0].estado.length !== 0) {
            self.formFields.estado.value = data.data.data[0].estado;
          } else {
            self.formFields.estado.value = '(Sin datos)';
          }
          if (data.data.data[0].configvalor.length !== 0) {
            self.formFields.activacion.value = data.data.data[0].configvalor;
          } else {
            self.formFields.activacion.value = '(Sin datos)';
          }
          if (data.data.data[0].patente_vehiculo.length !== 0) {
            self.formFields.vehiculo_patente.value =
              data.data.data[0].patente_vehiculo;
          } else {
            self.formFields.vehiculo_patente.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivaavl.length !== 0) {
            self.formFields.avl.value = data.data.data[0].serieactivaavl;
          } else {
            self.formFields.avl.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivaes_arriendo.length !== 0) {
            self.formFields.arriendo.value =
              data.data.data[0].serieactivaes_arriendo;
          } else {
            self.formFields.arriendo.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivafecha_alta.length !== 0) {
            self.formFields.fecha_alta.value = moment(
              data.data.data[0].serieactivafecha_alta
            ).format('YYYY/MM/DD HH:mm:ss');
          } else {
            self.formFields.fecha_alta.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivafecha_baja.length !== 0) {
            self.formFields.fecha_baja.value = moment(
              data.data.data[0].serieactivafecha_baja
            ).format('YYYY/MM/DD HH:mm:ss');
          } else {
            self.formFields.fecha_baja.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivafecha_instala.length !== 0) {
            self.formFields.fecha_instalacion.value =
              data.data.data[0].serieactivafecha_instala;
          } else {
            self.formFields.fecha_instalacion.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivaid_dispositivo.length !== 0) {
            self.formFields.id_dispositivo.value =
              data.data.data[0].serieactivaid_dispositivo;
          } else {
            self.formFields.id_dispositivo.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivanro.length !== 0) {
            self.formFields.serieactivanro.value =
              data.data.data[0].serieactivanro;
          } else {
            self.formFields.serieactivanro.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivaobs.length !== 0) {
            self.formFields.obs.value = data.data.data[0].serieactivaobs;
          } else {
            self.formFields.obs.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivaplata_fecha.length !== 0) {
            self.formFields.plataforma_activa.value = moment(
              data.data.data[0].serieactivaplata_fecha
            ).format('YYYY/MM/DD HH:mm:ss');
          } else {
            self.formFields.plataforma_activa.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivaplata_ingresada.length !== 0) {
            self.formFields.serieactivaplata_ingresada.value =
              data.data.data[0].serieactivaplata_ingresada;
          } else {
            self.formFields.serieactivaplata_ingresada.value = '(Sin datos)';
          }
          if (data.data.data[0].simprefijo.length !== 0) {
            self.formFields.simprefijo.value = data.data.data[0].simprefijo;
          } else {
            self.formFields.simprefijo.value = '(Sin datos)';
          }
          if (data.data.data[0].simmovil.length !== 0) {
            self.formFields.simmovil.value = data.data.data[0].simmovil;
          } else {
            self.formFields.simmovil.value = '(Sin datos)';
          }
          if (data.data.data[0].simserienumero.length !== 0) {
            self.formFields.simserienumero.value =
              data.data.data[0].simserienumero;
          } else {
            self.formFields.simserienumero.value = '(Sin datos)';
          }
          if (data.data.data[0].telconame.length !== 0) {
            self.formFields.telconame.value = data.data.data[0].telconame;
          } else {
            self.formFields.telconame.value = '(Sin datos)';
          }
          if (data.data.data[0].telcoplanname.length !== 0) {
            self.formFields.telcoplanname.value =
              data.data.data[0].telcoplanname;
          } else {
            self.formFields.telcoplanname.value = '(Sin datos)';
          }
          if (data.data.data[0].serieactivaepc.length !== 0) {
            self.formFields.epc.value = data.data.data[0].serieactivaepc;
          } else {
            self.formFields.epc.value = '(Sin datos)';
          }
          console.log(data.data.data);
          return data.data.data;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  formFields: FormFieldDefMap = {
    activacion: {
      label: 'Plataforma',
      id: '',
      value: '',
    },
    id_dispositivo: {
      label: 'ID Dispositivo',
      id: '',
      value: '',
    },
    simprefijo: {
      label: 'Prefijo de la SIM',
      id: '',
      value: '',
    },
    telconame: {
      label: 'Nombre Telco',
      id: '',
      value: '',
    },
    telcoplanname: {
      label: 'Plan',
      id: '',
      value: '',
    },
    simmovil: {
      label: 'SIM Móvil',
      id: '',
      value: '',
    },
    simserienumero: {
      label: 'SIM Número',
      id: '',
      value: '',
    },
    serieactivaplata_ingresada: {
      label: 'Serie en Plataforma',
      id: '',
      value: '',
    },
    plataforma_activa: {
      label: 'Fecha en Plataforma',
      id: '',
      value: '',
    },
    serieactivanro: {
      label: 'Activación Número',
      id: '',
      value: '',
    },
    plataforma: {
      label: 'Plataforma',
      id: '',
      value: '',
    },
    registrada: {
      label: 'Estado en plataforma',
      id: '',
      value: '',
    },
    usuario_modifica: {
      label: 'Usuario que modifica',
      id: '',
      value: '',
    },
    fecha_modifica: {
      label: 'Fecha de modificación',
      id: '',
      value: '',
    },
    modem: {
      label: 'Modem',
      id: '',
      value: '',
    },
    avl: {
      label: 'AVL',
      id: '',
      value: '',
    },
    sim_numero: {
      label: 'SIM Número',
      id: '',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: '',
      value: '',
    },
    fecha_alta: {
      label: 'Fecha de Preparación',
      id: '',
      value: '',
    },
    fecha_instalacion: {
      label: 'Estado',
      id: '',
      value: '',
    },
    vehiculo_patente: {
      label: 'Vehículo Patente',
      id: '',
      value: '',
    },
    fecha_baja: {
      label: 'Fecha Desinstalación',
      id: '',
      value: '',
    },
    obs: {
      label: 'Observación de Desinstalación',
      id: '',
      value: '',
    },
    asignacion: {
      label: 'Asignación',
      id: '',
      value: '',
    },
    requerimiento: {
      label: 'Requerimiento',
      id: '',
      value: '',
    },
    arriendo: {
      label: 'Modalidad',
      id: '',
      value: '',
    },
    epc: {
      label: 'EPC',
      id: '',
      value: '',
    },
  };

  mounted() {
    this.getSerieActiva_by_id(
      this.serieNumeroSeleccionado,
      this.tipoEquipoSeleccionado,
      this.serieactivanroSeleccionado
    );
  }
}
</script>
