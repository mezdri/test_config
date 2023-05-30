<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      select-all
      item-key="name"
      class="elevation-1"
    >
      <template v-slot:headers="props">
        <tr>
          <th v-if="selectable">
            <v-checkbox
              :input-value="props.all"
              :indeterminate="props.indeterminate"
              primary
              hide-details
              @click.stop="toggleAll"
            ></v-checkbox>
          </th>
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
      <template v-slot:items="props">
        <tr
          v-if="selectable"
          :active="props.selected"
          @click="props.selected = !props.selected"
        >
          <td>
            <v-checkbox
              :input-value="props.selected"
              primary
              hide-details
            ></v-checkbox>
          </td>
          <!-- TODO: mojorar es alineamiento -->
          <td v-for="property in properties" :key="property">
            {{ props.item[property] }}
          </td>
        </tr>
      </template>
      <template v-slot:no-data>
        <div class="center">
          {{ noDataMessage }}
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { TableConfig } from './TableConfigInterface';

@Component
export default class ConectaTable extends Vue {
  @Prop({ default: false })
  selectable!: boolean;
  @Prop({
    default: (): TableConfig[] => [],
    required: true,
  })
  configs!: TableConfig[];
  @Prop({
    type: Array,
    default: (): any[] => [],
  })
  items!: any[];
  @Prop({ default: 'No se han encontrado resultados para la búsqueda.' })
  noDataMessage!: string;

  //TODO: crear una interfaz para la config
  // = [
  //   {
  //     header: {
  //       text: 'Dessert (100g serving)',
  //       align: 'left', //TODO: mojorar es alineamiento
  //       value: 'name',
  //     },
  //     property: 'name',
  //   },
  //   {
  //     header: { text: 'Calories', value: 'calories' },
  //     property: 'calories',
  //   },
  // ];

  pagination: any = {
    sortBy: 'name',
  };
  selected: any[] = [];

  properties = this.configs.map(config => config.property);

  headers = this.configs.map(config => config.header);

  //TODO: hacer logica para actiones

  toggleAll() {
    if (this.selected.length) this.selected = [];
    else this.selected = this.items.slice();
  }
  changeSort(column: any) {
    if (this.pagination.sortBy === column) {
      this.pagination.descending = !this.pagination.descending;
    } else {
      this.pagination.sortBy = column;
      this.pagination.descending = false;
    }
  }
}
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
