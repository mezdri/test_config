<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-10">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <div class="boton_crear" style="">
              <v-btn
                v-if="formFields.serienumero.value !== '(Sin datos)'"
                @click="editar"
                class="icon"
                style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;

                margin: 0 0 0 auto;"
              >
                <span style="color: white;" class="color-blanco">Guardar</span>
              </v-btn>
            </div>
            <FormFieldsContainer titulo="Equipo Activado">
              <slot name="prependInformacionGeneral" />
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serienumero.label"
                  v-model="formFields.serienumero.value"
                  :disabled="modoVer"
                />
              </v-flex>

              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.tipoeqname.label"
                  v-model="formFields.tipoeqname.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.epc.label"
                  v-model="formFields.epc.value"
                  :disabled="modoVer"
                />
              </v-flex>

              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivafecha_alta.label"
                  v-model="formFields.serieactivafecha_alta.value"
                  :disabled="modoVer"
                />
              </v-flex>

              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivaes_arriendo.label"
                  v-model="formFields.serieactivaes_arriendo.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.asigrequerimiento.label"
                  v-model="formFields.asigrequerimiento.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.asigcrm_rutcli.label"
                  v-model="formFields.asigcrm_rutcli.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md>
                <v-text-field
                  :label="formFields.asigcrm_cliente.label"
                  v-model="formFields.asigcrm_cliente.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.asigcrm_flota.label"
                  v-model="formFields.asigcrm_flota.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.plataforma.label"
                  v-model="formFields.plataforma.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-checkbox
                  v-if="formFields.serieactivaplata_ingresada.value == 'S'"
                  :label="formFields.serieactivaplata_ingresada.label"
                  v-model="formFields.serieactivaplata_ingresada.value"
                  true-value="S"
                  false-value="N"
                />
                <v-checkbox
                  v-if="formFields.serieactivaplata_ingresada.value == 'N'"
                  :label="formFields.serieactivaplata_ingresada.label"
                  v-model="formFields.serieactivaplata_ingresada.value"
                  true-value="S"
                  false-value="N"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivaplata_fecha.label"
                  v-model="formFields.serieactivaplata_fecha.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivaid_dispositivo.label"
                  v-model="formFields.serieactivaid_dispositivo.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivaavl.label"
                  v-model="formFields.serieactivaavl.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivafecha_instala.label"
                  v-model="formFields.serieactivafecha_instala.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.patente_vehiculo.label"
                  v-model="formFields.patente_vehiculo.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivafecha_baja.label"
                  v-model="formFields.serieactivafecha_baja.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.serieactivaobs.label"
                  v-model="formFields.serieactivaobs.value"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
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

@Component({
  components: {
    TextField,
    FormFieldsContainer,
    MantenedorGrid,
  },
})
export default class EquipoActivoForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;
  @Prop({ default: null }) serieactivanroSeleccionado: any;
  @Prop({ default: null }) serieNumeroSeleccionado: any;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  devonumero: any = '';

  formFields: FormFieldDefMap = {
    requerimiento: {
      label: 'Requermiento',
      id: '',
      value: '',
    },
    serienumero: {
      label: 'Serie Número',
      id: '',
      value: '',
    },
    serieactivafecha_alta: {
      label: 'Fecha Preparación',
      id: '',
      value: '',
    },
    serieactivanro: {
      label: 'Equipo Tipo',
      id: '',
      value: '',
    },
    tipoeqname: {
      label: 'Tipo de Equipo',
      id: '',
      value: '',
    },
    serieactivaes_arriendo: {
      label: 'Modalidad',
      id: '',
      value: '',
    },
    asigrequerimiento: {
      label: 'Requerimiento',
      id: '',
      value: '',
    },
    asigcrm_rutcli: {
      label: 'Rut Cliente',
      id: '',
      value: '',
    },
    asigcrm_cliente: {
      label: 'Cliente',
      id: '',
      value: '',
    },
    asigcrm_flota: {
      label: 'Flota',
      id: '',
      value: '',
    },
    patente_vehiculo: {
      label: 'Patente',
      id: '',
      value: '',
    },
    plataforma: {
      label: 'Plataforma',
      id: '',
      value: '',
    },
    serieactivaavl: {
      label: 'AVL',
      id: '',
      value: '',
    },
    vehiculo_patente: {
      label: 'Vehículo Patente',
      id: '',
      value: '',
    },
    serieactivafecha_baja: {
      label: 'Fecha Desinstalación',
      id: '',
      value: '',
    },
    serieactivafecha_instala: {
      label: 'Fecha de Instalación',
      id: '',
      value: '',
    },
    serieactivaid_dispositivo: {
      label: 'ID de Dispositivo',
      id: '',
      value: '',
    },
    serieactivaobs: {
      label: 'Observación de Desinstalación  ',
      id: '',
      value: '',
    },
    serieactivaplata_fecha: {
      label: 'Fecha en Plataforma',
      id: '',
      value: '',
    },
    serieactivaplata_ingresada: {
      label: 'Activo en Plataforma',
      id: '',
      value: '',
    },
    tipoeqid: {
      label: 'Equipo Tipo',
      id: '',
      value: '',
    },
    epc: {
      label: 'EPC',
      id: '',
      value: '',
    },
  };
  async getSerie_by_id(serieNumeroSeleccionado: any) {
    let self = this;
    this.loadingService.showLoading();

    return fetchReportesSerie(
      {
        serienumero: serieNumeroSeleccionado,
      },
      'conecta_inventario_sim/equipo'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          if (data.data.data.STATUS === 'SIN_DATA') {
            self.formFields.serienumero.value = '(Sin datos)';
            self.formFields.tipoeqid.value = '(Sin datos)';
            self.formFields.serieactivanro.value = '(Sin datos)';
            self.formFields.tipoeqname.value = '(Sin datos)';
            self.formFields.serieactivafecha_alta.value = '(Sin datos)';
            self.formFields.serieactivaes_arriendo.value = '(Sin datos)';
            self.formFields.asigrequerimiento.value = '(Sin datos)';
            self.formFields.asigcrm_rutcli.value = '(Sin datos)';
            self.formFields.asigcrm_cliente.value = '(Sin datos)';
            self.formFields.asigcrm_flota.value = '(Sin datos)';
            self.formFields.patente_vehiculo.value = '(Sin datos)';
            self.formFields.plataforma.value = '(Sin datos)';
            self.formFields.serieactivaavl.value = '(Sin datos)';
            self.formFields.serieactivafecha_baja.value = '(Sin datos)';
            self.formFields.serieactivafecha_instala.value = '(Sin datos)';
            self.formFields.serieactivaid_dispositivo.value = '(Sin datos)';
            self.formFields.serieactivaobs.value = '(Sin datos)';
            self.formFields.serieactivaplata_fecha.value = '(Sin datos)';
            self.formFields.serieactivaplata_ingresada.value = '(Sin datos)';
          } else if (data.data.data.serienumero.length !== 0) {
            self.formFields.serienumero.value = data.data.data.serienumero;
          } else {
            self.formFields.serienumero.value = '(Sin datos)';
          }
          if (data.data.data.tipoeqid.length !== 0) {
            self.formFields.tipoeqid.value = data.data.data.tipoeqid;
          } else {
            self.formFields.tipoeqid.value = '(Sin datos)';
          }
          if (data.data.data.serieactivanro.length !== 0) {
            self.formFields.serieactivanro.value =
              data.data.data.serieactivanro;
          } else {
            self.formFields.serieactivanro.value = '(Sin datos)';
          }
          if (data.data.data.tipoeqname.length !== 0) {
            self.formFields.tipoeqname.value = data.data.data.tipoeqname;
          } else {
            self.formFields.tipoeqname.value = '(Sin datos)';
          }

          if (data.data.data.serieactivafecha_alta.length !== 0) {
            self.formFields.serieactivafecha_alta.value =
              data.data.data.serieactivafecha_alta;
          } else {
            self.formFields.serieactivafecha_alta.value = '(Sin datos)';
          }
          if (data.data.data.modalidad.length !== 0) {
            self.formFields.serieactivaes_arriendo.value =
              data.data.data.modalidad;
          } else {
            self.formFields.serieactivaes_arriendo.value = '(Sin datos)';
          }
          if (data.data.data.asigrequerimiento.length !== 0) {
            self.formFields.asigrequerimiento.value =
              data.data.data.asigrequerimiento;
          } else {
            self.formFields.asigrequerimiento.value = '(Sin datos)';
          }
          if (data.data.data.asigcrm_rutcli.length !== 0) {
            self.formFields.asigcrm_rutcli.value =
              data.data.data.asigcrm_rutcli;
          } else {
            self.formFields.asigcrm_rutcli.value = '(Sin datos)';
          }
          if (data.data.data.asigcrm_cliente.length !== 0) {
            self.formFields.asigcrm_cliente.value =
              data.data.data.asigcrm_cliente;
          } else {
            self.formFields.asigcrm_cliente.value = '(Sin datos)';
          }
          if (data.data.data.asigcrm_flota.length !== 0) {
            self.formFields.asigcrm_flota.value = data.data.data.asigcrm_flota;
          } else {
            self.formFields.asigcrm_flota.value = '(Sin datos)';
          }
          if (data.data.data.patente_vehiculo.length !== 0) {
            self.formFields.patente_vehiculo.value =
              data.data.data.patente_vehiculo;
          } else {
            self.formFields.patente_vehiculo.value = '(Sin datos)';
          }
          if (data.data.data.plataforma.length !== 0) {
            self.formFields.plataforma.value = data.data.data.plataforma;
          } else {
            self.formFields.plataforma.value = '(Sin datos)';
          }
          if (data.data.data.serieactivaavl.length !== 0) {
            self.formFields.serieactivaavl.value =
              data.data.data.serieactivaavl;
          } else {
            self.formFields.serieactivaavl.value = '(Sin datos)';
          }
          if (data.data.data.serieactivafecha_baja.length !== 0) {
            self.formFields.serieactivafecha_baja.value =
              data.data.data.serieactivafecha_baja;
          } else {
            self.formFields.serieactivafecha_baja.value = '(Sin datos)';
          }
          if (data.data.data.serieactivafecha_instala.length !== 0) {
            self.formFields.serieactivafecha_instala.value =
              data.data.data.serieactivafecha_instala;
          } else {
            self.formFields.serieactivafecha_instala.value = '(Sin datos)';
          }
          if (data.data.data.serieactivaid_dispositivo.length !== 0) {
            self.formFields.serieactivaid_dispositivo.value =
              data.data.data.serieactivaid_dispositivo;
          } else {
            self.formFields.serieactivaid_dispositivo.value = '(Sin datos)';
          }
          if (data.data.data.serieactivaobs.length !== 0) {
            self.formFields.serieactivaobs.value =
              data.data.data.serieactivaobs;
          } else {
            self.formFields.serieactivaobs.value = '(Sin datos)';
          }
          if (data.data.data.serieactivaplata_fecha.length !== 0) {
            self.formFields.serieactivaplata_fecha.value =
              data.data.data.serieactivaplata_fecha;
          } else {
            self.formFields.serieactivaplata_fecha.value = '(Sin datos)';
          }
          if (data.data.data.serieactivaplata_ingresada.length !== 0) {
            self.formFields.serieactivaplata_ingresada.value =
              data.data.data.serieactivaplata_ingresada;
          } else {
            self.formFields.serieactivaplata_ingresada.value = '(Sin datos)';
          }
          if (data.data.data.serieactivaepc.length !== 0) {
            self.formFields.epc.value = data.data.data.serieactivaepc;
          } else {
            self.formFields.epc.value = '(Sin datos)';
          }
        } else {
          return;
        }
      })
      .catch((error: any) => {
        return;
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  mounted() {
    this.getSerie_by_id(this.serieNumeroSeleccionado);
  }
  async editar() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        serieactivaplata_ingresada:
          self.formFields.serieactivaplata_ingresada.value,
        serienumero: self.formFields.serienumero.value,
        tipoeqid: self.formFields.tipoeqid.value,
        serieactivanro: self.formFields.serieactivanro.value,
        userid: JSON.parse(localStorage.getItem('user')).id,
        userrut: JSON.parse(localStorage.getItem('user')).rutClienteDefecto,
      },
      'conecta_inventario_sim/actualizar_equipo'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.formFields.serieactivaplata_ingresada.value =
            data.data.data.serieactivaplata_ingresada;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.success('Estado actualizado', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
}
</script>
<style scoped>
.color-blanco {
  color: white;
}
</style>
