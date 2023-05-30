interface IPlataforma {
  id: number;
  nombre: string;
}
export class Plataformas {
  plataformas: IPlataforma[];
  filtros: IPlataforma[];

  constructor() {
    this.plataformas = [
      { id: 0, nombre: 'NAVMAN' },
      { id: 1, nombre: 'ORVIS' },
      { id: 2, nombre: 'TRACK3' },
    ];
    this.filtros = [{ id: 0, nombre: 'Flota' }, { id: 1, nombre: 'Grupo' }];
  }
  getNombrePorIdPlataformas(id: number) {
    let value = this.plataformas.find((post, index) => {
      if (post.id === id) return true;
    });
    return value.nombre;
  }
  getNombrePorIdFiltros(id: number) {
    let value = this.filtros.find((post, index) => {
      if (post.id === id) return true;
    });
    return value.nombre;
  }
}
