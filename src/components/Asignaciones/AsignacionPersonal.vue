<template>
  <v-container v-show="show">
    <v-layout row wrap>
      <div align="left">
        <v-flex md12>
          <h2 class="h2_title">Selección de transportista</h2>
        </v-flex>
      </div>
    </v-layout>
    <v-divider></v-divider>
    <br />
    <br />
    <form @submit.prevent="submit">
      <v-layout>
        <v-flex xs12 sm12 md9>
          <!-- v-model="datosSertec.comentario"
          :error-messages="errors.collect('comentario')" -->
          <v-container v-show="!showNuevoTransportista">
            <v-autocomplete
              v-show="!showNuevoTransportista"
              :menu-props="{ closeOnContentClick: true }"
              name="transportistaSeleccionado"
              :disabled="showNuevoTransportista"
              :error-messages="errors.collect('transportistaSeleccionado')"
              data-vv-name="transportistaSeleccionado"
              v-validate="'required'"
              :search-input.sync="search"
              label="Transportista"
              :items="transportistas"
              item-text="desc"
              item-value="cod"
              @change="changeFiltro()"
              v-model="transportistaSeleccionado"
            >
              <template v-slot:no-data>
                <v-layout>
                  <div class="ma-3">
                    {{ search }}
                  </div>
                  <v-btn
                    color="#27488E"
                    dark
                    type="submit"
                    :disabled="invalid"
                    @click="crearTransportista"
                  >
                    crear
                  </v-btn>
                </v-layout>
              </template>
            </v-autocomplete>
          </v-container>
          <v-container grid-list-xs v-show="showNuevoTransportista">
            <v-text-field
              :disabled="!showNuevoTransportista"
              v-validate="'required|rut|rutFormato|max:10'"
              :counter="10"
              :error-messages="errors.collect('rutTransportista')"
              data-vv-name="rutTransportista"
              rows="4"
              label="Rut del Transportista"
              v-model="rutTransportista"
            ></v-text-field>
            <v-text-field
              :error-messages="errors.collect('nombreTransportista')"
              v-model="nombreTransportista"
              data-vv-name="nombreTransportista"
              :disabled="!showNuevoTransportista"
              v-validate="{
                rules: {
                  required: true,
                },
              }"
              rows="4"
              label="Nombre del Transportista"
              name="comentario"
              required
            ></v-text-field>
          </v-container>
        </v-flex>
        <v-checkbox
          :label="`Asignar mandante`"
          v-model="addMandante"
        ></v-checkbox>
      </v-layout>

      <v-layout v-show="addMandante">
        <v-flex xs12 sm12 md9>
          <!-- <v-text-field
            :disabled="!addMandante"
            v-validate="{
              rules: {
                required: true,
                rut: true,
              },
            }"
            :counter="10"
            :error-messages="errors.collect('rutMandante')"
            data-vv-name="rutMandante"
            rows="4"
            label="Rut del Mandante"
            v-model="rutMandante"
          ></v-text-field>
          <v-text-field
            :disabled="!addMandante"
            v-model="nombreMandante"
            name="nombreMandante"
            v-validate="'required|alpha_spaces'"
            data-vv-name="nombreMandante"
            label="Nombre Mandante"
            :error-messages="errors.collect('nombreMandante')"
          ></v-text-field> -->
          <v-autocomplete
            :disabled="!addMandante"
            label="Mandante"
            name="mandante"
            v-model="modelMandante"
            data-vv-name="mandante"
            v-validate="'required'"
            :items="mandantes"
            item-text="desc"
            item-value="cod"
            :error-messages="errors.collect('mandante')"
            @change="changeFiltro()"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm12 md3> </v-flex>
      </v-layout>
      <v-btn color="#27488E" dark type="submit" :disabled="invalid">
        <v-icon left> check </v-icon>
        Asignar
      </v-btn>
      <v-btn
        v-show="showNuevoTransportista"
        color="#27488E"
        dark
        outline
        @click="cancelarCreacion"
      >
        cancelar creación
      </v-btn>
      <div style="max-height: 4px">
        <v-progress-linear
          indeterminate
          color="primary"
          v-show="cargando"
        ></v-progress-linear>
      </div>
    </form>
    <app-confirmacion
      :show="showConfirmacion"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="
        'Se han seleccionado registros asociados actualmente a un transportista. ¿Desea reasignar estos registros al transportista seleccionado o desea mantener el transportista asignado? '
      "
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="'Reasignar'"
      :textoBtnNo="'Mantener'"
    ></app-confirmacion>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { asociacionEventBus } from '@/setup';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import HandleErrors from '@/config/handleErrors';
import store from '@/store';
import ValidaRut from '@/config/validaRut';
import { Validator } from 'vee-validate';
import config from '@/config/index';

import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: {
    ValidationObserver,
    ValidationProvider,
    'app-confirmacion': Confirmation,
  },
})
export default class AsignacionPersonal extends Vue {
  show = false;
  cargando = false;
  invalid = false;
  showConfirmacion = false;
  $snotify: any;
  addMandante = false;
  plataforma: number = null;
  transportistas: any[] = [];
  mandantes: any[] = [];
  vehiculos: any[] = [];
  vehiculosNoAsignados: any[] = [];
  vehiculosAsignados: any[] = [];
  valoresAsociados: any[] = [];
  dictionaryFormErrors: any = {};
  transportistaSeleccionado: any = null;
  mandanteSeleccionado: any = null;
  body: any = {};
  bodyAsignado: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  model: any = null;
  modelMandante: any = null;
  objetosVehiculoAsignado: any = [];
  bodyDesasociar: any = [];
  vr: ValidaRut = new ValidaRut();
  rutTransportista: string = '';
  nombreTransportista: string = '';
  search: string = '';
  showNuevoTransportista = false;

  created() {
    this.registrarValidadores();
  }

  reset() {
    this.model = null;
    this.addMandante = false;
    this.showNuevoTransportista = false;
    this.show = false;
    this.modelMandante = null;
    this.transportistas = [];
    this.mandantes = [];
    this.rutTransportista = '';
    this.nombreTransportista = '';
  }
  crearTransportista() {
    console.log('crear transportista');
    console.log(this.search);
    this.nombreTransportista = this.search;
    this.showNuevoTransportista = true;
    this.transportistaSeleccionado = null;
    this.rutTransportista = null;
  }
  cancelarCreacion() {
    this.modelMandante = null;
    this.transportistaSeleccionado = null;
    this.rutTransportista = null;
    this.mandanteSeleccionado = null;
    this.showNuevoTransportista = false;
  }
  private registrarValidadores() {
    const self = this;
    const validarRut = this.vr;

    Validator.extend('rutFormato', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: validarRut.validaFormatoRut(value),
            data: validarRut.validaFormatoRut(value)
              ? undefined
              : { message: '* Rut inválido' },
          });
        });
      },
    });

    Validator.extend('rut', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: validarRut.Rut(value),
            data: validarRut.Rut(value)
              ? undefined
              : { message: '* Rut inválido' },
          });
        });
      },
    });
  }
  confirmCallbackConfirm(val: boolean) {
    val ? this.desasociar() : this.asociarNewBody();
    //vamos a entender que al desasociar tenemos que mantener el select all
  }
  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        rutTransportista: {
          required: config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        nombreTransportista: {
          required: config.errorMensajes.textoRequerido,
        },
        transportistaSeleccionado: {
          required: config.errorMensajes.textoRequerido,
        },
        rutMandante: {
          required: config.errorMensajes.textoRequerido,
        },
        mandante: {
          required: config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    asociacionEventBus.$on('resetBusqueda', () => {
      this.reset();
    });
    asociacionEventBus.$on('resetPersonal', () => {
      this.show = false;
    });

    asociacionEventBus.$on(
      'seleccionPlataformaAsignacionVehiculo',
      (
        body: any,
        valoresAsociados: any,
        reset: boolean,
        vehiculos: any[],
        objetosVehiculoAsignado: any[]
      ) => {
        this.showConfirmacion = false;
        this.vehiculosAsignados = [];
        this.vehiculos = [];
        this.vehiculosNoAsignados = [];
        this.objetosVehiculoAsignado = objetosVehiculoAsignado;
        valoresAsociados.map((value: any) => {
          this.vehiculosAsignados = [
            ...this.vehiculosAsignados,
            value.cod_vehiculo,
          ];
        });
        this.vehiculosNoAsignados = this.vehiculos.filter(
          value => !this.vehiculosAsignados.includes(value)
        );

        reset
          ? ((this.body = {}),
            (this.show = false),
            (this.vehiculosAsignados = []),
            (this.vehiculos = []),
            (this.vehiculosNoAsignados = []),
            (this.invalid = false),
            (this.cargando = false))
          : ((this.body = body),
            (this.valoresAsociados = valoresAsociados),
            (this.vehiculos = vehiculos),
            (this.show = true));
      }
    );
    asociacionEventBus.$on(
      'setTrnasportistas',
      (transportistas: any, mandantes: any) => {
        this.transportistas = transportistas;
        this.mandantes = mandantes;
      }
    );
  }
  async fetchDashboard(body: any, path: any) {
    let response = await fetchDashboard(body, path);
    return response.data;
  }
  async submit() {
    let validator = await this.$validator.validateAll();
    if (validator) {
      this.rutTransportista = this.transportistaSeleccionado
        ? this.transportistaSeleccionado
        : this.rutTransportista;
      console.log(this.rutTransportista);
      this.invalid = true;
      this.cargando = true;
      this.vehiculosNoAsignados = this.vehiculos.filter(
        value => !this.vehiculosAsignados.includes(value)
      );
      this.valoresAsociados.length
        ? (this.showConfirmacion = true)
        : this.asociar();
    }
  }
  asociarNewBody() {
    // if(this.getBodyAsociado(this.valoresAsociados)){
    //   // this.desasociar();
    //   console.log('derfinitivamente tiene que desasociar');
    // }else{

    this.body.cod_vehiculos = this.vehiculosNoAsignados;
    if (this.body.check_all) this.body.check_all = 'NO';
    this.asociar();
    // }
  }
  async asociar() {
    let asignaciones: any = [];

    let body = {
      ...this.body,
      transportista: this.rutTransportista,
      nombre_transp: this.nombreTransportista,
    };
    this.addMandante
      ? (body = {
          ...body,
          check_mandante: 'NO',
          mandante: this.mandanteSeleccionado,
          user_id: store.state.userId,
        })
      : (body = {
          ...body,
          check_mandante: 'SI',
          mandante: this.rutTransportista,
          user_id: store.state.userId,
        });
    let path = 'mantenedor_transp_mandante/asociar';
    let data = await this.fetchDashboard(body, path);
    let value = data.CODIGO_RESPUESTA;
    console.log('resultado', data);

    value == 1
      ? (asociacionEventBus.$emit('asignacionReady', asignaciones),
        (this.invalid = false),
        (this.cargando = false),
        (this.showConfirmacion = false))
      : this.$snotify.error(this.$t(data.MENSAJE_RESPUESTA)),
      (this.showConfirmacion = false),
      (this.invalid = false),
      (this.cargando = false);
  }
  async desasociar() {
    if (!this.esAsocidadoFiltro(this.valoresAsociados))
      this.bodyDesasociar = this.getBody();

    let result;
    let promises: any = [];
    let resultado: any = [];
    let data: any;
    let url = 'mantenedor_transp_mandante/desasociar';
    if (this.bodyDesasociar.length == 1) {
      result = await fetchDashboard(this.bodyDesasociar[0], url);
      data = await result.data;

      data
        ? data.CODIGO_RESPUESTA == 1
          ? (this.$snotify.success('Desasociación exitosa'), this.asociar())
          : this.$snotify.error(data.CODIGO_RESPUESTA)
        : this.$snotify.error('Error en la consulta');
    } else {
      await this.bodyDesasociar.map(async (body: any) => {
        promises.push(fetchDashboard(body, url));
      });
      data = await Promise.all(promises);
      resultado = await data[0].data;
      resultado
        ? resultado.CODIGO_RESPUESTA == 1
          ? (this.$snotify.success('Desasociación exitosa'), this.asociar())
          : (this.$snotify.error(resultado.MENSAJE_RESPUESTA),
            (this.showConfirmacion = false))
        : (this.$snotify.error('Error en la consulta'),
          (this.showConfirmacion = false));
    }
  }
  esAsocidadoFiltro(result: any) {
    let resultado = [];
    console.log(
      'validar si el resultado es una asociacion de filtro con id asoc',
      result[0].id_asoc
    );
    resultado = result.filter(
      (value: any) => value.id_asoc == result[0].id_asoc
    );
    console.log(
      'este es el largo de los id asoc encontrados iguales',
      resultado.length
    );
    if (resultado.length > 1) {
      this.bodyDesasociar = this.getBodyAsociado(result[0]);
      console.log('debe desasociar');
      return true;
    }
    console.log('no debe desasociar');
    return false;
  }
  getBodyAsociado(data: any) {
    let bodys: any[] = [];
    bodys = [
      {
        plataforma: this.body.plataforma,
        id_asoc: data.id_asoc,
        user_id: store.state.userId,
      },
    ];
    console.log(bodys);
    return bodys;
  }
  getBody() {
    let bodys: any[] = [];

    this.objetosVehiculoAsignado.map((row: any) => {
      bodys = [
        ...bodys,
        {
          plataforma: this.body.plataforma,
          id_asoc: row.id_asoc,
          user_id: store.state.userId,
        },
      ];
    });

    return bodys;
  }
  changeFiltro() {
    this.mandanteSeleccionado = this.modelMandante ? this.modelMandante : '';
    if (this.model) {
      this.invalid = false;
    }
  }
}
</script>

<style></style>
