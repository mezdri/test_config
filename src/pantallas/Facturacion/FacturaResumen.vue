<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <v-layout row justify-end>
              <v-flex xs2 sm2 md2 align-end>
                <p>Total Neto</p>
              </v-flex>
              <v-flex xs2 sm2 md2>
                <p>$ {{ facturaSeleccionada.totalNeto.toLocaleString() }}</p>
              </v-flex>
            </v-layout>
            <v-layout row justify-end>
              <v-flex xs2 sm2 md2>
                <p>IVA 19%</p>
              </v-flex>
              <v-flex xs2 sm2 md2>
                <p>$ {{ facturaSeleccionada.totalIva.toLocaleString() }}</p>
              </v-flex>
            </v-layout>
            <v-layout row justify-end>
              <v-flex xs2 sm2 md2>
                <p>Total</p>
              </v-flex>
              <v-flex xs2 sm2 md2>
                <p>$ {{ facturaSeleccionada.total.toLocaleString() }}</p>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Factura } from '@/pantallas/Facturacion/fetchFacturaciones';

@Component({})
export default class FacturaResumen extends Vue {
  @Prop() facturaSeleccionada: Factura;
}
</script>
<style scoped>
p {
  font-family: 'Asap regular', Arial, Helvetica, sans-serif;
  margin: 0px;
  text-align: right;
  color: rgba(110, 110, 110, 0.8);
  font-weight: 500;
}
</style>
