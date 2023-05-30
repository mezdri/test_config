<template>
  <v-flex xs12 sm6 md6>
    <div align="left">
      <v-text-field
        @input="onFilterTextBoxChanged"
        v-model="search"
        append-icon="search"
        label="Buscar..."
        single-line
        hide-details
      ></v-text-field>
    </div>
  </v-flex>
</template>

<script lang="ts">
import { LoadingService } from '@/services/loadingService';
import { Component, Vue } from 'vue-property-decorator';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';

@Component({
  name: 'searchSimple',
  components: {},
})
export default class searchSimple extends Vue {
  loadingService = new LoadingService();
  $snotify: any;
  isLoading: boolean = false;
  search: string = '';

  onFilterTextBoxChanged() {
    TorreControlInstance.$emit('searchSimple', this.search);
  }
}
</script>
