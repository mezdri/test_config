export default Array.from({
  length: 4,
}).map((proveedor, index) => ({
  id: index,
  nombre: `Cliente Proveedor GPS ${index}`,
  proveedorId: [index],
}));
