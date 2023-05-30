<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <div class="boton_crear" style="">
              <v-btn
                @click="editar"
                class="icon"
                style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;

margin: 0 0 0 auto;"
              >
                <span style="color: white;" class="color-blanco">Guardar</span>
              </v-btn>
            </div>
            <FormFieldsContainer titulo="General">
              <slot name="prependInformacionGeneral" />

              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.serienumero.label"
                  v-model="formFields.serienumero.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.prefijo.label"
                  v-model="formFields.prefijo.value"
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
                <v-combobox
                  v-if="planSinDatos == false"
                  :label="formFields.telcoplanname.label"
                  v-model="formFields.telcoplanname.value"
                  :items="planlist"
                  item-text="telcoplanname"
                  item-value="telcoplanid"
                />
                <v-text-field
                  v-if="planSinDatos"
                  :label="formFields.telcoplanname.label"
                  v-model="formFields.telcoplanname.value"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.simprovision_fecha.label"
                  v-model="formFields.simprovision_fecha.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.simtamanio.label"
                  v-model="formFields.simtamanio.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-combobox
                  v-if="apnSinDatos == false"
                  :label="formFields.simapn.label"
                  v-model="formFields.simapn.value"
                  :items="apnlist"
                  item-text="telcoapnname"
                  item-value="telcoapnid"
                />
                <v-text-field
                  v-if="apnSinDatos"
                  :label="formFields.simapn.label"
                  v-model="formFields.simapn.value"
                  disabled
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.simingresonumero.label"
                  v-model="formFields.simingresonumero.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.simingresofecha.label"
                  v-model="formFields.simingresofecha.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.configvalor.label"
                  v-model="formFields.configvalor.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.tipoubicaname.label"
                  v-model="formFields.tipoubicaname.value"
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
export default class SimNumeroFormGeneral extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) nuncaEdit: boolean;
  @Prop({ default: false }) modoEditar: boolean;

  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;

  readonly $snotify: Snotify;

  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;
  apnSinDatos: boolean = false;
  planSinDatos: boolean = false;
  estadolist: any = [];
  fecha_sim: any = '';
  apnlist: any[] = [];
  planlist: any[] = [];
  apn: any = {};
  async getSerie_by_id(serieNumeroSeleccionado: any) {
    let self = this;
    this.loadingService.showLoading();

    return fetchReportesSerie(
      {
        serienumero: serieNumeroSeleccionado,
      },
      'conecta_inventario_sim/general'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          if (data.data.data.simserienumero.length !== 0) {
            self.formFields.serienumero.value = data.data.data.simserienumero;
          } else {
            self.formFields.serienumero.value = '(Sin datos)';
          }
          if (data.data.data.simprefijo.length !== 0) {
            self.formFields.prefijo.value = data.data.data.simprefijo;
          } else {
            self.formFields.prefijo.value = '(Sin datos)';
          }
          if (data.data.data.simmovil.length !== 0) {
            self.formFields.simmovil.value = data.data.data.simmovil;
          } else {
            self.formFields.simmovil.value = '(Sin datos)';
          }
          if (data.data.data.telconame.length !== 0) {
            self.formFields.telconame.value = data.data.data.telconame;
          } else {
            self.formFields.telconame.value = '(Sin datos)';
          }
          if (data.data.data.telcoplanname.length !== 0) {
            self.formFields.telcoplanname.value = data.data.data.telcoplanname;
          } else {
            self.formFields.telcoplanname.value = '(Sin datos)';
          }
          if (data.data.data.simprovision_fecha.length !== 0) {
            self.formFields.simprovision_fecha.value =
              data.data.data.simprovision_fecha;
          } else {
            self.formFields.simprovision_fecha.value = '(Sin datos)';
          }
          if (data.data.data.simtamanio.length !== 0) {
            self.formFields.simtamanio.value = data.data.data.simtamanio;
          } else {
            self.formFields.simtamanio.value = '(Sin datos)';
          }
          if (data.data.data.simapn.length !== 0) {
            self.formFields.simapn.value = data.data.data.simapn;
          } else {
            self.formFields.simapn.value = '(Sin datos)';
          }
          if (data.data.data.simingresonumero.length !== 0) {
            self.formFields.simingresonumero.value =
              data.data.data.simingresonumero;
          } else {
            self.formFields.simingresonumero.value = '(Sin datos)';
          }
          if (data.data.data.configvalor.length !== 0) {
            self.formFields.configvalor.value = data.data.data.configvalor;
          } else {
            self.formFields.configvalor.value = '(Sin datos)';
          }
          if (data.data.data.tipoubicaname.length !== 0) {
            self.formFields.tipoubicaname.value = data.data.data.tipoubicaname;
          } else {
            self.formFields.tipoubicaname.value = '(Sin datos)';
          }
          if (data.data.data.simprovision_fecha.length !== 0) {
            self.formFields.simprovision_fecha.value = moment(
              data.data.data.simprovision_fecha
            ).format('YYYY-MM-DD');
          } else {
            self.formFields.simprovision_fecha.value = '(Sin datos)';
          }
          if (data.data.data.simingresofecha_alta.length !== 0) {
            self.formFields.simingresofecha.value = moment(
              data.data.data.simingresofecha_alta
            ).format('YYYY-MM-DD');
          } else {
            self.formFields.simingresofecha.value = '(Sin datos)';
          }
          if (data.data.TELCOAPNNAME[0].STATUS == 'SIN_DATA') {
            self.apnSinDatos = true;
          } else {
            self.apnlist = data.data.TELCOAPNNAME;
          }
          if (data.data.TELCOPLANNAME[0].STATUS == 'SIN_DATA') {
            self.planSinDatos = true;
          } else {
            self.planlist = data.data.TELCOPLANNAME;
          }
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
  plan: any;
  apn_editar: any;
  plan_editar: any;
  async editar() {
    let self = this;
    self.apn = self.formFields.simapn.value;
    if (self.apn.telcoapnid == undefined) {
      self.apn_editar = '(Sin datos)';
    } else {
      self.apn_editar = self.apn.telcoapnid;
    }
    self.plan = self.formFields.telcoplanname.value;
    if (self.plan.telcoplanid == undefined) {
      self.plan_editar = '(Sin datos)';
    } else {
      self.plan_editar = self.plan.telcoplanid;
    }

    this.loadingService.showLoading();

    return fetchReportesSerie(
      {
        usuarioid_modifica: JSON.parse(localStorage.getItem('user')).id,
        usuariorut_modifica: JSON.parse(localStorage.getItem('user'))
          .rutClienteDefecto,
        serienumero: self.formFields.serienumero.value,
        telcoapnid: self.apn_editar,
        telcoplanid: self.plan_editar,
      },
      'conecta_inventario_sim/general_editar'
    )
      .then((data: any) => {
        if (self.formFields.serienumero.value == '') {
          self.$snotify.error('El campo APN debe ser diligenciado', {
            timeout: 3000,
          });
        }
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.formFields.simapn.value = data.data.data.simapn;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.success('Actualizado con éxito', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  formFields: FormFieldDefMap = {
    serienumero: {
      label: 'Número',
      id: '',
      value: '',
    },
    prefijo: {
      label: 'Prefijo',
      id: '',
      value: '',
    },
    simmovil: {
      label: 'Móvil',
      id: '',
      value: '',
    },
    telconame: {
      label: 'Telco',
      id: '',
      value: '',
    },
    telcoplanname: {
      label: 'Plan',
      id: '',
      value: '',
    },
    simprovision_fecha: {
      label: 'Fecha de Provisión',
      id: '',
      value: '',
    },
    simtamanio: {
      label: 'Tamaño',
      id: '',
      value: '',
    },
    simapn: {
      label: 'APN',
      id: '',
      value: '',
    },
    configvalor: {
      label: 'Estado',
      id: '',
      value: '',
    },
    simingresonumero: {
      label: 'Número de Ingreso',
      id: '',
      value: '',
    },
    tipoubicaname: {
      label: 'Ubicación',
      id: '',
      value: '',
    },
    simingresofecha: {
      label: 'Fecha Ingreso SIM',
      id: '',
      value: '',
    },
  };

  mounted() {
    this.getSerie_by_id(this.serieNumeroSeleccionado);
  }
}
</script>
