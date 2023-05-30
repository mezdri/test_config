<template>
  <div>
    <FormFieldsContainer>
      <v-flex>
        <v-radio-group v-model="row" row>
          <v-radio label="PDF" value="pdf"></v-radio>
          <v-radio label="Excel" value="excel"></v-radio>
          <v-radio label="CSV" value="csv"></v-radio>
          <v-btn @click="handleClick()">
            <span>Descargar Informe</span>
          </v-btn>
        </v-radio-group>
      </v-flex>
    </FormFieldsContainer>
  </div>
</template>

<script lang="ts">
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

@Component({
  components: {
    FormFieldsContainer,
    CrearButton,
  },
})
export default class HeaderInforme extends Vue {
  @Prop({ required: true }) dataInforme: any;
  row: any = null;

  handleClick() {
    console.log('dataInfomre');
  }
}
</script>

<style scoped>
.v-btn {
  margin-left: 40px !important;
  background-color: #ffe800 !important;
}
</style>
