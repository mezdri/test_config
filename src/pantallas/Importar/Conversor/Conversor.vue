<template>
  <div>
    <div style="height: 55vh; padding: 20px">
      <v-card height="100%">
        <div
          style="height: 100%"
          @drop.prevent="onDrop"
          @dragover.prevent="dragover = true"
          @dragenter.prevent="dragover = true"
          @mouseover="dragover = true"
          @mouseleave="dragover = false"
          @dragleave.prevent="dragover = false"
          :class="{ 'grey lighten-2': dragover }"
          @click="$refs.file.click()"
          v-show="emptyList"
        >
          <input
            type="file"
            ref="file"
            style="display: none"
            v-on:change="onSelectFile"
          />
          <div class="centerDiv">
            <div>
              <div class="centerDiv">
                <v-icon size="60">upload</v-icon>
              </div>
              <p>
                Selecciona tu archivo o arrastra aquí
              </p>
            </div>
          </div>
        </div>

        <v-card height="100%" width="100%" v-show="!emptyList"
          ><v-card-title><h3>Archivos</h3></v-card-title>
          <v-card
            height="40vh"
            width="40vw"
            elevation="0"
            style="overflow:auto; margin-left: 30%; height: 100%; background-color: #11ffee00;"
          >
            <div class="centerDiv2">
              <div>
                <div
                  v-for="(item, i) in items"
                  :key="i"
                  style="margin-bottom: 8px"
                >
                  <v-card
                    height="30px"
                    elevation="0"
                    shaped
                    class="rounded-card font-weight-medium text-h4"
                  >
                    <v-flex>
                      <v-btn
                        icon
                        rounded
                        @click="erase(i)"
                        title="Eliminar archivo"
                      >
                        <v-icon color="red"> cancel</v-icon></v-btn
                      >
                      {{ item.name }}
                      <v-icon color="green"> checkbox</v-icon>
                    </v-flex>
                  </v-card>
                </div>
              </div>
            </div>
          </v-card>
        </v-card>
      </v-card>
    </div>
    <!-- <div style="height: 40vh;">hola2</div> -->
    <div
      style="height: 18vh; margin-left: 15px; display:flex; align-items: center;   "
    >
      <div class="containConfigDiv">
        <div style="text-align: center; margin-left: 100px;">
          <v-card
            class="typeTrack3Card"
            elevation="0"
            shaped
            v-show="track3Export"
            ><v-card-title> Descargar como:</v-card-title>
            <v-radio-group v-model="radioGroupTDownloadType" row>
              <div class="rbDivExport">
                <v-radio
                  class="align-center justify-center"
                  value="allPolygon"
                  label="Todos los polígonos en el archivo"
                ></v-radio>
              </div>
              <div class="rbDivExport">
                <v-radio
                  class="align-center justify-center"
                  value="perPolygon"
                  label="Polígono por archivo"
                ></v-radio>
              </div> </v-radio-group
          ></v-card>
        </div>
        <div style="text-align: center; margin-left: 100px;">
          <v-card
            class="typeTrack3Card"
            elevation="0"
            shaped
            v-show="track3Export"
            ><v-card-title> Exportar como:</v-card-title>
            <v-radio-group v-model="radioGroupTrack3Type" row>
              <div class="rbDivExport">
                <v-radio
                  class="align-center justify-center"
                  value="sitios"
                  label="Sitios"
                ></v-radio>
              </div>
              <div class="rbDivExport">
                <v-radio
                  class="align-center justify-center"
                  value="geocercas"
                  label="Geocercas"
                  v-show="isDirector"
                ></v-radio>
              </div> </v-radio-group
          ></v-card>
        </div>
        <v-radio-group v-model="radioGroupExport" row>
          <div class="rbDiv">
            <v-radio
              class="align-center justify-center"
              value="track3"
            ></v-radio
            >Exportar para Track3
          </div>
          <div class="rbDiv">
            <v-radio
              class="align-center justify-center"
              value="navman"
            ></v-radio
            >Exportar para Navman
          </div>
          <div class="rbDiv">
            <v-radio
              class="align-center justify-center"
              value="director"
            ></v-radio
            >Exportar para Director
          </div>
        </v-radio-group>
      </div>
      <div class="containConfigDiv" style="margin-left: 2vw;">
        <v-btn
          id="btnExportCSV"
          style="height: 7vh; width: 12vw; margin-right: 45px; background: #fafafa"
          :class="{ 'disable-events': emptyList }"
          class="elevation-0 "
          @click="exportCsv"
        >
          <v-icon x-large class="importExportBtnIcon">cloud_download</v-icon
          >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Exportar Csv
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import DialogLoad from '@/pantallas/Importar/Conversor/DialogLoad.vue';
import { parseKmz } from '@/pantallas/Importar/Conversor/parseKmz';

@Component({
  components: { DialogLoad },
})
export default class Conversor extends Vue {
  // State
  dialog: boolean = false;
  dragover: boolean = false;
  multiple: any = false;
  uploadedFiles: any[] = [];
  emptyList: boolean = true;
  radioGroupExport: string = 'track3';
  radioGroupTrack3Type: string = 'sitios';
  radioGroupTDownloadType: string = 'allPolygon';
  files: File[] = [];
  $snotify: any;
  resultExport: number = 0;
  track3Export: boolean = true;
  isDirector: boolean = true;
  items: {}[] = [
    {
      file: '123.png',
      geocerca: 15,
    },
    {
      file: 'hacia_abajo.jpg',
      geocerca: 3,
    },
    {
      file: '123.png',
      geocerca: 4329,
    },
    {
      file: 'dssffs.png',
      geocerca: 431,
    },
    {
      file: 'sdfhbnvvc34.png',
      geocerca: 2,
    },
    {
      file: 'ñlkal_dsff.png',
      geocerca: 324,
    },
    {
      file: '304922.png',
      geocerca: 345,
    },
    {
      file: 'fgnvc.png',
      geocerca: 14,
    },
    {
      file: 'e.png',
      geocerca: 9,
    },
    {
      file: 'dfgxca.png',
      geocerca: 23,
    },
    {
      file: 'dfgxca.png',
      geocerca: 23,
    },
    {
      file: 'dfgxca.png',
      geocerca: 23,
    },
    {
      file: 'dfgxca.png',
      geocerca: 23,
    },
  ];

  @Watch('items')
  onItemsChanged(value: [], oldValue: []) {
    if (this.items.length > 0) {
      this.emptyList = false;
    } else {
      this.emptyList = true;
    }
  }

  @Watch('files')
  onFilesChanged(value: [], oldValue: []) {
    var fileExtension: string = '';
    for (var file of this.files) {
      fileExtension = file.name.split('.').pop();
      if (fileExtension != 'kmz') {
        this.$snotify.error('Todos los archivos ingresados deben ser .kmz');
        this.files = [];
        this.items = [];
        break;
      }
    }
  }

  @Watch('resultExport')
  onResultChanged(value: number, oldValue: number) {
    //console.log(this.resultExport);
  }

  @Watch('radioGroupExport')
  onRadioGroupChanged(value: string, oldValue: string) {
    if (value == 'director') {
      this.isDirector = false;
    } else {
      this.isDirector = true;
    }
  }

  erase(position: number) {
    this.items.splice(position, 1);
  }

  async exportCsv() {
    var excludedList: any[] = [];
    for (var file of this.files) {
      excludedList = await this.parseFile(file);
      if (excludedList.length > 0) {
        this.$snotify.success(
          'Se excluyeron los siguientes polígonos por exceder el límite de 50 puntos: ' +
            excludedList.join(' - ')
        );
      }
    }
    this.$snotify.success(
      'Todos los archivos se han exportado a Csv con éxito'
    );
  }

  onSelectFile(e: any) {
    this.files = e.target.files;
    this.items = Array.from(e.target.files);
  }

  async parseFile(file: any) {
    const fil = await parseKmz(
      file,
      this.radioGroupExport,
      this.radioGroupTrack3Type,
      this.radioGroupTDownloadType
    );
    return fil;
  }

  onDrop(e: any) {
    this.dragover = false;
    this.files = e.dataTransfer.files;
    this.items = Array.from(e.dataTransfer.files);
    //this.parseFile(this.files[0])
  }
}
</script>
<style scoped>
.centerDiv {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.centerDiv2 {
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rounded-card {
  border-radius: 50px;
}
.containConfigDiv {
  margin-left: auto;
  display: flex;
  align-items: center;
}

/* #btnExportCSV {
  background: #27488E;
  color: white;  
} */

.disable-events {
  pointer-events: none;
  color: gray;
}
.typeTrack3Card {
  height: 15vh;
  width: 10vw;
  background: #fafafa;
}
.rbDiv {
  text-align: center;
  margin-left: 80px;
}
.rbDivExport {
  margin-top: -20px;
  margin-bottom: 25px;
  margin-left: 13px;
}
</style>
