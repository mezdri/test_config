<template>
  <article>
    <header class="tabs">
      <div id="pestanas">
        <ul id="lista_tabs">
          <li
            id="lista_tab"
            v-for="(tab, index) in tabs"
            :key="index"
            :class="{ 'is-active_tab': tab.isActive }"
          >
            <div class="nav-item-tab" @click="selectTab(tab)">
              {{ tab.name }}
            </div>
          </li>
        </ul>
      </div>
    </header>
    <section class="tabs-details">
      <slot></slot>
    </section>
  </article>
</template>

<script>
export default {
  data: () => {
    return {
      tabs: [],
    };
  },
  methods: {
    selectTab(selectedTab) {
      this.tabs.forEach(tab => {
        tab.isActive = tab.name === selectedTab.name;
      });
    },
  },
  created() {
    this.tabs = this.$children;
  },
};
</script>

<style scoped>
.tabs {
  margin-top: -15px;
}
.tabs-details {
  padding: 0px;
}
#lista_tabs {
  display: flex;
  padding: 0;
  list-style: none;
}

.nav-item-tab {
  cursor: pointer;
  font-size: 15px !important;
  text-align: center;
}
.is-active_tab {
  background: #27488e !important;
  color: white;
}
#pestanas {
  float: top;
}
#pestanas ul {
  margin-left: 190px;
  height: 30px;
}
.v-title {
  margin-bottom: 20px;
}

#lista_tab {
  list-style-type: none;
  float: left;
  text-align: center;
  margin: 0px 2px -2px -0px;
  background: white;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom: white;
  padding: 0px 20px 0px 20px;
  box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2),
    0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);
}
</style>
