<template>
  <div>
    Components
    <ConectaTable :configs="configs" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConectaTable from '@/components/ConectaTable/index.vue';
import { TableConfig } from '@/components/ConectaTable/TableConfigInterface';

@Component({
  components: {
    ConectaTable,
  },
})
export default class TableUsage extends Vue {
  configs: TableConfig[] = [
    {
      header: {
        text: 'Dessert (100g serving)',
        align: 'left', //TODO: mojorar es alineamiento
        value: 'name',
      },
      property: 'name',
    },
    {
      header: { text: 'Calories', value: 'calories' },
      property: 'calories',
    },
  ];
}
</script>
