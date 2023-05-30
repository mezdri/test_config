<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      width="450"
      max-width="450"
      style="top: 20px"
    >
      <v-card>
        <v-toolbar card prominent style="height: 37px;">
          <v-spacer></v-spacer>
          <v-btn icon @click="closeModal()" style="margin-top: -18px;">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-title>
          <v-layout row wrap>
            <v-flex md6>
              <v-menu
                :close-on-content-click="false"
                v-model="menuDatePickerDesde"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                max-width="290px"
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="computedDateFormattedDesde"
                  label="Desde"
                  persistent-hint
                  prepend-icon="event"
                  readonly
                  required
                ></v-text-field>
                <v-date-picker
                  v-model="dateDesde"
                  first-day-of-week="1"
                  locale="es-cl"
                  scrollable
                  @input="menuDatePickerDesde = false"
                ></v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex md6>
              <v-menu
                :close-on-content-click="false"
                v-model="menuDatePickerHasta"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                max-width="290px"
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="computedDateFormattedHasta"
                  label="Hasta"
                  persistent-hint
                  prepend-icon="event"
                  readonly
                  required
                ></v-text-field>
                <v-date-picker
                  v-model="dateHasta"
                  first-day-of-week="1"
                  locale="es-cl"
                  scrollable
                  @input="menuDatePickerHasta = false"
                ></v-date-picker>
              </v-menu>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex md6>
              <v-dialog
                ref="dialog"
                v-model="horaInicioModel"
                :return-value.sync="timeHoraInicio"
                persistent
                lazy
                full-width
                width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="timeHoraInicio"
                  label="Hora Inicio"
                  prepend-icon="access_time"
                  readonly
                ></v-text-field>
                <v-time-picker
                  v-if="horaInicioModel"
                  v-model="timeHoraInicio"
                  full-width
                >
                  <v-spacer></v-spacer>
                  <v-btn flat color="primary" @click="horaInicioModel = false"
                    >Cancelar</v-btn
                  >
                  <v-btn
                    flat
                    color="primary"
                    @click="$refs.dialog.save(timeHoraInicio)"
                    >Aceptar</v-btn
                  >
                </v-time-picker>
              </v-dialog>
            </v-flex>
            <v-flex md6>
              <v-dialog
                ref="dialog2"
                v-model="horaFinModel"
                :return-value.sync="timeHoraFin"
                persistent
                lazy
                full-width
                width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="timeHoraFin"
                  label="Hora Fin"
                  prepend-icon="access_time"
                  readonly
                ></v-text-field>
                <v-time-picker
                  v-if="horaFinModel"
                  v-model="timeHoraFin"
                  full-width
                >
                  <v-spacer></v-spacer>
                  <v-btn flat color="primary" @click="horaFinModel = false"
                    >Cancelar</v-btn
                  >
                  <v-btn
                    flat
                    color="primary"
                    @click="$refs.dialog2.save(timeHoraFin)"
                    >Aceptar</v-btn
                  >
                </v-time-picker>
              </v-dialog>
            </v-flex>
          </v-layout>

          <v-spacer></v-spacer>

          <v-layout row wrap>
            <v-flex md4 style="text-align: center;">
              <v-btn outline>
                <v-icon>skip_previous</v-icon>
              </v-btn>
            </v-flex>
            <v-flex md4 style="text-align: center;">
              <v-btn outline>
                <v-icon>play_circle_outline</v-icon>
              </v-btn>
            </v-flex>
            <v-flex md4 style="text-align: center;">
              <v-btn outline>
                <v-icon>skip_next</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-spacer></v-spacer>
          <v-layout row>
            <v-flex md12>
              <v-btn>Buscar</v-btn>
            </v-flex>
          </v-layout>
        </v-card-title>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';

@Component
export default class RepetirDia extends Vue {
  @Prop({ default: false }) show!: boolean;
  dialog: boolean = false;
  timeHoraInicio: any = null;
  horaInicioModel: any = false;
  timeHoraFin: any = null;
  horaFinModel: any = false;

  dateDesde: string = null;
  dateHasta: string = null;
  dialogRepetirDia: boolean = false;
  menuDatePickerDesde: Boolean = false;
  menuDatePickerHasta: Boolean = false;

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
  }

  get computedDateFormattedDesde() {
    return this.formatDate(this.dateDesde);
  }

  get computedDateFormattedHasta() {
    return this.formatDate(this.dateHasta);
  }

  closeModal() {
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
</script>
