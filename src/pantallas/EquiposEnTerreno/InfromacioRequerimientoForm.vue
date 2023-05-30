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
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex x4 sm4 md4>
                <v-text-field
                  v-model="formFields.fecha.value"
                  :label="formFields.fecha.label"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  v-model="formFields.requerimiento.value"
                  :label="formFields.requerimiento.label"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  v-model="formFields.adp.value"
                  :label="formFields.adp.label"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  v-model="formFields.rut_cliente.value"
                  :label="formFields.rut_cliente.label"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  v-model="formFields.cliente.value"
                  :label="formFields.cliente.label"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  v-model="formFields.flota.value"
                  :label="formFields.flota.label"
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
import moment from 'moment';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import VerDetalleRutaModal from './VerDetalleModal.vue';
import { fetchReportesSerie } from './fetchReporteSerie';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
    VerDetalleRutaModal,
  },
})
export default class InfromacioRequerimientoForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: null }) reporte_Seleccionado: any;
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;
  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);

  async getOrders_by_id(reporte_Seleccionado: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { reporte_Seleccionado: reporte_Seleccionado },
      'equipo_stock_terreno/informacion'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          if (data.data.data[0].asigfecha_alta.length !== 0) {
            self.formFields.fecha.value = moment(
              data.data.data[0].asigfecha_alta
            ).format('YYYY/MM/DD HH:mm:ss');
          } else {
            self.formFields.fecha.value = '(Sin datos)';
          }

          if (data.data.data[0].asigrequerimiento.length !== 0) {
            self.formFields.requerimiento.value =
              data.data.data[0].asigrequerimiento;
          } else {
            self.formFields.requerimiento.value = '(Sin datos)';
          }

          if (data.data.data[0].asigcrm_adp.length !== 0) {
            self.formFields.adp.value = data.data.data[0].asigcrm_adp;
          } else {
            self.formFields.adp.value = '(Sin datos)';
          }

          if (data.data.data[0].asigcrm_rutcli.length !== 0) {
            self.formFields.rut_cliente.value =
              data.data.data[0].asigcrm_rutcli;
          } else {
            self.formFields.rut_cliente.value = '(Sin datos)';
          }

          if (data.data.data[0].asigcrm_cliente.length !== 0) {
            self.formFields.cliente.value = data.data.data[0].asigcrm_cliente;
          } else {
            self.formFields.cliente.value = '(Sin datos)';
          }
          if (data.data.data[0].asigcrm_flota.length !== 0) {
            self.formFields.flota.value = data.data.data[0].asigcrm_flota;
          } else {
            self.formFields.flota.value = '(Sin datos)';
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

  formFields: FormFieldDefMap = {
    fecha: {
      label: 'Fecha de Alta',
      id: '',
      value: '',
    },
    requerimiento: {
      label: 'Requerimiento',
      id: '',
      value: '',
    },
    rut_cliente: {
      label: 'Rut Cliente',
      id: '',
      value: '',
    },
    adp: {
      label: 'ADP',
      id: '',
      value: '',
    },
    flota: {
      label: 'Flota',
      id: '',
      value: '',
    },
    cliente: {
      label: 'Cliente',
      id: '',
      value: '',
    },
  };

  mounted() {
    this.getOrders_by_id(this.reporte_Seleccionado);
  }
}
</script>
