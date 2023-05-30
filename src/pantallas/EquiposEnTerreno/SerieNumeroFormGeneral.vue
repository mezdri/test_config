<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
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
                  :label="formFields.equipo.label"
                  v-model="formFields.equipo.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.ubicacion.label"
                  v-model="formFields.ubicacion.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.cantidad_activadores.label"
                  v-model="formFields.cantidad_activadores.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.compra_numero.label"
                  v-model="formFields.compra_numero.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.imei.label"
                  v-model="formFields.imei.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.fecha_bateria.label"
                  v-model="formFields.fecha_bateria.value"
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

@Component({
  components: {
    TextField,
    FormFieldsContainer,
  },
})
export default class SerieNumeroFormGeneral extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;

  async getSerie_by_id(
    serieNumeroSeleccionado: any,
    tipoEquipoSeleccionado: any
  ) {
    let self = this;
    this.loadingService.showLoading();

    return fetchReportesSerie(
      {
        serieNumeroSeleccionado: serieNumeroSeleccionado,
        tipoEquipoSeleccionado: tipoEquipoSeleccionado,
      },
      'equipo_stock_terreno/seriegeneral'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          if (data.data.data[0].serienumero.length !== 0) {
            self.formFields.serienumero.value = data.data.data[0].serienumero;
          } else {
            self.formFields.serienumero.value = '(Sin datos)';
          }
          if (data.data.data[0].tipoeqname.length !== 0) {
            self.formFields.equipo.value = data.data.data[0].tipoeqname;
          } else {
            self.formFields.equipo.value = '(Sin datos)';
          }
          if (data.data.data[0].tipoubicaname.length !== 0) {
            self.formFields.ubicacion.value = data.data.data[0].tipoubicaname;
          } else {
            self.formFields.ubicacion.value = '(Sin datos)';
          }
          if (data.data.data[0].seriecant_activa.length !== 0) {
            self.formFields.cantidad_activadores.value =
              data.data.data[0].seriecant_activa;
          } else {
            self.formFields.cantidad_activadores.value = '(Sin datos)';
          }

          if (data.data.data[0].compranumero.length !== 0) {
            self.formFields.compra_numero.value =
              data.data.data[0].compranumero;
          } else {
            self.formFields.compra_numero.value = '(Sin datos)';
          }
          if (data.data.data[0].seriebateria_fecha.length !== 0) {
            self.formFields.fecha_bateria.value =
              data.data.data[0].seriebateria_fecha;
          } else {
            self.formFields.fecha_bateria.value = '(Sin datos)';
          }
          if (data.data.data[0].serieimei.length !== 0) {
            self.formFields.imei.value = data.data.data[0].serieimei;
          } else {
            self.formFields.imei.value = '(Sin datos)';
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
    serienumero: {
      label: 'Serie Número',
      id: '',
      value: '',
    },
    equipo: {
      label: 'Tipo de Equipo',
      id: '',
      value: '',
    },
    ubicacion: {
      label: 'Ubicación',
      id: '',
      value: '',
    },
    cantidad_activadores: {
      label: 'Cant. de Activaciones',
      id: '',
      value: '',
    },
    compra_numero: {
      label: 'Orden de Compra',
      id: '',
      value: '',
    },
    imei: {
      label: 'Imei',
      id: '',
      value: '',
    },
    fecha_bateria: {
      label: 'Fecha Batería',
      id: '',
      value: '',
    },
  };
  mounted() {
    this.getSerie_by_id(
      this.serieNumeroSeleccionado,
      this.tipoEquipoSeleccionado
    );
  }
}
</script>
