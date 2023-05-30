<template>
  <div style="display:flex; height:100%; overflow-y: auto; ">
    <ModalActualizarDatos
      v-if="showActualizarDatos"
      :edittelefono="edit_telefono"
      :editmail="edit_mail"
      :nombre="nombre"
      @cerrarActualizarDatos="handleCierreModalActualizar"
    />
    <div style="width:75%; height: 100%">
      <informacion
        v-if="elementosInformacion.length == 1"
        style="height:100px;"
        :elemento="elementosInformacion"
        :show="true"
      />
      <CarrouselInformativa
        v-else-if="elementosInformacion.length > 1"
        :elementos="elementosInformacion"
      >
      </CarrouselInformativa>

      <v-divider></v-divider>
      <div class="contieneAmbos" style="display: flex; flex-direction: column;">
        <v-container fluid grid-list-md style="margin-top:5px">
          <div class="SolucionesGps" style="height:78%">
            <hr
              width="4%"
              size="10px"
              style="color:yellow; background:yellow; border:none"
            />
            <h2 style=" font-size:18pt; color:#27488E; ">
              Soluciones Gps Chile
            </h2>
            <v-layout xs4 md8 xl8 style="display:flex" wrap>
              <chip-app
                v-if="mostrarTrack && appNames.includes('Track')"
                :colorIsotipo="'azul'"
                :titulo="'Track'"
                :colorTexto="'white'"
                :link="'tracker'"
                :cargado="true"
                :tituloHover="'Mayor control, niveles de servicio y resultados'"
              />
              <chip-app
                v-if="mostrarOrvis && appNames.includes('Orvis')"
                :colorIsotipo="'azul'"
                :titulo="'Orvis'"
                :colorTexto="'white'"
                :link="'http://orvis.gpschile.com'"
                :externa="true"
                :cargado="true"
                :tituloHover="'Visibilidad y control en todo momento'"
              />
              <chip-app
                v-if="mostrarDirector && appNames.includes('Director')"
                :colorIsotipo="'azul'"
                :titulo="'Director'"
                :colorTexto="'white'"
                :cargado="true"
                :link="'https://director-cl.teletracnavman.net/avl3'"
                :externa="true"
                :tituloHover="'Seguridad, control y gestión segundo a segundo'"
              />
              <chip-app
                v-if="mostrarCamaras && appNames.includes('Cámara')"
                :colorIsotipo="'azul'"
                :titulo="'Cámaras'"
                :colorTexto="'white'"
                :cargado="true"
                :link="'camaras-dashboard'"
                :tituloHover="'Monitorea en vivo tu operación de forma remota'"
              />
              <chip-app
                v-if="mostrarVigilanti && appNames.includes('Vigilanti')"
                :colorIsotipo="'azul'"
                :titulo="'Fatiga y Distracción'"
                :colorTexto="'white'"
                :cargado="true"
                :link="'Alertas-Vigilanti'"
                :tituloHover="'Alertas para proteger a tus conductores'"
              />

              <chip-app
                v-if="mostrarMobileye && appNames.includes('Mobileye')"
                :colorIsotipo="'azul'"
                :titulo="'Mobileye'"
                :colorTexto="'white'"
                :cargado="true"
                :link="'https://director-cl.teletracnavman.net/avl3'"
                :externa="true"
                :tituloHover="'Asistencia en viaje para prevenir accidentes'"
              />
              <chip-app
                v-if="mostrarPeajes && appNames.includes('Peajes')"
                :colorIsotipo="'azul'"
                :titulo="'Peajes'"
                :colorTexto="'white'"
                :cargado="true"
                :link="'http://integracion.gpschile.com/'"
                :externa="true"
                :tituloHover="'Audita los gastos por uso de autopistas'"
              />
              <chip-app
                v-if="mostrarRoutePlanner && appNames.includes('RoutePlanner')"
                :colorIsotipo="'azul'"
                :titulo="'RoutePlanner'"
                :colorTexto="'white'"
                :cargado="true"
                :externa="true"
                :link="'https://routeplanner.gpschile.com'"
                :tituloHover="'Planifica y mejora la gestión de tus rutas'"
              />
              <chip-app
                v-if="mostrarDashboard && appNames.includes('Dashboard')"
                :colorIsotipo="'azul'"
                :titulo="'Dashboard'"
                :colorTexto="'white'"
                :cargado="true"
                :link="urldashboard"
                :externa="true"
                :tituloHover="
                  'Indicadores claves para más eficiencia y seguridad'
                "
              />
              <chip-app
                v-if="mostrarMultiflota && appNames.includes('MultiFlota')"
                :colorIsotipo="'azul'"
                :titulo="'MultiFlota'"
                :colorTexto="'white'"
                :cargado="true"
                :externa="true"
                :link="'https://multiflota.gpschile.com'"
                :tituloHover="'Centraliza la actividad de todos tus gps'"
              />
            </v-layout>
          </div>
        </v-container>
        <div
          class="MisApp"
          style=" display:flex;flex-direction:column; margin-left:24px; height: 240px;"
          v-show="cantidadAplicaciones > 0"
        >
          <hr
            width="4%"
            size="10px"
            style="color:yellow; background:yellow; border:none"
          />
          <h2 style=" font-size:18pt; color:#27488E;">
            Mis Aplicaciones
          </h2>
          <div style="display:flex">
            <chip-app
              v-if="mostrarAnglo && appNames.includes('Alertas')"
              :colorIsotipo="'amarillo'"
              :titulo="'Alertas'"
              :colorTexto="'black'"
              :cargado="true"
            />
            <chip-app
              v-if="mostrarCosecha && appNames.includes('Cosechas')"
              :colorIsotipo="'amarillo'"
              :titulo="'Cosechas'"
              :colorTexto="'black'"
              :cargado="true"
              :link="'Sugal'"
            />
            <chip-app
              v-if="mostrarAnglo && appNames.includes('Dashboard')"
              :colorIsotipo="'amarillo'"
              :titulo="'Dashboard'"
              :colorTexto="'black'"
              :cargado="true"
              :link="'dashboard'"
              :externa="true"
            />
            <chip-app
              v-if="mostrarAnglo && appNames.includes('Aguas')"
              :colorIsotipo="'amarillo'"
              :titulo="'Aguas'"
              :colorTexto="'black'"
              :cargado="true"
              :link="urldashboard"
              :externa="true"
            />
            <chip-app
              v-if="mostrarVendimia && appNames.includes('Vendimia')"
              :colorIsotipo="'amarillo'"
              :titulo="'Vendimia'"
              :colorTexto="'black'"
              :cargado="true"
              :link="urldashboard"
            />
          </div>
        </div>
      </div>
    </div>

    <v-divider vertical style="min-height:100%"></v-divider>
    <div style="width:25%; height: 100%;">
      <panelInfo class="panelR" />
    </div>
    <div class="footer">
      <div class="containerLogo">
        <!--        <v-img
          class="logo"
          cover
          :src="require(`./assetsHome/footer_logo_gps_chile.png`)"
        ></v-img>-->
        <div class="logo"></div>
      </div>
      <div class="containerTxtFooter">
        <p style=" text-align: justify" class="textoFooter">{{ txtFooter }}</p>
      </div>
      <div class="btnFooter" style="padding-top:6px;">
        <v-btn
          class="btn-crear"
          style="padding-right:20px; border-radius: 50px"
        >
          <a class="btnFooter" href="https://www.gpschile.com/" target="_blank"
            >Gpschile.com</a
          >
        </v-btn>
      </div>
      <div class="infoFooter" style="margin-left:10%; line-height:70%" column>
        <div style="width:400px;display:flex; height: 25px; margin-top: 10px;">
          <v-img
            max-height="18"
            max-width="18"
            width="18"
            height="18"
            :src="require(`./assetsHome/footer_icono_telefono.png`)"
          ></v-img>
          <p style="font-size: 10px;">Teléfono: +56 (2) 2940 49 11</p>
        </div>

        <div style="width:400px;display:flex; height: 25px;">
          <v-img
            max-height="18"
            max-width="18"
            width="18"
            height="18"
            :src="require(`./assetsHome/footer_icono_mail.png`)"
          ></v-img>
          <p style="font-size: 10px;">Mail: clientes@gpschile.com</p>
        </div>

        <div
          style="width:190px;display:flex; text-align-last: justify; height: 25px;"
        >
          <v-img
            max-height="18"
            max-width="18"
            width="18"
            height="18"
            :src="require(`./assetsHome/footer_icono_ubicacion.png`)"
          ></v-img>
          <p style="font-size: 10px;">
            GPS CHILE S.p.A. Cerro El Plomo 5630, of. 501 Las Condes, Santiago
            Chile.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import moment from 'moment';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import store from '@/store';
import config from '@/config/index';

import { LoadingService } from '@/services/loadingService';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import ChipAplication from './reusables/ChipAplication.vue';
import CardInformativa from './reusables/CardInformativa.vue';
import { AgGridVue } from 'ag-grid-vue';
import PanelInfo from './reusables/PanelInfo.vue';
import CarrouselInformativa from './reusables/CarrouselInformativa.vue';
import { string } from 'yup';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import { Funcionalidades } from '@/config/funcionalidades';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { filtroHomeEventBus, filtroHomeEvents } from '@/setup';
import ModalActualizarDatos from './ModalActualizarDatos.vue';
import { fetchMS } from './reusables/fetchMS';

@Component({
  components: {
    MantenedorGrid,
    AgGridVue,
    'chip-app': ChipAplication,
    informacion: CardInformativa,
    panelInfo: PanelInfo,
    CarrouselInformativa,
    ModalActualizarDatos,
  },
})
export default class HomeGenerico extends Vue {
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  search: string = '';
  $snotify: any;
  color: string = 'azul';
  txtFooter: string = 'Sea cual sea tu objetivo, tenemos la solución.';
  muestraInformacion: boolean = false;
  urldashboard: string =
    'https://us-east-1.signin.aws.amazon.com/oauth?SignatureVersion=4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIYOJP4OBNT7XFVSQ&X-Amz-Date=2022-06-29T17%3A51%3A01.025Z&X-Amz-Signature=f71174b578d4cf27755abe4b3420d8232ac2bdada14af1452df4e82af0d3a4d7&X-Amz-SignedHeaders=host&client_id=arn%3Aaws%3Aiam%3A%3A015428540659%3Auser%2Fspaceneedle-prod&enable-sso=&forceMobileApp=0&qs-signin-user-auth=&response_type=code&redirect_uri=https%3A%2F%2Fus-east-2.quicksight.aws.amazon.com%2Fsn%2Fstart%3Fdirectory_alias%3DGpschile%26edap%3Dtrue%26state%3DhashArgs%2523%26isauthcode%3Dtrue&qs-signin-account-name=Gpschile&directory_alias=Gpschile&rdfs=true';
  cantMsj: number = 1;
  elementosInformacion: any = [];
  usuario: any = this.$store.state.user;
  mostrarTrack: boolean = false;
  mostrarAlertas: boolean = false;
  mostrarCamaras: boolean = false;
  mostrarCosecha: boolean = false;
  mostrarDashboard: boolean = false;
  mostrarDirector: boolean = false;
  mostrarMobileye: boolean = false;
  mostrarOrvis: boolean = false;
  mostrarPeajes: boolean = false;
  mostrarRoutePlanner: boolean = false;
  mostrarVigilanti: boolean = false;
  mostrarMultiflota: boolean = false;
  mostrarAnglo: boolean = false;
  mostrarVendimia: boolean = false;
  permisosAlertas: any = {
    funcionalidad: Funcionalidades.Alertas,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosCosecha: any = {
    funcionalidad: Funcionalidades.HomeSugal,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosDashboard: any = {
    funcionalidad: Funcionalidades.DashboardEsmax,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosCamaras: any = {
    funcionalidad: Funcionalidades.CamarasDashboard,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosVigilanti: any = {
    funcionalidad: Funcionalidades.AlertasVigilanti,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosRoutePlanner: any = {
    funcionalidad: Funcionalidades.RoutePlanner,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosTrack: any = {
    funcionalidad: Funcionalidades.Inicio,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosOrvis: any = {
    funcionalidad: Funcionalidades.Orvis,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosDirector: any = {
    funcionalidad: Funcionalidades.Director,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosMobileye: any = {
    funcionalidad: Funcionalidades.Mobileye,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosPeajes: any = {
    funcionalidad: Funcionalidades.Peajes,
    codigoAccion: CodigoAccion.Consultar,
  };
  permisosMultiFlota: any = {
    funcionalidad: Funcionalidades.MultiFlota,
    codigoAccion: CodigoAccion.Consultar,
  };

  cantidadAplicaciones: number = 0;
  showActualizarDatos: boolean = false;
  edit_mail: string = null;
  edit_telefono: string = null;
  nombre: string = '';

  //FILTROS
  filtroGrillaFechaD = moment(new Date())
    .toISOString()
    .substr(0, 10);
  filtroGrillaFechaH: any = new Date().toISOString().substr(0, 10);
  menuDatePickerFechaD: boolean = false;
  menuDatePickerFechaH: boolean = false;
  time1: any = moment()
    .utc()
    .hour(0)
    .minute(0)
    .toISOString()
    .substr(11, 5);
  time2: any = moment()
    .utc()
    .hour(23)
    .minute(59)
    .toISOString()
    .substr(11, 5);
  menu1: boolean = false;
  menu2: boolean = false;
  btnDisabled: boolean = false;
  cargas: any = null;
  cargasFilter: any = null;
  loadingService = new LoadingService();
  clienteId: number = config.getClienteSesion();
  async mounted() {
    //this.loadingService.hideLoading();
    this.validaPermisos();
    this.elementosInformacion = await fetchDashboard(
      { type: 'mensaje' },
      'pantalla/get_pantallas'
    )
      .then((x: any) => x.data.data)
      .finally(() => {
        this.loadingService.hideLoading();
      });
    this.getVerificaActualizarDatos();
  }
  created() {
    filtroHomeEventBus.$on('clienteMultiApp', (clienteId: number) => {
      (this.clienteId = clienteId), this.validaPermisos();
    });
  }
  validaPermisos() {
    this.cantidadAplicaciones = 0;
    this.mostrarTrack = this.cargaPermisos(this.permisosTrack);
    this.mostrarAlertas = this.cargaPermisos(this.permisosAlertas);
    this.mostrarCamaras = this.cargaPermisos(this.permisosCamaras);
    this.mostrarCosecha = this.cargaPermisosPropios(this.permisosCosecha);
    this.mostrarDashboard = this.cargaPermisos(this.permisosDashboard);
    this.mostrarDirector = this.cargaPermisos(this.permisosDirector);
    this.mostrarMobileye = this.cargaPermisos(this.permisosMobileye);
    this.mostrarOrvis = this.cargaPermisos(this.permisosOrvis);
    this.mostrarPeajes = this.cargaPermisos(this.permisosPeajes);
    this.mostrarRoutePlanner = this.cargaPermisos(this.permisosRoutePlanner);
    this.mostrarVigilanti = this.cargaPermisos(this.permisosVigilanti);
    this.mostrarMultiflota = this.cargaPermisos(this.permisosMultiFlota);
    this.mostrarAnglo = this.permisosAnglo();
    this.mostrarVendimia = this.permisosVendimia();
  }

  permisosAnglo() {
    var anglo = [3176, 3275, 4030, 5225, 15711, 16342];
    var existe = anglo.find((a: any) => a == this.clienteId);
    if (existe) this.cantidadAplicaciones++;
    if (existe !== undefined && existe !== null) {
      return true;
    }
    return false;
  }
  permisosVendimia() {
    if (this.clienteId == 2849) {
      this.cantidadAplicaciones++;
      return true;
    }
    return false;
  }

  cargaPermisos(modulo: any): boolean {
    const accion: any = this.usuario.permisosUsuario.find(
      (x: any) =>
        x.moduloCodigo === modulo.funcionalidad &&
        x.accionCodigo === modulo.codigoAccion
    );
    if (accion !== undefined && accion !== null) {
      return true;
    }

    return false;
  }
  cargaPermisosPropios(modulo: any): boolean {
    const accion: any = this.usuario.permisosUsuario.find(
      (x: any) =>
        x.moduloCodigo === modulo.funcionalidad &&
        x.accionCodigo === modulo.codigoAccion
    );
    if (accion !== undefined && accion !== null) {
      this.cantidadAplicaciones++;
      return true;
    }

    return false;
  }
  get appNames(): any[] {
    return this.$store.getters.getApplicationNames;
  }

  async getVerificaActualizarDatos() {
    let resp: any = (await this.VerificaActualizarDatos()) || [];
    console.log(resp);
    if (resp.data.CODIGO_RESPUESTA == '1') {
      this.showActualizarDatos = resp.data.show_modal;
      this.edit_mail = resp.data.edit_mail;
      this.edit_telefono = resp.data.edit_telefono;
      this.nombre = resp.data.data.dataR;
    } else {
      console.log('Sucursal virtual: ' + resp.data.MENSAJE_RESPUESTA);
    }
  }
  handleCierreModalActualizar() {
    this.showActualizarDatos = false;
  }

  VerificaActualizarDatos() {
    let body: any = {};
    let self = this;
    body.user_id = JSON.parse(window.localStorage.user).id;
    return fetchMS(body, 'VerificaActualizarDatos')
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
}
</script>
<style scoped></style>
