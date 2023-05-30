<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <FormFieldsContainer titulo="Serie Devolución Bodega">
              <slot name="prependInformacionGeneral" />
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.devonumero.label"
                  v-model="formFields.devonumero.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.devofecha_alta.label"
                  v-model="formFields.devofecha_alta.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.devofecha_recepcion.label"
                  v-model="formFields.devofecha_recepcion.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.usuarioid.label"
                  v-model="formFields.usuarioid.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.usuariorut.label"
                  v-model="formFields.usuariorut.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.coorid.label"
                  v-model="formFields.coorid.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.coorname.label"
                  v-model="formFields.coorname.value"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
            <div class="gridcard rounded-card">
              <MantenedorGrid :grid-options="gridOptions" />
            </div>
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

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';

import { fetchReportesSerie } from './fetchReporteSerie';
import { GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
    MantenedorGrid,
  },
})
export default class SerieNumeroFormDevolucionBodega extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;
  @Prop({ default: null }) serieactivanroSeleccionado: any;
  @Prop({ default: null }) serieNumeroSeleccionado: any;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  ordesList: any[] = [];
  gridApi: GridApi = null;
  serverSide: any;
  devonumero: any = '';

  async getSerie_by_id(
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
      'ReportesSerie/seriedevoluciones'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.devonumero = data.data.data[0].devonumero;
          if (
            data.data.data[0].devonumero !== undefined &&
            data.data.data[0].devonumero.length !== 0
          ) {
            self.formFields.devonumero.value = data.data.data[0].devonumero;
          } else {
            self.formFields.devonumero.value = '(Sin datos)';
          }

          if (
            data.data.data[0].devofecha_alta !== undefined &&
            data.data.data[0].devofecha_alta.length !== 0
          ) {
            self.formFields.devofecha_alta.value =
              data.data.data[0].devofecha_alta;
          } else {
            self.formFields.devofecha_alta.value = '(Sin datos)';
          }

          if (
            data.data.data[0].devofecha_recepcion !== undefined &&
            data.data.data[0].devofecha_recepcion.length !== 0
          ) {
            self.formFields.devofecha_recepcion.value =
              data.data.data[0].devofecha_recepcion;
          } else {
            self.formFields.devofecha_recepcion.value = '(Sin datos)';
          }

          if (
            data.data.data[0].usuarioid !== undefined &&
            data.data.data[0].usuarioid.length !== 0
          ) {
            self.formFields.usuarioid.value = data.data.data[0].usuarioid;
          } else {
            self.formFields.usuarioid.value = '(Sin datos)';
          }

          if (
            data.data.data[0].usuariorut !== undefined &&
            data.data.data[0].usuariorut.length !== 0
          ) {
            self.formFields.usuariorut.value = data.data.data[0].usuariorut;
          } else {
            self.formFields.usuariorut.value = '(Sin datos)';
          }

          if (
            data.data.data[0].coorid !== undefined &&
            data.data.data[0].coorid !== 0
          ) {
            self.formFields.coorid.value = data.data.data[0].coorid;
          } else {
            self.formFields.coorid.value = '(Sin datos)';
          }
          if (
            data.data.data[0].coorname !== undefined &&
            data.data.data[0].coorname !== 0
          ) {
            self.formFields.coorname.value = data.data.data[0].coorname;
          } else {
            self.formFields.coorname.value = '(Sin datos)';
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

  async devolucionNumero(devonumero: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { devolucionNumero: devonumero },
      'ReportesSerie/seriedevolucionestabla'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data;
        } else {
          return;
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
    devonumero: {
      label: 'Devolución Número',
      id: '',
      value: '',
    },
    devofecha_alta: {
      label: 'Fecha de Devolución',
      id: '',
      value: '',
    },
    devofecha_recepcion: {
      label: 'Fecha de Recepción',
      id: '',
      value: '',
    },
    usuarioid: {
      label: 'Usuario',
      id: '',
      value: '',
    },
    usuariorut: {
      label: 'RUT de Usuario',
      id: 'patente',
      value: '',
    },
    coorid: {
      label: 'Coordinador ID',
      id: 'patente',
      value: '',
    },
    coorname: {
      label: 'Nombre del Coordinador',
      id: '',
      value: '',
    },
  };

  mounted() {
    this.devolucionNumero(this.devonumero);
    this.getSerie_by_id(
      this.serieNumeroSeleccionado,
      this.tipoEquipoSeleccionado,
      this.serieactivanroSeleccionado
    );
  }

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Fecha',
        field: 'devorepofecha',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Valor',
        field: 'configvalor',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Observación',
        field: 'devorepoobs',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'ID Técnico',
        field: 'tecnicoid',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Nombre de Técnico',
        field: 'tecniconame',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
    ],

    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
  };

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.devolucionNumero(this.devonumero);
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.serverSide = {};
  }
}
</script>
<style scoped></style>
