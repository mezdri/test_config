export default Array.from({
  length: 10,
}).map((campo, index) => ({
  id: index,
  nombre: `Campo #${index}`,
}));
