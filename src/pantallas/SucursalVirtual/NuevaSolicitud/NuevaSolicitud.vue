<template>
  <div class="pa-4 pt-6">
    <WidgetUser />
    <v-flex sm12 md12 layout wrap>
      <FormFieldsContainer class="flex sm6 md6">
        <v-flex sm12 md12>
          <v-select
            v-model="formFields.empresa.value"
            :label="formFields.empresa.label"
            :items="listaEmpresas"
            item-text="nombre"
            item-value="id"
            v-on:change="searchDataEmpresa"
          />
        </v-flex>
        <v-flex sm12 md12>
          <v-select
            v-model="formFields.tipo.value"
            :label="formFields.tipo.label"
            :items="listaTipos"
            item-text="nombre"
            item-value="id"
          />
        </v-flex>
        <v-flex sm12 md12>
          <v-select
            v-model="formFields.categoria.value"
            :label="formFields.categoria.label"
            :items="listaCategorias"
            item-text="nombre"
            item-value="id"
          />
        </v-flex>
        <!--
      <v-flex sm12 md12>
        <v-text-field
          v-model="formFields.patente.value"
          :label="formFields.patente.label"
          single-line
          hide-details
        />
      </v-flex>
    -->

        <v-flex sm12 md12>
          <v-combobox
            :items="formFields.patente.items"
            :label="formFields.patente.label"
            v-model="activosSelected"
            multiple
            dense
            @change="patenteBlur"
          ></v-combobox>
        </v-flex>

        <v-flex sm12 md12>
          <v-textarea
            v-model="formFields.descripcion.value"
            :label="formFields.descripcion.label"
            no-resize
            :rules="[v => v.length >= 10 || 'Ingrese al menos 10 caracteres']"
            value=""
            rows="5"
          />
        </v-flex>
        <v-flex xs12 sm12 md12 layout>
          <v-btn
            class="btn-sucursal"
            style="margin-top: 10px;"
            @click="$refs.image.click()"
          >
            <v-icon>attach_file</v-icon></v-btn
          >
          <v-text-field
            xs8
            sm8
            md8
            label="Seleccione Archivo"
            heigh
            @click="$refs.image.click()"
            v-model="fileName"
            v-validate="'required|extension|tamanio'"
            :error-messages="errors.collect('archivo')"
            data-vv-name="archivo"
            readonly="readonly"
          ></v-text-field>
          <input
            type="file"
            style="display: none;"
            ref="image"
            accept="*"
            @change="onFilePicked"
            :key="idkey"
          />
        </v-flex>
        <v-flex sm12 md12>
          <p>Favor indicar datos del contacto a cargo de este requerimiento</p>
          <v-radio-group v-model="radios">
            <v-radio
              @change="checkTipoContacto(false)"
              label="Yo mismo"
              value="yo_mismo"
            ></v-radio>
            <v-radio
              @change="checkTipoContacto(true)"
              label="Otro"
              value="otro"
            ></v-radio>
          </v-radio-group>
        </v-flex>
        <v-flex sm12 md12 v-show="showTipoContacto">
          <v-flex sm8 md8>
            <v-text-field
              v-model="formFields.nombre.value"
              :label="formFields.nombre.label"
              single-line
              hide-details
            />
          </v-flex>
          <v-flex sm8 md8>
            <v-text-field
              v-model="formFields.apellido.value"
              :label="formFields.apellido.label"
              single-line
              hide-details
            />
          </v-flex>
          <v-flex sm8 md8>
            <v-text-field
              v-model="formFields.email.value"
              :label="formFields.email.label"
              single-line
              hide-details
            />
          </v-flex>
          <v-flex sm8 md8>
            <v-text-field
              v-model="formFields.telefono.value"
              :label="formFields.telefono.label"
              single-line
              hide-details
            />
          </v-flex>
          <v-flex sm8 md8>
            <v-select
              v-model="formFields.direccion.value"
              :label="formFields.direccion.label"
              :items="listaDirecciones"
              item-text="nombre"
              item-value="id"
              :disabled="showNuevaDireccion"
            />
          </v-flex>
          <v-flex sm8 md8>
            <div class="text-sm-center">
              <v-btn class="btn-sucursal btn-nuevadir" @click="nuevaDireccion">
                <v-icon>home</v-icon> Nueva Dirección
              </v-btn>
            </div>
          </v-flex>
        </v-flex>
        <v-flex sm12 md12 v-show="showNuevaDireccion">
          <v-flex sm8 md8>
            <v-select
              v-model="formFields.region.value"
              :label="formFields.region.label"
              :items="listaRegiones"
              item-text="nombre"
              item-value="id"
              v-on:change="searchComunas"
            />
          </v-flex>
          <v-flex sm8 md8>
            <v-select
              v-model="formFields.comuna.value"
              :label="formFields.comuna.label"
              :items="listaComunas"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
          <v-flex sm8 md8>
            <v-text-field
              v-model="formFields.calle.value"
              :label="formFields.calle.label"
              single-line
              hide-details
            />
          </v-flex>
          <v-flex sm8 md8>
            <v-text-field
              v-model="formFields.complemento.value"
              :label="formFields.complemento.label"
              single-line
              hide-details
            />
          </v-flex>
        </v-flex>
        <v-flex sm12 md12>
          <p>¿Deseas recibir notificaciones de avance de tu solicitud?</p>
          <v-radio-group v-model="radiosNotif">
            <v-radio label="No." value="140390000"></v-radio>
            <v-radio
              label="Sí, todas las notificaciones."
              value="140390001"
            ></v-radio>
            <v-radio
              label="Sí, solo para el cierre de solicitud."
              value="140390002"
            ></v-radio>
          </v-radio-group>
        </v-flex>

        <v-flex sm12 md12>
          <div class="text-sm-center">
            <v-btn class="btn-sucursal" @click="enviar">
              <v-icon>send</v-icon> Enviar
            </v-btn>
          </div>
        </v-flex>
      </FormFieldsContainer>
      <v-flex sm6 md6 style="text-align: center;">
        <img
          width="100%"
          style="max-width:500px;"
          src="https://sucursalvirtual.gpschile.com/Img/ImagenSucursal.png"
        />
      </v-flex>
    </v-flex>
    <div v-if="showRespuestaok" class="wrap-evidencia">
      <div id="myModal2" class="modalEnvio">
        <!-- Modal content -->
        <div class="modalEnvio-content">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Resumen Caso(s) Creado(s)</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeModal()">
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <div>
              <ul>
                <li v-for="(caso, key) in numCasosPatentes" :key="caso">
                  Patente <strong>{{ key }}</strong> Caso N°
                  <strong>{{ caso }}</strong>
                </li>
                <li v-for="caso in numCasosSinPatentes" :key="caso">
                  Caso N° {{ caso }}
                </li>
              </ul>
              <p>
                Nos pondremos en contacto dentro de las próximas 24 hrs de lunes
                a viernes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

//import FormNuevaSolicitud from '@/pantallas/SucursalVirtual/NuevaSolicitud/FormNuevaSolicitud.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '@/config/handleErrors'; //
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import moment from 'moment';

import {
  ConfigEmpresas,
  fetchEmpresas,
  ConfigTipos,
  fetchTipos,
  ConfigCategorias,
  fetchCategorias,
  fetchDirecciones,
  ConfigDireccion,
  fetchRegiones,
  fetchComunas,
} from '@/pantallas/SucursalVirtual/NuevaSolicitud/fetchConfigInicial';
import { crearCaso } from '@/pantallas/SucursalVirtual/NuevaSolicitud/crearCaso';
import {
  Activos,
  fetchActivos,
} from '@/pantallas/SucursalVirtual/NuevaSolicitud/fetchActivos';
import WidgetUser from '@/pantallas/SucursalVirtual/WidgetUser.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import { Validator } from 'vee-validate';
import { Snotify } from '@/snotify/Snotify';

@Component({
  components: {
    FormFieldsContainer,
    WidgetUser,
    //FormNuevaSolicitud,
  },
})
export default class NuevaSolicitud extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.VerFacturacion;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  listaEmpresas: ConfigEmpresas[] = [];
  listaTipos: ConfigTipos[] = [];
  listaCategorias: ConfigCategorias[] = [];
  listaDirecciones: ConfigDireccion[] = [];
  idkey: number = 0;
  fileName: string = '';
  fileSize: number = 0;
  file_b64: any = null;
  radios: any = null;
  activos: string[] = [];
  activosSelected: string[] = [];
  activosSelectedNew: string[] = [];
  radiosNotif: any = null;
  showNuevaDireccion: boolean = false;
  listaRegiones: ConfigDireccion[] = [];
  listaComunas: ConfigDireccion[] = [];
  numCasosPatentes: any = {};
  numCasosSinPatentes: string[] = [];
  showRespuestaok: boolean = false;

  formFields: FormFieldDefMap = {
    empresa: {
      label: 'Empresa',
      id: 'empresa',
      value: '',
    },
    tipo: {
      label: 'Tipo caso',
      id: 'tipo',
      value: '',
    },
    categoria: {
      label: 'Categoria',
      id: 'categoria',
      value: '',
    },
    patente: {
      label: 'Patente',
      id: 'patente',
      value: '',
      items: [],
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    apellido: {
      label: 'Apellido',
      id: 'apellido',
      value: '',
    },
    email: {
      label: 'Email',
      id: 'email',
      value: '',
    },
    telefono: {
      label: 'Teléfono',
      id: 'telefono',
      value: '',
    },
    direccion: {
      label: 'Dirección',
      id: 'direccion',
      value: '',
      items: [],
    },
    region: {
      label: 'Región',
      id: 'region',
      value: '',
      items: [],
    },
    comuna: {
      label: 'Comuna',
      id: 'comuna',
      value: '',
      items: [],
    },
    calle: {
      label: 'Calle',
      id: 'calle',
      value: '',
    },
    complemento: {
      label: 'Complemento',
      id: 'complemento',
      value: '',
    },
  };

  validateActivosSelected(activo: string) {
    //eslint-disable-next-line
    if (
      !/^([a-zA-Z]{4}\-{1}[0-9]{2})|([a-zA-Z]{2}\-{1}[0-9]{4})$/.test(activo)
    ) {
      this.$snotify.error(
        'La patente ' +
          activo +
          ' no tiene un formato valido (AAAA-00, AA-0000)',
        {
          timeout: 5000,
        }
      );
      return false;
    }
    return true;
  }
  patenteBlur(a: string) {
    this.activosSelected.forEach(i => {
      this.validateActivosSelected(i);
    });
  }

  async getRegiones() {
    this.listaRegiones = (await this.cargarRegiones()) || [];
  }
  cargarRegiones() {
    //this.loadingService.showLoading();
    return fetchRegiones().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las regiones',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las regiones',
          { timeout: 3000 }
        );
      }
    });
    //.finally(() => this.loadingService.hideLoading());
  }

  async getEmpresas() {
    this.listaEmpresas = (await this.cargarEmpresas()) || [];
  }
  cargarEmpresas() {
    //this.loadingService.showLoading();
    return fetchEmpresas().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
      }
    });
    //.finally(() => this.loadingService.hideLoading());
  }

  async getTipos() {
    this.listaTipos = (await this.cargarTipos()) || [];
    //this.listaTipos = fetchTipos();
  }
  cargarTipos() {
    //this.loadingService.showLoading();
    return fetchTipos().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de casos',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de casos',
          { timeout: 3000 }
        );
      }
    });
    //.finally(() => this.loadingService.hideLoading());
  }

  async getCategorias() {
    this.listaCategorias = (await this.cargarCategorias()) || [];
    this.listaCategorias.forEach(function(v) {
      if (v.header != '') {
        delete v.nombre;
        delete v.id;
      } else {
        delete v.header;
      }
    });
  }
  cargarCategorias() {
    //this.loadingService.showLoading();
    return fetchCategorias().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las categorias',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las categoriasp',
          { timeout: 3000 }
        );
      }
    });
    //.finally(() => this.loadingService.hideLoading());
  }

  constructor() {
    super();
    this.getEmpresas();
    this.getTipos();
    /*this.listaTipos = [
      {"id":"solicitud", "nombre":"Solicitud"},
      {"id":"problema", "nombre":"Problema"},
      {"id":"felicitacion", "nombre":"Felicitación"}
    ];*/
    this.getCategorias();
    this.getRegiones();
    this.showTipoContacto = false;
    this.showNuevaDireccion = false;
    //this.activos = ["uno","dos","tres"];
    //this.formFields.patente.items = ["uno","dos","tres"];
  }

  nuevaDireccion() {
    this.showNuevaDireccion = !this.showNuevaDireccion;
  }
  validateEmail(mail: string) {
    //eslint-disable-next-line
    if (
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        mail
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  async enviar() {
    if (String(this.formFields.empresa.value) == '') {
      this.$snotify.error('Debe seleccionar una empresa', { timeout: 3000 });
      return false;
    }
    let jtipo = '';
    if (String(this.formFields.tipo.value) == '') {
      this.$snotify.error('Debe seleccionar un tipo de caso', {
        timeout: 3000,
      });
      return false;
    } else {
      this.listaTipos.forEach(v => {
        if (v['id'] == String(this.formFields.tipo.value)) {
          jtipo = JSON.stringify(v);
        }
      });
    }
    let jcategoria = '';
    if (String(this.formFields.categoria.value) == '') {
      this.$snotify.error('Debe seleccionar una categoria', { timeout: 3000 });
      return false;
    } else {
      let asunto = '';
      let continue1 = true;
      this.listaCategorias.forEach(v => {
        if (continue1) {
          if ('header' in v) {
            asunto = v['header'];
          }
          if (String(this.formFields.categoria.value) == v['id']) {
            jcategoria =
              '{"id":"' +
              v['id'] +
              '","nombre":"' +
              v['nombre'] +
              '","header":"' +
              asunto +
              '"}';
            continue1 = false;
          }
        }
      });
    }
    if (
      this.formFields.descripcion.value == '' ||
      String(this.formFields.descripcion.value).length < 10
    ) {
      this.$snotify.error(
        'Debe ingresar una descripción con al menos 10 caracteres.',
        { timeout: 3000 }
      );
      return false;
    }
    let radio1: string = '';
    let direccion: any = {};
    if (this.radios == null || this.radios == '') {
      this.$snotify.error('Debe seleccionar un tipo de contacto a cargo', {
        timeout: 3000,
      });
      return false;
    } else {
      if (this.radios == 'yo_mismo') {
        radio1 = '1';
      } else {
        radio1 = '2';
        if (this.formFields.nombre.value == '') {
          this.$snotify.error('Debe ingresar un nombre', { timeout: 3000 });
          return false;
        }
        if (this.formFields.apellido.value == '') {
          this.$snotify.error('Debe ingresar un apellido', { timeout: 3000 });
          return false;
        }
        if (
          this.formFields.email.value == '' ||
          !this.validateEmail(String(this.formFields.email.value))
        ) {
          this.$snotify.error('Debe ingresar un email válido', {
            timeout: 3000,
          });
          return false;
        }
        let tfn = String(this.formFields.telefono.value);
        if (tfn == '' || tfn.length != 9 || isNaN(Number(tfn))) {
          this.$snotify.error(
            'Debe ingresar un teléfono válido con 9 dígitos',
            { timeout: 3000 }
          );
          return false;
        }
        if (this.showNuevaDireccion) {
          if (this.formFields.region.value == '') {
            this.$snotify.error('Debe seleccionar una región', {
              timeout: 3000,
            });
            return false;
          }
          if (this.formFields.comuna.value == '') {
            this.$snotify.error('Debe seleccionar una comuna', {
              timeout: 3000,
            });
            return false;
          }
          if (this.formFields.calle.value == '') {
            this.$snotify.error('Debe ingresar una calle', { timeout: 3000 });
            return false;
          }
          if (this.formFields.complemento.value == '') {
            this.$snotify.error('Debe ingresar un complemento de dirección', {
              timeout: 3000,
            });
            return false;
          }
          direccion['Calle'] = this.formFields.calle.value;
          direccion['Comuna'] = this.formFields.comuna.value;
          direccion['Comunas'] = this.listaComunas
            .filter(x => x['id'] == this.formFields.comuna.value)
            .map(x => {
              return { idComuna: x.id, nombreComuna: x.nombre };
            });
          direccion['Numero'] = this.formFields.complemento.value;
          direccion['Region'] = this.formFields.region.value;
        } else {
          if (this.formFields.direccion.value == '') {
            this.$snotify.error('Debe seleccionar una dirección', {
              timeout: 3000,
            });
            return false;
          }
        }
      }
    }
    let radiosNotif1 = '';
    if (this.radiosNotif == null || this.radiosNotif == '') {
      this.$snotify.error('Debe seleccionar una opción de notificación', {
        timeout: 3000,
      });
      return false;
    }

    let fileName = this.fileName == null ? '' : this.fileName;
    let file_b64 = this.file_b64 == null ? '' : this.file_b64;

    let enviarComoComentario = false;

    this.activosSelected.forEach(i => {
      if (!this.validateActivosSelected(i)) {
        return false;
      }
      if (!this.activos.includes(i)) {
        this.activosSelectedNew.push(i);
        this.activosSelected = this.activosSelected.filter(x => x != i);
        enviarComoComentario = true;
      }
    });
    //Equipo con Problema, Error en transmisión Web Service, Desinstalación Equipos, Desinstalación/Reinstalación equipos, Reinstalación Equipos,Factibilidad Técnica, Exceso Consumo SIM, Plataforma, Actualización Firmware, Usuario Plataforma, Geocercas y Sitios, Otros, Migración Navman a Director
    let categoriasObligatorias = [
      'a04f7a41-6caf-ea11-8111-00155d6b1004',
      '1b3d9254-6caf-ea11-8111-00155d6b1004',
      '16fe1cbd-451e-e811-80fa-00155d6b1004',
      '18fe1cbd-451e-e811-80fa-00155d6b1004',
      '1b9d5140-461e-e811-80fa-00155d6b1004',
      'd2ab425b-6caf-ea11-8111-00155d6b1004',
      'ffbc2c63-6caf-ea11-8111-00155d6b1004',
      '01bd2c63-6caf-ea11-8111-00155d6b1004',
      '0319a551-451e-e811-80fa-00155d6b1004',
      '242f686b-461e-e811-80fa-00155d6b1004',
      '76229b7d-6caf-ea11-8111-00155d6b1004',
      'aad1ec44-f3e6-ea11-80f7-00155d6b5c0b',
      '8b874d5e-f2e6-ea11-80f7-00155d6b5c0b',
    ];

    if (
      String(this.formFields.tipo.value) == '2' ||
      String(this.formFields.tipo.value) == '3'
    ) {
      if (
        categoriasObligatorias.includes(
          String(this.formFields.categoria.value)
        ) &&
        (this.activosSelected.length == 0 &&
          this.activosSelectedNew.length == 0)
      ) {
        this.$snotify.error('Debe ingresar al menos una patente.', {
          timeout: 3000,
        });
        return false;
      }
    }

    this.loadingService.showLoading();
    let response =
      (await crearCaso(
        String(this.formFields.empresa.value),
        jtipo,
        jcategoria,
        this.activosSelected,
        String(this.formFields.descripcion.value),
        String(fileName),
        String(file_b64),
        String(radio1),
        String(this.formFields.nombre.value),
        String(this.formFields.apellido.value),
        String(this.formFields.email.value),
        String(this.formFields.telefono.value),
        String(this.formFields.direccion.value),
        enviarComoComentario,
        String(this.radiosNotif),
        direccion,
        this.activosSelectedNew
      )) || null;
    if (response != null) {
      this.loadingService.hideLoading();
      if (response['CODIGO_RESPUESTA'] == '1') {
        this.$snotify.success(response['MENSAJE_RESPUESTA'], {
          timeout: 5000,
        });
        this.numCasosPatentes = response['numCasosPatentes'];
        this.numCasosSinPatentes = response['numCasosSinPatentes'];
        this.showRespuestaok = true;
        this.formFields.empresa.value = '';
        this.formFields.tipo.value = '';
        this.formFields.categoria.value = '';
        this.formFields.descripcion.value = '';
        this.fileName = '';
        this.file_b64 = '';
        this.formFields.nombre.value = '';
        this.formFields.apellido.value = '';
        this.formFields.email.value = '';
        this.formFields.telefono.value = '';
        this.formFields.direccion.value = '';
        this.activosSelected = [];
        this.activosSelectedNew = [];
        this.formFields.region.value = '';
        this.formFields.comuna.value = '';
        this.formFields.calle.value = '';
        this.formFields.complemento.value = '';
      } else {
        this.$snotify.error(response['MENSAJE_RESPUESTA'], { timeout: 5000 });
      }
    } else {
      this.loadingService.hideLoading();
      this.$snotify.error('Intente nuevamente.', { timeout: 5000 });
    }
  }

  closeModal() {
    this.showRespuestaok = false;
  }
  showTipoContacto: boolean = false;
  responseCrearCaso: any;

  checkTipoContacto(v: boolean) {
    this.showTipoContacto = v;
  }

  onFilePicked(e: any) {
    let self = this;
    var tgt = e.target || window.event.srcElement,
      files = tgt.files;
    this.fileName = files[0].name;
    if (FileReader && files && files.length) {
      this.fileSize = files[0].size;
      var fr = new FileReader();

      fr.onload = function() {
        var base64 = fr.result;
        self.file_b64 = base64;
      };
      fr.readAsDataURL(files[0]);
    }
    this.idkey += 1;
  }

  created() {
    const self = this;
    //this.chequearPermisos();
    Validator.extend('extension', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* El tipo de archivo debe ser ".csv"';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: self.validaExtesion(),
            data: self.validaExtesion()
              ? undefined
              : { message: '* El tipo de archivo debe ser ".csv"' },
          });
        });
      },
    });

    Validator.extend('tamanio', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* El peso del archivo no puede superar los 5 MB'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: self.validaTamano(),
            data: self.validaTamano()
              ? undefined
              : { message: '* El peso del archivo no puede superar los 5 MB' },
          });
        });
      },
    });
  }

  validaExtesion() {
    return true;
    /*if (this.fileName != '') {
      var ext = this.fileName.substring(
        this.fileName.length - 3,
        this.fileName.length
      );
      if (ext == 'csv' || ext == 'CSV') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }*/
  }

  validaTamano() {
    //Valor Anterior 5242880
    //Valor Nuevo 5119612
    if (this.fileName != '') {
      if (this.fileSize > 0 && this.fileSize <= 5119612) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  accionesTotales: PermisoAccion[] = [
    //this.accionVerPdf,
  ];

  crearCaso(
    empresa: string,
    tipo: string,
    categoria: string,
    patente: string[],
    descripcion: string,
    filename: string,
    file: string,
    tipoContacto: string,
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    direccion: string,
    enviarComoComentario: boolean,
    notif: string,
    nuevaDireccion: any[],
    patentesNew: string[]
  ) {
    this.loadingService.showLoading();
    return crearCaso(
      empresa,
      tipo,
      categoria,
      patente,
      descripcion,
      filename,
      file,
      tipoContacto,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      enviarComoComentario,
      notif,
      nuevaDireccion,
      patentesNew
    ).catch(error => {
      this.$snotify.error(
        this.$t('mensajes.mensajesError.consulta', {
          entidad: 'crear caso',
        })
      );
      return;
    });
    //.finally(() => this.loadingService.hideLoading());
  }

  fetchActivos(cliente: string) {
    this.loadingService.showLoading();
    return fetchActivos(cliente)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los activos',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  fetchComunas(cliente: string) {
    this.loadingService.showLoading();
    return fetchComunas(cliente)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las comunas',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async searchDataComunas(region: string) {
    this.listaComunas = (await this.fetchComunas(region)) || [];
    this.formFields.comuna.items = this.listaComunas;
  }

  async searchDataActivos(cliente: string) {
    //this.loadingService.showLoading();
    this.activos = (await this.fetchActivos(cliente)) || [];
    //this.gridApi.setRowData(this.facturaciones);
    //this.loadingService.hideLoading();
    this.formFields.patente.items = this.activos;
  }

  async searchDataDirecciones(cliente: string) {
    //this.loadingService.showLoading();
    this.listaDirecciones = (await this.fetchDirecciones(cliente)) || [];
    //this.gridApi.setRowData(this.facturaciones);
    //this.loadingService.hideLoading();
    this.formFields.direccion.items = this.listaDirecciones;
  }

  fetchDirecciones(cliente: string) {
    this.loadingService.showLoading();
    return fetchDirecciones(cliente)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las direcciones',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  searchDataEmpresa(a: string) {
    this.searchDataActivos(a);
    this.searchDataDirecciones(a);
  }
  searchComunas(a: string) {
    this.searchDataComunas(a);
  }
}
</script>
<style>
.btn-sucursal {
  background-color: #ffe700 !important;
}
.btn-sucursal.btn-nuevadir {
  font-size: 13px;
}
.modalEvidencia,
.modalEnvio {
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}
modalEvidencia,
.modalEnvio ul {
  padding: 24px;
}
.modalEvidencia-content,
.modalEnvio-content {
  background-color: #fafafa;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}
.modalEnvio-content {
  min-width: 300px;
  max-width: 500px;
  width: 30%;
}
.wrap-evidencia .wrap-evidencia-img {
  text-align: center;
  min-height: 480px;
}
.wrap-evidencia .wrap-evidencia-img img {
}
.titleEvidencia {
  width: 70%;
  display: inline-block;
  min-width: 320px;
  min-width: 115px;
}
.buttonCloseEvidencia {
  display: inline-block;
  float: right;
}
</style>
