export const getUserId = (): number => {
  let user = localStorage.getItem('user');
  let id = JSON.parse(user.replace(/'/g, '"')).id;
  return parseInt(id);
};
