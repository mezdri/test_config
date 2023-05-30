<template>
  <v-card class="card">
    <v-icon color="primary" :disabled="!editing" small>edit</v-icon
    ><v-text-field
      type="text"
      label="Razón Social"
      name="nombre"
      :value="cliente.nombre"
      @input="handleName"
    />
    <v-icon color="primary" :disabled="!editing" small>edit</v-icon
    ><v-text-field
      type="text"
      label="RUT"
      :value="cliente.rut.split('-')[0]"
      @input="handleRut"
    />
    <v-icon color="primary" :disabled="!editing" small>edit</v-icon
    ><v-text-field
      type="text"
      label="Estado"
      :value="cliente.estado"
      @input="handleEstado"
    />
    <v-icon color="primary" :disabled="!editing" small>edit</v-icon
    ><v-text-field
      type="text"
      label="Giro"
      :value="cliente.giro"
      @input="handleGiro"
    />
    <v-text-field
      type="text"
      label="ID"
      :value="cliente.id"
      readonly
      disabled
      style="cursor:no-drop"
    />
    <div class="btn" v-show="editing">
      <v-btn @click="saveEdit" class="success">
        <v-icon color="">save</v-icon>&nbsp;&nbsp;{{ btnTxt }}
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { fetchClientes } from './fetchClientes';

@Component
export default class TablaInfoGral extends Vue {
  @Prop({ default: [] }) cliente: any;

  fetchClientes = new fetchClientes();

  btnTxt: String = 'GUARDAR CAMBIOS';
  editing: Boolean = false;
  $snotify: any;

  nombre: String;
  rut: String;
  giro: String;
  estado: String;

  handleName(evt: String) {
    this.nombre = evt;
    this.editing = true;
  }

  handleRut(evt: String) {
    this.rut = evt;
    this.editing = true;
  }

  handleGiro(evt: String) {
    this.giro = evt;
    this.editing = true;
  }

  handleEstado(evt: String) {
    this.estado = evt;
    this.editing = true;
  }

  async saveEdit() {
    this.btnTxt = 'GUARDANDO CAMBIOS...';
    if (this.nombre) this.cliente.nombre = this.nombre;
    if (this.giro) this.cliente.giro = this.giro;
    if (this.estado) this.cliente.estado = this.estado;
    if (this.rut) this.cliente.rut = this.rut;
    else this.cliente.rut = this.cliente.rut.split('-')[0];
    this.editing = false;
    let response = await this.fetchClientes.updateCliente(this.cliente);
    if (response.data.CODIGO_RESPUESTA === '1') {
      this.$snotify.success(response.data.MENSAJE_RESPUESTA);
    } else {
      this.$snotify.error(response.data.MENSAJE_RESPUESTA);
    }
    this.btnTxt = 'GUARDAR CAMBIOS';
  }
}
</script>

<style scoped>
.card {
  width: 60%;
  margin: auto;
  padding: 1rem 5rem;
}
.btn {
  display: flex;
  justify-content: center;
}
</style>
