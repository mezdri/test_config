<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab @click="selectTable">Cuadratura de Dispositivos</v-tab>
    </v-tabs>
    <v-divider />
    <br />
    <br />
    <WidgetControl :widgetList="widgetList" />
    <v-container fluid grid-list-md>
      <v-flex xs12 sm6 md6>
        <div align="left">
          <v-text-field
            @input="onFilterTextBoxChanged"
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
      <div class="right" style="display: flex; margin-top: -50px;">
        <!--        <v-btn flat small color="primary" id="btnAct" @click="actCuadratura">
          <v-icon>sync</v-icon>
          Actualizar
        </v-btn>-->
        <v-btn
          id="btnExportCsv"
          flat
          small
          color="primary"
          @click="onBtnExport"
        >
          <v-icon class="importExportBtnIcon">cloud_download </v-icon
          >&nbsp;&nbsp;
          <span class="importExportBtnTexto">Exportar CSV</span>
        </v-btn>
      </div>
      <v-divider />
      <DatatablePatente
        v-show="tabSelected == 1"
        :headers="headers"
        :dataTable="dataTable"
      />
    </v-container>
    <div v-if="showReporteGenerado" class="wrap-evidencia">
      <div id="myModal2" class="modalEnvio">
        <!-- Modal content -->
        <div class="modalEnvio-content">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Reporte Solicitado</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReporte()">
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <v-flex sm12 md12>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">{{ texto_reporte }}</p>
              </div>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">
                  Puede ver sus reportes en el menú
                  <router-link
                    active-class="router-link-active"
                    style="cursor: pointer; font-size: 13px"
                    to="/Torre-Control/reportes"
                    >Informes</router-link
                  >
                </p>
              </div>
            </v-flex>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { MSResponse } from '@/interfaces/MS';
import { AxiosResponse } from 'axios';
import { headers } from '@/pantallas/TorreControl/ControlPatentes/controlPatentesHeaders';
import { PatentesService } from '@/pantallas/TorreControl/ControlPatentes/patentesService';
import DatatablePatente from '@/pantallas/TorreControl/ControlPatentes/datatablePatente.vue';
import TorreControlInstance from '../comunes/Instances';
import { ControlPatentesInterfaces } from '@/pantallas/TorreControl/ControlPatentes/controlPatentesInterfaces';
import WidgetControl from '@/pantallas/TorreControl/widgetControl.vue';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';

@Component({
  name: 'ControlDispositivos',
  components: {
    WidgetControl,
    DatatablePatente,
  },
})
export default class ControlPatentes extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  loadingService = new LoadingService();
  patentesServices = new PatentesService();
  tabSelected: number = 1;
  clientId: string;
  isLoading: boolean = false;
  vehiculoId: string;
  avl: string;
  dataTable: any = [];
  headers = headers;
  readonly funcionalidad: Funcionalidades = Funcionalidades.TorreControl;
  $notify: any;
  intervalo: any; //Intervalo para el buscador
  search: string = '';
  widgetList: { title: string; value: any; key: any }[] = [];
  texto_reporte: string = '';
  showReporteGenerado: boolean = false;
  intervalAct: any;
  listenWitdgetSelected: string = '';

  constructor() {
    super();
    this.getClientId();
  }

  getClientId() {
    this.vehiculoId = this.$route.params.id;
    this.avl = this.$route.params.avl;
    this.clientId = localStorage.getItem('clienteDefecto');
  }

  created() {
    let self = this;
    TorreControlInstance.$off('selectWidget');
    TorreControlInstance.$on('selectWidget', (widget: string) => {
      self.listenWitdgetSelected = widget;
    });
  }

  beforeDestroy() {
    clearInterval(this.intervalAct);
  }

  async mounted() {
    let _self = this;
    await this.actCuadratura().finally(() => {
      TorreControlInstance.$emit('loadDataCuadratura');
    });
    this.intervalAct = setInterval(() => {
      _self.actCuadratura().finally(() => {
        TorreControlInstance.$emit('loadDataCuadratura');
      });
    }, 60000);
  }

  selectTable() {}

  onBtnExport() {
    this.loadingService.showLoading();
    var body: any = {
      id_cliente: this.clientId,
      headers: this.headers,
      exportOption: true,
      extension: 'csv',
      search: this.search,
      widgetSelected: this.listenWitdgetSelected,
      widgets: this.widgetList,
    };

    this.patentesServices
      .exportCuadratura(
        this.clientId,
        JSON.parse(localStorage.getItem('user')).id,
        body
      )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.texto_reporte = data.data.MENSAJE_RESPUESTA;
          this.showReporteGenerado = true;
        } else {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return false;
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Ocurrió un error. Intente nuevamente.', {
          timeout: 3000,
        });
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async actCuadratura() {
    let self = this;
    this.loadingService.showLoading();

    const axiosResponse: AxiosResponse<
      MSResponse<ControlPatentesInterfaces>
    > = await this.patentesServices.getCuadratura(this.clientId);
    const msResponse: any = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA == '1') {
      this.$snotify.success(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      msResponse.data.forEach((item: string) => {
        if (!this.headers.some(x => x.field === item)) {
          let titulo: string[] = item
            .toString()
            .replace('_', ' ')
            .toUpperCase()
            .replace('CINTURON', 'CINTURÓN')
            .replace('BOTON', 'BOTÓN')
            .toLowerCase()
            .split(' ');
          for (let i = 0; i < titulo.length; i++) {
            titulo[i] = titulo[i][0].toUpperCase() + titulo[i].slice(1);
          }
          let headerName = titulo.join(' ');

          let columnDef = {
            headerName: headerName,
            field: item,
            sortable: false,
            resizable: true,
            width: 200,
            lockPinned: true,
            hide: false,
            cellRenderer: (params: any) => {
              console.log(params);
              let color = '';
              if (params.value.bads == 0 && params.value.count == 0) {
                color = 'white';
              } else if (
                params.value.bads > 0 &&
                params.value.bads < params.value.count
              ) {
                color = '#FFF226';
              } else if (
                params.value.count == params.value.bads ||
                parseFloat(params.data.num_sat_ult_act) < 6 ||
                parseFloat(params.data.hdop_ult_act) > 1.2
              ) {
                color = '#FF2626';
              } else {
                color = '#26FF26';
              }
              if (
                (params.data.ignicion_ult_act == '0' ||
                  params.data.ignicion_ult_act == '') &&
                color == '#FF2626'
              )
                color = 'white';
              return `${
                params.value.count == 0 ? ' ' : params.value.count
              } <i class="material-icons"  style="width: 20px; height: 20px; margin-top: 25px; border-radius: 50%; border: 1px solid black; background: ${color}"></i>`;
            },
            cellStyle: {
              cursor: 'pointer',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'flex-start',
              'font-size': 'medium',
            },
          };
          this.headers.push(columnDef);
        }
      });
      var listWidgets: {
        title: string;
        tag: string;
        value: any;
        key: any;
      }[] = [];
      Object.entries(msResponse.widgets).forEach(([key, value], index) => {
        listWidgets.push({
          title: key.replace(/_/g, ' ').toUpperCase(),
          tag: key,
          value: value,
          key: index,
        });
      });
      this.widgetList = listWidgets;
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
    this.loadingService.hideLoading();
  }

  onFilterTextBoxChanged() {
    clearInterval(this.intervalo);
    const self = this;
    this.intervalo = setInterval(function() {
      if (self.search.length >= 2) {
        TorreControlInstance.$emit('onFilterChanged', self.search);
      } else if (self.search.length === 0) {
        TorreControlInstance.$emit('setServerSideDatasource');
      }
      clearInterval(self.intervalo);
    }, 500);
  }

  closeReporte() {
    this.showReporteGenerado = false;
  }
}
</script>

<style scoped>
#btnExportCsv,
#btnAct {
  height: auto;
}
</style>
