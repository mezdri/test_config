<template>
  <div>
    <v-layout row wrap>
      <v-flex xs6 sm4 md4>
        <v-text-field
          v-validate="'required|numeric|max:10'"
          v-model="formFields.nroFolio.value"
          :label="formFields.nroFolio.label"
          :error-messages="errors.collect('nroFolio')"
          data-vv-name="nroFolio"
          required
          :counter="10"
        />
      </v-flex>
      <v-flex xs6 sm1 md1>
        <div class="text-xs-center">
          <v-btn flat icon small @click="handleBuscarClick">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn flat icon small @click="clearFilters">
            <v-icon>clear</v-icon>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <br />
    <div id="div_Cert" align="center" style="display:none;">
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container>
            <div align="left">
              <v-flex md12>
                <h2 class="h2_title" style="margin-top: 12px!important;">
                  Certificado {{ txtFolio }}
                </h2>
              </v-flex>
            </div>
            <v-divider></v-divider>
            <br />
            <v-layout wrap>
              <v-flex xs12 sm12 md12>
                <embed
                  :src="urlPdf"
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import { LoadingService } from '@/services/loadingService';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchFolio } from '@/pantallas/ConsultarFolio/fetchFolio';
import { date, number } from 'node_modules/@types/yup';
import { Snotify } from '@/snotify/Snotify';

@Component({
  components: {
    FormFieldsContainer,
  },
})
export default class ConsultarFolio extends Vue {
  //definición de campos
  formFields: FormFieldDefMap = {
    nroFolio: {
      label: 'Número de Folio',
      id: 'nroFolio',
      value: '',
    },
  };

  //control validaciones
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  loadingService = new LoadingService();
  txtFolio: string;
  urlPdf: string;
  readonly $snotify: Snotify;

  constructor() {
    super();

    this.dictionaryFormErrors = {
      custom: {
        nroFolio: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          numeric: config.errorMensajes.soloNumeros,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
    this.txtFolio = '';
    this.urlPdf = '';
  }

  //buscar
  async handleBuscarClick() {
    const resultadoValidacion = await this.$validator.validateAll();
    if (resultadoValidacion) {
      await this.buscar(Number(this.formFields.nroFolio.value));
    }
  }

  //limpiar
  clearFilters() {
    this.formFields.nroFolio.value = '';
    this.$emit('clear');
  }

  //buscar
  async buscar(id: number) {
    const he = new HandleErrors();
    try {
      this.loadingService.showLoading();
      const response = await fetchFolio(id).then(async (res: any) => {
        await this.generarPDF(res, id);
      });
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al intentar buscar el Folio.'
          );
        }
      } else {
        this.errorMSG(
          error,
          he,
          'Ha ocurrido un problema al intentar buscar el Folio.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  //genera pdf
  generarPDF(res: any, id: number) {
    var file = new Blob([res.data], { type: 'application/pdf' });
    if (file.size > 0) {
      var fileURL = URL.createObjectURL(file);
      this.txtFolio = '- N° Folio: ' + String(id);
      this.urlPdf = fileURL + '#zoom=100';
      document.getElementById('div_Cert').style.display = 'block';
    } else {
      document.getElementById('div_Cert').style.display = 'none';
      this.$snotify.warning('Folio no encontrado', {
        timeout: 3000,
      });
    }
  }

  //control errores
  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
  }
}
</script>
