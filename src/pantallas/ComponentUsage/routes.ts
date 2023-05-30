import { Funcionalidades } from '@/config/funcionalidades';

const TableUsage = () => import('./TableUsage.vue');

const ComponentsRoutes = [
  {
    path: 'Table-Use',
    component: TableUsage,
    meta: {
      description: 'Table use',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.ClientesConecta,
    },
  },
];

export default ComponentsRoutes;
