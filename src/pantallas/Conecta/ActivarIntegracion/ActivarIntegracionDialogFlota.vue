<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" scrollable max-width="600px">
      <v-card>
        <v-card-title>
          <h3 class="headline mb-0">
            Activar/Desactivar Integración de la Flota
          </h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-title>Código de la flota: {{ item.cod_flota }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 500px;">
          <v-container fluid>
            <v-layout column>
              <v-flex xs12>
                <v-layout row xs12 wrap>
                  <v-flex xs12 md12>
                    <v-switch
                      v-model="switch1"
                      :label="labelSwitch"
                      @change="onChangeSwitch"
                    ></v-switch>
                  </v-flex>
                  <v-flex xs12 md6>
                    <v-checkbox
                      v-if="integrationConfig.avl_chile"
                      label="avl_chile"
                      v-model="item.avl_chile"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.wisetrack_insertarposicion"
                      label="wisetrack_insertarposicion"
                      v-model="item.wisetrack_insertarposicion"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.cmp_btrack"
                      label="cmp_btrack"
                      v-model="item.cmp_btrack"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.log_solutions"
                      label="log_solutions"
                      v-model="item.log_solutions"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.int_samtech_cim"
                      label="int_samtech_cim"
                      v-model="item.int_samtech_cim"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.beetrack"
                      label="beetrack"
                      v-model="item.beetrack"
                    ></v-checkbox>
                  </v-flex>
                  <v-flex xs12 md6>
                    <v-checkbox
                      v-if="integrationConfig.owl"
                      label="owl"
                      v-model="item.owl"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.heligrafics"
                      label="heligrafics"
                      v-model="item.heligrafics"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.qanalytics"
                      label="qanalytics"
                      v-model="item.qanalytics"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.samtech_dch"
                      label="samtech_dch"
                      v-model="item.samtech_dch"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.int_codelco"
                      label="int_codelco"
                      v-model="item.int_codelco"
                    ></v-checkbox>
                    <v-checkbox
                      v-if="integrationConfig.int_camion_go"
                      label="int_camion_go"
                      v-model="item.int_camion_go"
                    ></v-checkbox>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="$emit('close', false)"
            >Cerrar</v-btn
          >
          <v-btn
            color="success darken-1"
            @click="
              $emit('close', false);
              $emit('change', item);
            "
            >Guardar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  name: 'ActivarIntegracionDialogFlota',
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    item: Object,
  },
  data() {
    return {
      switch1: false,
      labelSwitch: 'Activar todo',
    };
  },
  methods: {
    onChangeSwitch() {
      if (this.switch1 === true) {
        this.labelSwitch = 'Desactivar todo';
        for (const i in this.item) {
          if (
            i !== 'cod_vehiculo' &&
            i !== 'cod_flota' &&
            i !== 'patente_vehiculo'
          ) {
            this.item[i] = true;
          }
        }
      } else {
        this.labelSwitch = 'Activar todo';
        for (const i in this.item) {
          if (
            i !== 'cod_vehiculo' &&
            i !== 'cod_flota' &&
            i !== 'patente_vehiculo'
          ) {
            this.item[i] = false;
          }
        }
      }
    },
  },
  computed: {
    integrationConfig() {
      return this.$store.getters.getIntegrationConfig;
    },
  },
};
</script>
