export default Array.from({
  length: 4,
}).map((proveedor, index) => ({
  id: index,
  nombre: `Proveedor GPS ${index}`,
}));
