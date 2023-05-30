<template>
  <div>
    <v-dialog
      @click:outside="closeDialog"
      :value="dialogSwitch"
      :v-model="dialogSwitch"
      max-width="450px"
    >
      <v-card>
        <v-card-text>
          <v-row
            class="d-flex flex-column"
            dense
            align="center"
            justify="center"
          >
            <v-icon class="mt-5" size="60">mdi-cloud-upload</v-icon>
            <p>
              Selecciona tu archivo o arrastra aquí
            </p>
          </v-row>
        </v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class DialogLoad extends Vue {
  // State
  @Prop() dialog: boolean;
  dialogSwitch: boolean = false;

  @Watch('dialog')
  onDialogChanged(value: boolean, lastValue: boolean) {
    this.dialogSwitch = value;
  }

  closeDialog() {
    console.log('Entrée');
    this.$emit('update_dialog', false);
  }
}
</script>

<style scoped></style>
