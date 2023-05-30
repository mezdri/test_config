<template>
  <v-card class="rounded-card mt-20">
    <v-container grid-list-md>
      <FormFieldsContainer titulo="Planes de Mantenimiento" column>
        <v-flex>
          <v-text-field label="Buscar..."></v-text-field>
        </v-flex>

        <v-flex>
          <v-data-table
            :headers="headers"
            :items="items"
            :pagination.sync="pagination"
            :rows-per-page-items="rowsPerPage"
            rows-per-page-text="Filas por página"
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">{{ props.item.columna }}</td>
              <td class="text-xs-left">
                <v-text-field
                  v-model="props.item.orden"
                  type="number"
                  min="1"
                  max="99"
                ></v-text-field>
              </td>
              <td class="justify-center layout px-2">
                <v-switch v-model="props.item.estado"></v-switch>
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </FormFieldsContainer>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop } from 'vue-property-decorator';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

@Component({
  components: {
    TimePicker,
    FormFieldsContainer,
  },
})
export default class ContainerMantenimiento extends Vue {
  pagination: any = {
    rowsPerPage: -1,
  };
  rowsPerPage: any = [5, 10, 25, { text: 'Todos', value: -1 }];
  headers: any = [{ text: 'Nombre', value: 'nombre', width: '500' }];
  items: any = [];
}
</script>
