import Vue from 'vue';
import {
  Vuetify,
  VAlert,
  VApp,
  VNavigationDrawer,
  VFooter,
  VList,
  VBtn,
  VInput,
  VIcon,
  VImg,
  VGrid,
  VToolbar,
  transitions,
  VTextField,
  VSelect,
  VCheckbox,
  VForm,
  VCard,
  VMenu,
  VDivider,
  VJumbotron,
  VSnackbar,
  VDialog,
  VDataTable,
  VTooltip,
  VDatePicker,
  VChip,
  VAvatar,
  VProgressLinear,
  VTabs,
  VBadge,
  VSpeedDial,
  VAutocomplete,
  VStepper,
  VBottomNav,
  VSystemBar,
  VSwitch,
  VExpansionPanel,
  VTimePicker,
  VSlider,
  VSubheader,
  VTreeview,
  VRadioGroup,
  VTextarea,
  VCombobox,
  VPagination,
  VProgressCircular,
  VCarousel,
} from 'vuetify';
import 'vuetify/src/stylus/app.styl';
import es from 'vuetify/es5/locale/es';

Vue.use(Vuetify, {
  components: {
    Vuetify,
    VAlert,
    VApp,
    VNavigationDrawer,
    VFooter,
    VList,
    VBtn,
    VIcon,
    VInput,
    VImg,
    VGrid,
    VToolbar,
    transitions,
    VTextField,
    VSelect,
    VCheckbox,
    VForm,
    VCard,
    VMenu,
    VDivider,
    VJumbotron,
    VSnackbar,
    VDialog,
    VDataTable,
    VTooltip,
    VDatePicker,
    VChip,
    VAvatar,
    VProgressLinear,
    VTabs,
    VBadge,
    VSpeedDial,
    VAutocomplete,
    VStepper,
    VBottomNav,
    VSystemBar,
    VSwitch,
    VExpansionPanel,
    VTimePicker,
    VSlider,
    VSubheader,
    VTreeview,
    VRadioGroup,
    VTextarea,
    VCombobox,
    VPagination,
    VProgressCircular,
    VCarousel,
  },
  theme: {
    primary: '#27488E',
    secondary: '#777777',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    btnNormal: '#526da5',
  },
  lang: {
    locales: { es },
    current: 'es',
  },
});
