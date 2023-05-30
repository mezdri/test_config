<template>
  <div align="center" id="gridDetalle">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <v-layout row wrap>
              <v-flex md12>
                <table id="tablaProducto" aria-hidden="true">
                  <thead>
                    <tr>
                      <th id="thNombre" class="text-left">
                        Nombre de Producto
                      </th>
                      <th id="thPrecio" class="text-left">
                        Precio de la Unidad
                      </th>
                      <th id="thCantidad" class="text-left">Cantidad</th>
                      <th id="thDescuento" class="text-left">Descuento</th>
                      <th id="thValorNeto" class="text-left">Valor Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in facturaSeleccionada" :key="item.name">
                      <td>{{ item.NombreItem }}</td>
                      <td class="tdAlign">
                        $ {{ item.PrecioItem.toLocaleString() }}
                      </td>
                      <td class="tdAlign">{{ item.CantidadItem }}</td>
                      <td class="tdAlign" v-if="item.Descuento === 'null'">
                        $ {{ item.Descuento }}
                      </td>
                      <td class="tdAlign" v-else>$ 0</td>
                      <td class="tdAlign">
                        $ {{ item.MontoItem.toLocaleString() }}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
import { DetalleFactura } from '@/pantallas/Facturacion/fetchFacturaciones';

@Component({
  components: {},
})
export default class FacturaTable extends Vue {
  @Prop() facturaSeleccionada: DetalleFactura;
}
</script>
<style scoped>
#tablaProducto {
  font-family: 'Asap regular', Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#tablaProducto td,
#tablaProducto th {
  border: 1px solid #e9ebee;
  padding: 8px;
  color: rgb(110, 110, 110, 0.8);
  font-weight: 500;
}

#tablaProducto tr:nth-child(even) {
  background-color: #f2f2f2;
}

#tablaProducto tr:hover {
  background-color: #ddd;
}

#tablaProducto th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #949494;
  color: white;
}
.tdAlign {
  text-align: right;
}
</style>
