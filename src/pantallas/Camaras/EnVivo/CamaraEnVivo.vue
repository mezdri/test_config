<template>
  <div id="mainContainer">
    <ResSplitPane
      class="splitPaneColumn"
      split-to="columns"
      :allow-resize="true"
      :min-size="111"
      :max-size="600"
      :size="sizeSplitPane"
      units="pixels"
      style="height: 100%; position: initial;"
    >
      <div slot="firstPane" style="height: 100%">
        <ResSplitPane
          split-to="rows"
          :allow-resize="false"
          :min-size="35"
          :max-size="100"
          :size="70"
          units="percents"
          style="height: 100%; position: initial;"
        >
          <v-card slot="firstPane" id="patentsContainer"
            ><div id="searchDiv" class="wrap layout">
              <div>
                <div class="searchDivContent">
                  <p
                    style="margin-left: 12px; font-size: 1.1rem;padding-top: 10px;margin: 0;"
                    title="(Total en Linea / Total Dispositivos)"
                  >
                    ({{ totalActives }}/{{ totalLength }})
                  </p>
                </div>
                <div class="searchDivContent">
                  <v-btn icon flat @click="handleReloadPatents">
                    <v-icon style="z-index: 1;">sync</v-icon></v-btn
                  >
                </div>
                <br />
                <div class="searchDivContent">
                  <v-text-field
                    style="width: 170px;"
                    label="Patente"
                    v-model="searchPatent_tmp1"
                    @blur="handleChangePatent"
                    @keypress.enter="handleChangePatent"
                  ></v-text-field>
                </div>
                <div class="searchDivContent">
                  <v-icon style="z-index: 1;cursor:pointer">search</v-icon>
                </div>
              </div>
            </div>
            <div id="patentsDiv">
              <v-treeview
                ref="tree"
                transition
                class="treeClass"
                :items="patents"
                :search="searchPatent"
                :filter="filter"
                open-on-click
                v-model="treeViewList"
                return-object
                :open.sync="openNodes"
                selected-color="#00080"
              >
                <template v-slot:prepend="{ item, open }">
                  <v-checkbox
                    class="checkboxClass"
                    :disabled="item.disabled"
                    v-if="item.type != 'fleet'"
                    @change="handleList(item)"
                    v-model="item.checkbox"
                    style="flex: none; margin-top: 0px;"
                  ></v-checkbox>
                  <v-icon
                    :color="item.color ? item.color : ''"
                    v-if="item.icon"
                    :title="item.estado"
                    style="cursor:pointer"
                  >
                    {{ item.icon }}
                  </v-icon>
                  <v-icon v-else>
                    question_mark
                  </v-icon>
                </template></v-treeview
              >
            </div>
          </v-card>
          <v-card slot="secondPane" id="detailsContainer">
            <DetailPatent
              v-if="emptyPatent"
              :detail="current_patent"
            ></DetailPatent>
            <div v-else id="withoutPatent" style="overflow: hidden;">
              <div style="text-align: center;">
                <div id="textEmpty">No ha seleccionado ninguna cámara</div>
                <img src="@/assets/emptyIcon.png" />
              </div>
            </div>
          </v-card>
        </ResSplitPane>
      </div>
      <v-card slot="secondPane" id="camContainer">
        <div id="first">
          <div style="height: 100%; width: 100%">
            <InLiveCams
              v-show="emptyPatentCam"
              :current_patent="current_patent"
              :listCam="listCam"
              :isOperation="isOperation"
              :url_live="url_live"
              :limitAncientCams = "limitAncientCams"
            ></InLiveCams>
            <div
              v-show="!emptyPatentCam"
              id="withoutPatent"
              style="overflow: hidden;"
            >
              <div style="text-align: center;">
                <div id="textEmpty">No ha seleccionado ningún canal</div>
                <img src="@/assets/emptyIcon.png" />
              </div>
            </div>
          </div>
        </div>
        <div id="separator">
          <div v-if="fullCams" class="btn_left">
            <v-icon color="#7D8493" @click="closeFirstDiv()"
              >chevron_left</v-icon
            >
          </div>
          <div v-else class="btn_right">
            <v-icon color="#7D8493" @click="fullFirstDiv()"
              >chevron_right</v-icon
            >
          </div>
        </div>
        <div id="second">
          <div v-show="emptyPatentCam" class="google-map" :id="mapName"></div>
          <div
            v-show="!emptyPatentCam"
            id="withoutPatent"
            style="overflow: hidden;"
          >
            <div style="text-align: center;">
              <div id="textEmpty">No ha seleccionado ninguna cámara</div>
              <img src="@/assets/emptyIcon.png" />
            </div>
          </div>
        </div>
      </v-card>
    </ResSplitPane>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
//@ts-ignore
import ResSplitPane from 'vue-resize-split-pane';
import DetailPatent from '@/pantallas/Camaras/EnVivo/DetailPatent.vue';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';
import InLiveCams from '@/pantallas/Camaras/EnVivo/InLiveCams.vue';
import { LoadingService } from '@/services/loadingService';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';

@Component({
  components: { ResSplitPane, DetailPatent, InLiveCams },
})
export default class CamaraEnVivo extends Vue {
  current_patent: any = {};
  current_id_camera: number = -1;
  treeViewList: any[] = [];
  loadingService = new LoadingService();
  messageStreamax: string =
    'Estamos trabajando en la funcionalidad de canales paralelos en este modelo, por favor seleccione uno a la vez';
  searchPatent: string = '';
  url_live: string = '';
  sizeSplitPane: number = 300;
  isOperation: boolean = false;
  searchPatent_tmp1: string = '';
  openNodes: any[] = [];
  patents: any[] = [];
  patents_original: any[] = [];
  listCam: any[] = [];
  listCamTimeout: any[] = [];
  limitAncientCams: number = 5;
  lastLat: any = -30.75442;
  lastLong: any = -70.4300433;
  current_channels: any[] = [];
  focusCamId: string = '';
  fullCams: boolean = false;
  totalLength: any = 0;
  checkboxTreeview: boolean = false;
  totalActives: any = 0;
  $snotify: any;
  isFilter: boolean = false;
  currentCameraType: string = '';
  filterList: boolean = false;
  mapName: string = 'envivo-mapa';
  isActiveGetPatents: boolean = false;
  infoWindows: google.maps.InfoWindow;
  map: google.maps.Map = null;
  marker: google.maps.Marker = null;
  valideProccess: boolean = true;
  timerUpdateCoordinates: any = null;
  current_cam: { indexPatent: any; indexCam: any } = {
    indexPatent: 0,
    indexCam: 0,
  };
  index: number = 0;

  get emptyPatent(): boolean {
    return !(Object.keys(this.current_patent).length === 0);
  }

  get emptyPatentCam(): boolean {
    return this.listCam.length > 0;
  }

  beforeDestroy() {
    CamaraEventBus.$emit('handleCams', [], 'clear');
    //clearInterval(this.timerUpdateCoordinates);
    console.log('[CLEAR] se destruye el evento de coordenadas ');
  }

  created() {
    var self = this;
    CamaraEventBus.$on('reloadComponentInLives', () => {
      this.loadingService.showLoading();
      self.getPatents();
    });
  }

  async handleList(item: any) {
    let url = new URL(window.location.href);
    var self = this;

    // if (
    //   this.listCam.length > 0 &&
    //   this.listCam[0].tipo_live.toLowerCase() != item.tipo_live.toLowerCase()
    // ) {
    //   this.$snotify.error(
    //     'No es posible visualizar la cámara seleccionada; se encuentra en emisión una distinta. Deseleccione las anteriores y vuelva a probar  '
    //   );
    //   setTimeout(() => {
    //     item.checkbox = false;
    //   }, 300);
    //   return;
    // }
    if (item.checkbox && item.tipo_live.toLowerCase() == 'antiguo') {
      const activeOldCams: any[] = this.listCam.filter((itemF: any) => itemF.tipo_live.toLowerCase() == 'antiguo')
      if (item.type == 'parent') {
        if (this.getLengthParent(item) + activeOldCams.length > this.limitAncientCams) {
          this.$snotify.error(
            'No se puede tener más de '+this.limitAncientCams+' canales en visualización a la vez para este tipo de cámaras'
          );
          setTimeout(() => {
            item.checkbox = false;
          }, 300);
          return;
        }
      } else if (item.type == 'children') {
        if (1 + activeOldCams.length > this.limitAncientCams) {
          this.$snotify.error(
            'No se puede tener más de '+this.limitAncientCams+' canales en visualización a la vez para este tipo de cámaras'
          );

          setTimeout(() => {
            item.checkbox = false;
          }, 300);
          return;
        }
      }
    }
    if (item.type == 'parent') {
      // Is camera
      this.updateChildrens(item);
      if (item.checkbox) {
        this.handleCam(item);
      }
    } else if (item.type == 'children') {
      // Is channel
      this.setColorCam(item);
      var patent = {};
      if (url.pathname == '/camaras-envivo') {
        if (!this.isFilter) {
          patent = this.patents[item.indexParent];
        } else {
          patent = this.patents_original[item.indexParent];
        }
      } else {
        if (!this.isFilter) {
          patent = this.patents[item.indexFleet].children[item.indexParent];
        } else {
          patent = this.patents_original[item.indexFleet].children[
            item.indexParent
          ];
        }
      }
      this.updateParent(patent);

      if (item.checkbox) {
        this.handleCam(patent);
      }
    } else if (item.type == 'fleet') {
      return;
    }
    if (item.checkbox && this.current_id_camera != item.id_camara) {
      this.resetMap();
    }
    this.current_id_camera = item.id_camara;

    setTimeout(() => {
      self.updateCam(item);
    }, 150);
    this.loading(300);
    if (url.pathname == '/camaras-envivo') {
      this.generateListCams(item);
    } else {
      this.generateListCamsOperation(item);
    }
  }

  getLengthParent(item: any): number {
    var total: number = 0;
    for (var chl of item.children) {
      let index: number = this.listCam.findIndex(
        (itemL: any) => itemL.id == chl.id
      );
      if (index == -1) {
        total += 1;
      }
    }
    return total;
  }

  updateCam(item: any) {
    const action: string = item.checkbox ? 'insert' : 'remove';
    if (item.type == 'parent') {
      CamaraEventBus.$emit('handleCams', item.children, action);
    } else if (item.type == 'children') {
      var cams: any[] = [];
      cams.push(item);
      CamaraEventBus.$emit('handleCams', cams, action);
    }
  }

  loading(time: any) {
    this.loadingService.showLoading();
    var self = this;
    setTimeout(() => {
      self.loadingService.hideLoading();
    }, time);
  }

  generateListCams(item: any) {
    var self = this;
    this.listCam = [];
    var listCamHandler: any[] = [];
    for (var [indexPatent, patent] of this.patents.entries()) {
      for (var [indexChildren, children] of patent.children.entries()) {
        if (children.checkbox) {
          listCamHandler.push({
            ...children,
            patent: patent.name,
            url_live: patent.url_live,
            id_camara: patent.id_camara,
            tipo_live: patent.tipo_live,
          });
        }
      }
    }
    this.listCam = listCamHandler;
    setTimeout(() => {
      self.listCamTimeout = listCamHandler;
    }, 400);
  }

  generateListCamsOperation(item: any) {
    var self = this;
    this.listCam = [];
    var listCamHandler: any[] = [];
    for (var [indexFleet, fleet] of this.patents.entries()) {
      for (var [indexPatent, patent] of fleet.children.entries()) {
        for (var [indexChildren, children] of patent.children.entries()) {
          if (children.checkbox) {
            listCamHandler.push({
              ...children,
              patent: patent.name,
              url_live: patent.url_live,
              id_camara: patent.id_camara,
              tipo_live: patent.tipo_live,
            });
          }
        }
      }
    }
    this.listCam = listCamHandler;
    setTimeout(() => {
      self.listCamTimeout = listCamHandler;
    }, 400);
  }

  setColorCam(cam: any) {
    if (cam.checkbox) {
      cam.color = 'green';
    } else {
      cam.color = '';
    }
  }

  updateChildrens(item: any) {
    for (var [index, cam] of item.children.entries()) {
      item.children[index].checkbox = item.checkbox;
      this.setColorCam(item.children[index]);
    }
  }

  resetMap() {
    this.chargeCoords();
    var self = this;
  }

  updateParent(item: any) {
    var allDisabled: boolean = true;
    var allEnabled: boolean = true;
    for (var [index, cam] of item.children.entries()) {
      if (item.children[index].checkbox) {
        allDisabled = false;
      } else {
        allEnabled = false;
      }
    }
    if (allEnabled) {
      item.checkbox = true;
    } else if (allDisabled) {
      item.checkbox = false;
    }
  }

  @Watch('searchPatent_tmp1')
  onChangeFilter() {
    if (this.searchPatent_tmp1 == '') {
      this.isFilter = false;
    } else {
      this.isFilter = true;
    }
  }

  async chargeCoords() {
    var coordinates: any = await this.getCameraCoordinates();
    this.lastLat = coordinates.latitud;
    this.lastLong = coordinates.longitud;
    this.renderMap(
      coordinates.latitud,
      coordinates.longitud,
      coordinates.fecha_actividad
    );
  }

  handleReloadPatents() {
    this.getPatents();
  }

  changePatentv2() {
    this.loadingService.showLoading();
    var newList: any[] = [];
    let that = this;
    setTimeout(function() {
      for (var i = 0; i < that.patents_original.length; i++) {
        if (
          that.patents_original[i].name
            .toLowerCase()
            .indexOf(that.searchPatent_tmp1.toLowerCase()) > -1
        ) {
          newList.push(that.patents_original[i]);
        } else if (
          that.patents_original[i].id_camara
            .toLowerCase()
            .indexOf(that.searchPatent_tmp1.toLowerCase()) > -1
        ) {
          var patent = JSON.parse(JSON.stringify(that.patents_original[i]));
          var cams: any[] = [];
          for (var x = 0; x < that.patents_original[i].children.length; x++) {
            if (
              that.patents_original[i].children[x].name
                .toLowerCase()
                .indexOf(that.searchPatent_tmp1.toLowerCase()) > -1 ||
              that.patents_original[i].children[x].id_camara
                .toLowerCase()
                .indexOf(that.searchPatent_tmp1.toLowerCase()) > -1
            ) {
              // Encontró en parent
              cams.push(that.patents_original[i].children[x]);
            }
          }
          if (cams.length > 0) {
            patent.children = cams;
            newList.push(patent);
          }
        }
      }
      that.patents = JSON.parse(JSON.stringify(newList));
      that.clear();
    }, 300);

    setTimeout(function() {
      that.loadingService.hideLoading();
    }, 1000);
  }

  handleChangePatent() {
    let url = new URL(window.location.href);
    if (this.searchPatent_tmp1 == '') {
      this.isFilter = false;
      var that = this;
      this.loadingService.showLoading();
      this.patents = [];
      this.patents = JSON.parse(JSON.stringify(this.patents_original));
      this.clear();
      setTimeout(function() {
        that.loadingService.hideLoading();
      }, 1000);
    } else {
      this.isFilter = true;
      if (url.pathname == '/camaras-envivo') {
        this.changePatent();
      } else {
        this.changePatentv2();
      }
    }
  }

  changePatent() {
    this.loadingService.showLoading();
    let that = this;
    setTimeout(function() {
      if (that.patents_original.length == 0) {
        that.patents_original = JSON.parse(JSON.stringify(that.patents));
      }
      if (that.searchPatent_tmp1 == '') {
        that.patents = [];
        that.patents = JSON.parse(JSON.stringify(that.patents_original));
      } else {
        let patenteAll =
          that.patents_original.length > 0
            ? that.patents_original
            : that.patents;
        that.patents = patenteAll.filter(
          x =>
            x.name.toLowerCase().indexOf(that.searchPatent_tmp1.toLowerCase()) >
              -1 ||
            x.id_camara
              .toLowerCase()
              .indexOf(that.searchPatent_tmp1.toLowerCase()) > -1
        );
      }
      // clearInterval(that.timerUpdateCoordinates);
      // that.treeViewList = [];
      // // @ts-ignore
      // that.$refs.tree.updateAll(false);
      // that.current_patent = {};
      // that.listCam = [];
      that.clear();
    }, 300);

    setTimeout(function() {
      that.loadingService.hideLoading();
    }, 2000);
  }

  async getCameraCoordinates(): Promise<{}> {
    const body: {} = {
      id_camera: this.current_patent.id_camara,
    };
    return fetchCamaraModulo(body, 'getCameraCoordinates')
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          if (response.status == 200) {
            return response.data.data;
          } else {
            this.$snotify.error('Error al obtener coordenadas');
            return {};
          }
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al obtener coordenadas');
        return {};
      })
      .finally(() => {
        return {};
      });
  }

  handleCam(patent: any) {
    this.current_patent = patent;
  }

  initializeRenderMap() {
    var lat = this.lastLat;
    var lon: number = this.lastLong;

    var myLatlng = new google.maps.LatLng(lat, lon);

    var mapOptions: any = {
      zoom: 9,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: myLatlng,
      mapTypeControl: false,
      streetViewControl: true,
      gestureHandling: 'greedy',
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      minZoom: 2,
      maxZoom: 20,
    };
    this.infoWindows = new google.maps.InfoWindow({
      content: '',
    });

    this.map = new google.maps.Map(
      document.getElementById(this.mapName),
      mapOptions
    );
  }

  renderMap(lat: any, lon: any, date: any) {
    var myLatlng = new google.maps.LatLng(lat, lon);

    try {
      this.marker.setMap(null);
    } catch (e) {
      console.log(null);
    }

    this.marker = new google.maps.Marker({
      position: myLatlng,
      map: this.map,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        labelOrigin: new google.maps.Point(75, 32),
        size: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32),
      },
      label: {
        text: 'Posición',
        color: '#C70E20',
        fontWeight: 'bold',
      },
    });

    this.infoWindows.setContent(this.generateHtml(lat, lon, date));
    this.map.setCenter(myLatlng);

    var self = this;
    google.maps.event.addListener(this.marker, 'click', function() {
      self.infoWindows.open(self.map, self.marker);
      // window.open(`https://maps.google.com/?q=${lat},${lon}`);
    });

    // this.infoWindow.open(this.map, marker);

    const mapContainer = document.getElementById(this.mapName);

    mapContainer.addEventListener('mousemove', this.updateMouseCoordinates, {
      passive: true,
    });
  }

  generateHtml(lat: string, lon: string, date: string): string {
    var html: string = '';
    const url: string = `https://maps.google.com/?q=${lat},${lon}`;
    html =
      '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<h1 id="firstHeading" class="firstHeading">Última Actividad</h1>' +
      '<div id="bodyContent">' +
      '<p></p>' +
      `<p><b style="font-weight: 700;">Fecha: </b> ${date}</p>` +
      `<p><b style="font-weight: 700;">Coordenadas: </b> <a href="${url}" target="_blank">Presionar Link</a></p>` +
      '</div>' +
      '</div>';

    return html;
  }

  updateMouseCoordinates(event: MouseEvent) {
    const point2LatLng = (point: google.maps.Point) => {
      const { map } = this;
      const topRight = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getNorthEast());
      const bottomLeft = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getSouthWest());
      const scale = Math.pow(2, map.getZoom());
      const worldPoint = new google.maps.Point(
        point.x / scale + bottomLeft.x,
        point.y / scale + topRight.y
      );
      return map.getProjection().fromPointToLatLng(worldPoint);
    };
  }

  mounted() {
    this.getLimitOldCams();
    this.getPatents();
    this.initializeRenderMap();
    this.dragElement(document.getElementById('separator'), 'H');
    // this.updateMap();
  }

  get filter() {
    return (item: any, search: any, textKey: any) =>
      item[textKey].toLowerCase().indexOf(search.toLowerCase()) > -1;
  }

  closeFirstDiv() {
    this.fullCams = false;
    document.getElementById('first').style.width = '75%';
    document.getElementById('second').style.width = '25%';
    CamaraEventBus.$emit('refreshCam');
  }

  fullFirstDiv() {
    this.fullCams = true;
    document.getElementById('first').style.width = '99%';
    document.getElementById('second').style.width = '0px';
    CamaraEventBus.$emit('refreshCam');
  }

  async getLimitOldCams(){
    this.loadingService.showLoading();
    fetchCamaraModulo({}, 'getLimitAncientCam')
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.limitAncientCams = response.data.limit;
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al obtener el límite de las cámaras Cms6');
      })
      .finally(() => {
        this.loadingService.hideLoading();
        this.isActiveGetPatents = false;
        this.searchPatent_tmp1 = '';
        this.clear();
      });
  }

  async getPatents() {
    if(this.isActiveGetPatents){
      return;
    }
    this.isActiveGetPatents = true;
    this.loadingService.showLoading("Por favor espere...", "geInLivePatents");
    const body: any = {
      id_cliente: this.getClientID(),
      id_user: this.getUserID(),
    };
    let url = new URL(window.location.href);
    if (url.pathname != '/camaras-envivo') {
      body.operaciones = 'SI';
      this.isOperation = true;
      this.sizeSplitPane = 600;
    } else {
      this.sizeSplitPane = 300;
    }
    fetchCamaraModulo(body, 'getInLivePatents')
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.patents = response.data.data;
          this.patents_original = JSON.parse(
            JSON.stringify(response.data.data)
          );
          if (this.isOperation) {
            this.url_live = response.data.url_live;
          }
          this.totalLength = response.data.totalCameras;
          this.totalActives = response.data.totalActives;
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al obtener las cámaras');
      })
      .finally(() => {
        this.loadingService.hideLoading("geInLivePatents");
        this.isActiveGetPatents = false;
        this.searchPatent_tmp1 = '';
        this.clear();
      });
  }

  clear() {
    //clearInterval(this.timerUpdateCoordinates);
    this.treeViewList = [];
    // @ts-ignore
    this.$refs.tree.updateAll(false);
    this.current_patent = {};
    CamaraEventBus.$emit('handleCams', [], 'clear');
    this.listCam = [];
  }

  getUserID(): number {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return parseInt(id);
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 3798;
  }

  dragElement(element: any, direction: any) {
    let md: any = {}; // remember mouse down info
    const first = document.getElementById('first');
    const second = document.getElementById('second');
    var self = this;
    element.onmousedown = onMouseDown;

    function onMouseDown(e: any) {
      //console.log("mouse down: " + e.clientX);
      md = {
        e,
        offsetLeft: element.offsetLeft,
        offsetTop: element.offsetTop,
        firstWidth: first.offsetWidth,
        secondWidth: second.offsetWidth,
      };

      document.onmousemove = onMouseMove;
      document.onmouseup = () => {
        //console.log("mouse up");
        document.onmousemove = document.onmouseup = null;
        // if (self.fullCams) {
        //   self.fullCams = false;
        // }
        CamaraEventBus.$emit('refreshCam');
      };
    }

    function onMouseMove(e: any) {
      //console.log("mouse move: " + e.clientX);
      var delta = { x: e.clientX - md.e.clientX, y: e.clientY - md.e.clientY };

      if (direction === 'H') {
        // Horizontal
        // Prevent negative-sized elements
        delta.x = Math.min(Math.max(delta.x, -md.firstWidth), md.secondWidth);

        element.style.left = md.offsetLeft + delta.x + 'px';
        first.style.width = md.firstWidth + delta.x + 'px';
        second.style.width = md.secondWidth - delta.x + 'px';
      }
    }
  }
}
</script>

<style scoped>
/* .splitPaneColumn >>> .Pane{
  width: auto !important;
} */

.pane-rs >>> span.columnsres {
  background-color: rgba(0, 0, 0, 0.12) !important;
  width: 7px !important;
}
.pane-rs >>> span.rowsres {
  background-color: rgba(0, 0, 0, 0.12) !important;
  height: 7px !important;
}
.v-treeview >>> .v-treeview-node__label {
  font-family: arial, sans-serif;
}
.v-treeview >>> .v-treeview-node--active {
  background-color: transparent !important;
}
#withoutPatent {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
#mainContainer {
  width: 100%;
  display: flex;
  height: 100%;
}
#separator {
  cursor: col-resize;
  background-image: url('~@/assets/puntos.svg');
  background-color: #f1f4f5;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 100%;
  min-width: 20px;
  border-left: solid 2px #ccd1d3;
  border-right: solid 2px #ccd1d3;

  /* Prevent the browser's built-in drag from interfering */
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

#detailsContainer {
  height: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
}
#searchDiv {
  display: inline-flex;
  align-items: center;
}
#searchDiv .searchDivContent {
  display: inline-block;
}
#patentsDiv {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
#patentsContainer {
  padding-left: 5px;
  height: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
}
#camContainer {
  height: 100%;
  width: 100%;
  display: flex;
}
.google-map {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: gray;
}
#first {
  height: 100%;
  width: 75%;
  transition: 0.5s;
  z-index: 1;
  top: 0;
  left: 0;
  overflow-x: hidden;
  transition: 0.5s;
}
.btn_left {
  margin: 0;
  position: absolute;
  top: 45%;
  margin-left: -5px;
  cursor: pointer;
}

#second {
  height: 100%;
  transition: 0.5s;
  width: 25%;
}

.btn_right {
  margin: 0;
  position: absolute;
  top: 53%;
  margin-left: -5px;
  cursor: pointer;
}

.checkboxClass >>> .v-input__slot {
  top: 9px !important;
}
</style>
