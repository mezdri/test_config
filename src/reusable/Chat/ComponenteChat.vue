<template>
  <span></span>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class ComponenteChat extends Vue {
  script_tag: any;
  mounted() {
    const script_content = ' ';
    this.script_tag = document.createElement('script');
    this.script_tag.type = 'text/javascript';

    this.script_tag.id = 'ze-snippet';
    this.script_tag.src =
      'https://static.zdassets.com/ekr/snippet.js?key=c702f849-633b-47f0-a6b9-e403dc1d42a8';
    this.script_tag.text = script_content;
    document.body.appendChild(this.script_tag);
  }
}
</script>

<style>
#launcher {
  left: 0px !important;
}
</style>
