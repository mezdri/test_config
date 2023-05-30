<template>
  <div>
    <v-container grid-list-xl text-xs-center>
      <v-layout row wrap>
        <v-flex xs12 sm5 md3>
          <v-switch
            v-model="switch1"
            :label="labelSwitch"
            @change="onChangeSwitch"
          ></v-switch>
        </v-flex>
        <v-flex xs12 sm5 md3 offset-xs0 offset-lg6>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="dataTable"
      :pagination.sync="pagination"
      item-key="cod_vehiculo"
      class="elevation-1"
      :no-data-text="'Sin registros'"
      :rows-per-page-items="rowsPerPageItems"
      :search="search"
    >
      <template v-slot:headers="props">
        <tr>
          <th
            v-for="header in props.headers"
            :key="header.text"
            :class="[
              'column sortable',
              pagination.descending ? 'desc' : 'asc',
              header.value === pagination.sortBy ? 'active' : '',
            ]"
            @click="changeSort(header.value)"
          >
            <v-icon small>arrow_upward</v-icon>
            {{ header.text }}
          </th>
        </tr>
      </template>
      <template v-slot:items="props" class="tableContainer">
        <tr :active="props.selected" @click="props.selected = !props.selected">
          <td class="text-xs-center">{{ props.item.cod_vehiculo }}</td>
          <td class="text-xs-center">{{ props.item.nom_flota }}</td>
          <td class="text-xs-center">{{ props.item.patente_vehiculo }}</td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.avl_chile }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.wisetrack_insertarposicion }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.cmp_btrack }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.log_solutions }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.int_samtech_cim }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.beetrack }}
          </td>
          <td v-if="switch1" class="text-xs-center">{{ props.item.owl }}</td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.heligrafics }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.qanalytics }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.samtech_dch }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.int_codelco }}
          </td>
          <td v-if="switch1" class="text-xs-center">
            {{ props.item.int_camion_go }}
          </td>
          <td class="text-xs-center actions">
            <v-btn
              icon
              flat
              color="primary"
              title="Modificar vehículo"
              @click="showDialog(props.item)"
            >
              <v-icon>directions_car</v-icon>
            </v-btn>
            <v-btn
              icon
              flat
              color="primary"
              title="Modificar Flota completa"
              @click="showDialogFlota(props.item)"
            >
              <v-icon>groups</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template v-slot:no-data>
        <div class="center">
          {{ noDataMessage }}
          <!-- No se han encontrado resultados para la búsqueda. -->
        </div>
      </template>
    </v-data-table>
    <activar-integracion-dialog
      :dialog="dialog"
      :item="items"
      @change="onDialogChange($event)"
      @close="dialogClose($event)"
    />
    <activar-integracion-dialog-flota
      :dialog="dialogFlota"
      :item="items"
      @change="onDialogFlotaChange($event)"
      @close="dialogFlotaClose($event)"
    />
  </div>
</template>

<script>
import ActivarIntegracionDialog from './ActivarIntegracionDialog.vue';
import ActivarIntegracionDialogFlota from './ActivarIntegracionDialogFlota.vue';

export default {
  // TODO: refactorizar y usar TS
  name: 'IntegrationTable',
  components: {
    ActivarIntegracionDialog,
    ActivarIntegracionDialogFlota,
  },
  props: {
    headers: {
      type: Array,
      default() {
        return [];
      },
    },
    dataTable: {
      type: Array,
      default() {
        return [];
      },
    },
    noDataMessage: {
      type: String,
      default() {
        return 'No se han encontrado resultados para la búsqueda.';
      },
    },
  },
  data() {
    return {
      search: '',
      rowsPerPageItems: [
        10,
        25,
        50,
        100,
        { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 },
      ],
      pagination: {
        sortBy: 'cod_vehiculo',
        page: 0,
        rowsPerPage: 25,
        totalItems: this.totalItems,
      },
      selected: [],
      dialog: false,
      dialogFlota: false,
      items: {},
      switch1: false,
      labelSwitch: 'Mostrar integraciones',
    };
  },
  methods: {
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.dataTable.slice();
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    onChange(item) {
      this.$emit('change', item);
    },
    allYes(items) {
      delete items.rownum;
      for (let item in items) {
        if (
          item != 'cod_vehiculo' &&
          item != 'cod_flota' &&
          item != 'patente_vehiculo'
        ) {
          items[item] = 'SI';
        }
      }
      this.$emit('change', items);
    },
    allNo(items) {
      delete items.rownum;
      for (let item in items) {
        if (
          item != 'cod_vehiculo' &&
          item != 'cod_flota' &&
          item != 'patente_vehiculo'
        ) {
          items[item] = 'NO';
        }
      }
      this.$emit('change', items);
    },
    showDialog(item) {
      this.items = item;
      for (const i in this.items) {
        if (
          i !== 'cod_vehiculo' &&
          i !== 'cod_flota' &&
          i !== 'nom_flota' &&
          i !== 'patente_vehiculo'
        ) {
          this.items[i] = this.items[i] === 'SI' ? true : false;
        }
      }
      this.dialog = true;
    },
    showDialogFlota(item) {
      this.items = item;
      for (const i in this.items) {
        if (
          i !== 'cod_vehiculo' &&
          i !== 'cod_flota' &&
          i !== 'nom_flota' &&
          i !== 'patente_vehiculo'
        ) {
          this.items[i] = this.items[i] === 'SI' ? true : false;
        }
      }
      this.dialogFlota = true;
    },
    onDialogChange(e) {
      delete e.rownum;
      this.items = e;
      for (const i in this.items) {
        if (
          i !== 'cod_vehiculo' &&
          i !== 'cod_flota' &&
          i !== 'patente_vehiculo'
        ) {
          this.items[i] = this.items[i] === true ? 'SI' : 'NO';
        }
      }
      this.$emit('change', this.items);
    },
    onDialogFlotaChange(e) {
      delete e.rownum;
      this.items = e;
      for (const i in this.items) {
        if (
          i !== 'cod_vehiculo' &&
          i !== 'cod_flota' &&
          i !== 'patente_vehiculo'
        ) {
          this.items[i] = this.items[i] === true ? 'SI' : 'NO';
        }
      }
      this.$emit('changeFlota', this.items);
    },
    dialogClose(e) {
      for (const i in this.items) {
        if (
          i !== 'cod_vehiculo' &&
          i !== 'cod_flota' &&
          i !== 'patente_vehiculo'
        ) {
          this.items[i] = this.items[i] === true ? 'SI' : 'NO';
        }
      }
      this.dialog = e;
    },
    dialogFlotaClose(e) {
      for (const i in this.items) {
        if (
          i !== 'cod_vehiculo' &&
          i !== 'cod_flota' &&
          i !== 'patente_vehiculo'
        ) {
          this.items[i] = this.items[i] === true ? 'SI' : 'NO';
        }
      }
      this.dialogFlota = e;
    },
    onChangeSwitch() {
      if (this.switch1 === true) {
        this.labelSwitch = 'Ocultar integraciones';
        this.$emit('showAll', this.switch1);
      } else {
        this.labelSwitch = 'Mostrar integraciones';
        this.$emit('showAll', this.switch1);
      }
    },
  },
};
</script>

<style scoped>
.actions {
  display: flex;
  justify-content: center;
}
.center {
  display: flex;
  height: 15rem;
  text-align: center;
  align-items: center;
  justify-content: center;
}
.tableContainer {
  height: 90vh;
}
</style>
