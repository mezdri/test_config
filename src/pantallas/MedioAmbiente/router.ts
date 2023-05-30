import { Funcionalidades } from '@/config/funcionalidades';
import HuellaCarbono from '@/pantallas/MedioAmbiente/HuellaCarbono/HuellaCarbono.vue';
import ReportesHuellaCarbono from '@/pantallas/MedioAmbiente/Reporte/reporteHuellaCarbono.vue';

const MedioAmbienteRouter = [
  {
    path: '/Huella-Carbono/general',
    component: HuellaCarbono,
    meta: {
      description: 'Huella Carbono',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.MedioAmbiente,
    },
  },
  {
    path: '/Huella-Carbono/reporte',
    component: ReportesHuellaCarbono,
    meta: {
      description: 'Reportes Huella Carbono',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.MedioAmbiente,
    },
  },
];

export default MedioAmbienteRouter;
