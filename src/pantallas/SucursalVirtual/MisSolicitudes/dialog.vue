<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card>
      <v-flex wrap layout>
        <v-flex sm10>
          <v-card-title class="headline">{{ item.titulo }}</v-card-title>
        </v-flex>
        <v-flex sm2 style="text-align: right;">
          <v-btn color="red" class="white--text" @click="$emit('close', false)">
            Cerrar
          </v-btn>
        </v-flex>
      </v-flex>
      <v-divider></v-divider>

      <v-card-text>
        <p>
          <b>N° Caso: </b>{{ item.num_solicitud }}<br />
          <b>Patente: </b>{{ item.patente }}<br />
          <b>Fecha creacion: </b>{{ item.fecha_creacion }}<br />
          <b>Ejecutivo de cuenta: </b>{{ item.ejecutivo }}<br />
          <b>Estado: </b>{{ item.estado }}<br />
          <b>Descripción: </b>
          <v-container fluid grid-list-md>
            <v-textarea
              name="input-7-1"
              box
              disabled
              auto-grow
              :value="item.descripcion"
            ></v-textarea>
          </v-container>
        </p>
      </v-card-text>

      <v-card-title class="headline">Adjuntar documento</v-card-title>

      <v-card-text>
        <v-container grid-list-md text-xs-left>
          <v-layout row wrap>
            <v-flex xs6>
              Comentarios<span style="color: red">*</span>
              <v-textarea
                v-model="comentario"
                name="input-7-1"
                value=""
                hint=""
              ></v-textarea>
            </v-flex>
            <v-flex xs6>
              Documentos
              <v-list two-line subheader>
                <v-list-tile-title v-if="SinDocs" style="color: #6d6d6d;"
                  >Sin Documentos</v-list-tile-title
                >
                <v-list-tile v-for="i in documentos" :key="i.NombreDoc" avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ i.NombreDoc }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{
                      i.FechaCreacion.replace('T', ' ').replace('Z', '')
                    }}</v-list-tile-sub-title>
                    <v-list-tile-sub-title
                      v-if="i.LstNotas[0].Comentarios != null"
                      ><strong>Comentario: </strong
                      >{{ i.LstNotas[0].Comentarios }}</v-list-tile-sub-title
                    >
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn icon>
                      <v-icon
                        color="blue darken-2"
                        @click="descargar(i.LstNotas[0].IdNota)"
                        >file_download</v-icon
                      >
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs6>
              Agregar archivo<span style="color: red">*</span>
              <v-text-field
                label="Elegir archivo..."
                @click="onPickFile"
                v-model="fileName"
                prepend-icon="attach_file"
                clearable
              ></v-text-field>
              <!-- Hidden -->
              <input
                type="file"
                style="display: none"
                ref="fileInput"
                accept="*/*"
                @change="onFilePicked"
              />
              <v-spacer></v-spacer>
              <v-btn class="black--text" color="warning" @click="subirDoc()"
                >Subir archivo <v-icon right dark>cloud_upload</v-icon></v-btn
              >
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn color="warning" class="black--text" @click="exportar()">
          Exportar a Excel
          <v-icon right dark>description</v-icon>
        </v-btn>

        <v-btn color="red" class="white--text" @click="$emit('close', false)">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  misSolicitudesListaDocService,
  misSolicitudesObtenerEpcService,
  misSolicitudesArchivosService,
  misSolicitudesSubirDocService,
  misSolicitudesDescargarService,
} from './MisSolicitudesService';
import { LoadingService } from '@/services/loadingService';

export default {
  name: 'MisSolicitudesDialog',
  props: {
    item: Object,
    dialog: Boolean,
  },
  data() {
    return {
      fileName: '',
      url: '',
      fileB64: '',
      fileSize: 0,
      fileObject: null,
      listaDoc: '',
      obtenerEpc: '',
      archivos: '',
      comentario: '',
      loadingService: new LoadingService(),
      SinDocs: false,
      documentos: [],
    };
  },
  methods: {
    onPickFile() {
      this.$refs.fileInput.click();
    },
    onFilePicked(e) {
      let self = this;
      var tgt = e.target || window.event.srcElement,
        files = tgt.files;
      this.fileName = files[0].name;
      if (FileReader && files && files.length) {
        this.fileSize = files[0].size;
        var fr = new FileReader();

        fr.onload = function() {
          var base64 = fr.result;
          self.fileB64 = base64;
        };
        fr.readAsDataURL(files[0]);
      }
      this.idkey += 1;
    },
    async getArchivos() {
      const res = (await this.obtenerArchivos()) || [];
      //  console.log(res.data)
    },
    obtenerArchivos() {
      return misSolicitudesArchivosService(this.item.id).catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los archivos',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los archivos',
            { timeout: 3000 }
          );
        }
      });
    },
    async getEpc() {
      const res = (await this.obtenerDocEpc()) || [];
      //  console.log(res.data)
    },
    obtenerDocEpc() {
      return misSolicitudesObtenerEpcService(this.item.id).catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error('Ha ocurrido un error al intentar obtener Epc', {
            timeout: 3000,
          });
        } else if (error.response.status != 404) {
          this.$snotify.error('Ha ocurrido un error al intentar obtener Epc', {
            timeout: 3000,
          });
        }
      });
    },
    async getListaDoc() {
      const res = (await this.obtenerListaDoc()) || [];
      if (res.data.CODIGO_RESPUESTA != '1') {
        this.$snotify.error(res.data.MENSAJE_RESPUESTA, { timeout: 3000 });
      } else {
        this.documentos = res.data.data;
        if (this.documentos.length == 0) {
          this.SinDocs = true;
        }
      }
    },
    obtenerListaDoc() {
      this.loadingService.showLoading();
      return misSolicitudesListaDocService(this.item.id)
        .catch(error => {
          if (error.message == 'Network Error') {
            this.$snotify.error(
              'Ha ocurrido un error al intentar obtener los documentos',
              { timeout: 3000 }
            );
          } else if (error.response.status != 404) {
            this.$snotify.error(
              'Ha ocurrido un error al intentar obtener los documentos',
              { timeout: 3000 }
            );
          }
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    },
    subirDoc() {
      this.loadingService.showLoading();
      let _self = this;
      return misSolicitudesSubirDocService(
        this.item.id,
        'Documento',
        this.comentario,
        this.item.id_cliente,
        this.fileName,
        this.fileB64
      )
        .then(response => {
          if (response.CODIGO_RESPUESTA != '1') {
            this.$snotify.error(response.MENSAJE_RESPUESTA, { timeout: 3000 });
          } else {
            this.$snotify.success('Archivo cargado correctamente.', {
              timeout: 3000,
            });
          }
        })
        .catch(error => {
          if (error.message == 'Network Error') {
            this.$snotify.error(
              'Ha ocurrido un error al intentar obtener los documentos',
              { timeout: 3000 }
            );
          } else if (error.response.status != 404) {
            this.$snotify.error(
              'Ha ocurrido un error al intentar obtener los documentos',
              { timeout: 3000 }
            );
          }
        })
        .finally(() => {
          setTimeout(function() {
            _self.loadingService.hideLoading();
            _self.fileName = null;
            _self.comentario = '';
            _self.getListaDoc();
          }, 3000);
        });
    },
    async descargar(idDoc) {
      this.loadingService.showLoading();
      const res = (await this.descargarDoc(idDoc)) || [];
      if (res.data.CODIGO_RESPUESTA !== '1') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el archivo',
          { timeout: 3000 }
        );
        this.loadingService.hideLoading();
        return false;
      }
      let response = res.data.data;
      //let response = res.data.data.substring(2, res.data.data.length - 1);
      let filename = res.data.filename;
      let type1 = res.data.type;
      //response = response.split('\\r\\n');
      //let csvContent = 'data:text/csv;charset=utf-8,';
      //response.map(e => {
      //  csvContent += e + '\n';
      //});

      //let encodedUri = encodeURI(response);
      let link = document.createElement('a');
      let url = 'data:' + type1 + ';base64,' + response;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      this.loadingService.hideLoading();
      link.click();
    },
    descargarDoc(idDoc) {
      return misSolicitudesDescargarService(idDoc).catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los archivos',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los archivos',
            { timeout: 3000 }
          );
        }
      });
    },
    exportar() {
      let dataToExcel = [
        'Título;Nº Solicitud;Razón Social;RUT;Ejecutivo;Tipo;Fecha creación;Descripción;Estado;Documentos',
      ];
      let dataAux = '';
      this.item.titulo !== ''
        ? (dataAux += this.item.titulo.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.num_solicitud !== ''
        ? (dataAux +=
            this.item.num_solicitud.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.razon_social !== ''
        ? (dataAux +=
            this.item.razon_social.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.rut !== ''
        ? (dataAux += this.item.rut.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.ejecutivo !== ''
        ? (dataAux += this.item.ejecutivo.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.tipo !== ''
        ? (dataAux += this.item.tipo.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.fecha_creacion !== ''
        ? (dataAux +=
            this.item.fecha_creacion.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.descripcion !== ''
        ? (dataAux +=
            this.item.descripcion.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      this.item.estado !== ''
        ? (dataAux += this.item.estado.replace(/(\r\n|\n|\r|,)/gm, '') + ';')
        : (dataAux += ';');
      if (this.item.documentos) {
        for (let i in this.item.documentos) {
          dataAux += this.item.documentos[i].NombreDoc;
        }
        dataAux += ';';
      }
      dataToExcel.push(dataAux);
      let csvContent = 'data:text/csv;charset=utf-8,';
      dataToExcel.map(e => {
        csvContent += e + '\n';
      });

      let encodedUri = encodeURI(csvContent);
      let link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'Documento.xlsx');
      document.body.appendChild(link);

      link.click();
    },
  },
  beforeMount() {
    this.getArchivos();
    this.getEpc();
    this.getListaDoc();
  },
};
</script>

<style></style>
