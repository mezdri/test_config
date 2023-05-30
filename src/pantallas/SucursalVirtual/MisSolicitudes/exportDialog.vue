<template>
  <v-dialog v-model="dialog" max-width="800">
    <v-card>
      <v-card-title class="headline"
        >Solicitud - Técnica - Solicitud Equipos para stock</v-card-title
      >
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
                <v-list-tile
                  v-for="i in item.documentos"
                  :key="i.NombreDoc"
                  avatar
                >
                  <v-list-tile-content>
                    <v-list-tile-title>{{ i.NombreDoc }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{
                      i.FechaCreacion
                    }}</v-list-tile-sub-title>
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

        <v-btn
          color="warning"
          class="black--text"
          @click="$emit('close', false)"
        >
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

export default {
  name: 'MisSolicitudesExportDialog',
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
      console.log(res.data);
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
      console.log(res.data);
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
      this.item.documentos = res.data;
    },
    obtenerListaDoc() {
      return misSolicitudesListaDocService(this.item.id).catch(error => {
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
      });
    },
    subirDoc() {
      return misSolicitudesSubirDocService(
        this.item.id,
        'Documento',
        this.comentario,
        this.item.id_cliente,
        this.fileName,
        this.fileB64
      ).catch(error => {
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
      });
    },
    async descargar(idDoc) {
      const res = (await this.descargarDoc(idDoc)) || [];
      let response = res.data.substring(2, res.data.length - 1);
      response = response.split('\\r\\n');
      let csvContent = 'data:text/csv;charset=utf-8,';
      response.map(e => {
        csvContent += e + '\n';
      });

      let encodedUri = encodeURI(csvContent);
      let link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'Documento.csv');
      document.body.appendChild(link);

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
  },
  beforeMount() {
    this.getArchivos();
    this.getEpc();
    this.getListaDoc();
  },
};
</script>

<style></style>
