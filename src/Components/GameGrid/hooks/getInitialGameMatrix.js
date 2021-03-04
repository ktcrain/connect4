const getInitialGameMatrix = () => {
  const gameMatrix = [];
  for (let h = 0; h < 6; h++) {
    const row = new Array(7).fill(0);
    gameMatrix.push(row);
  }
  return gameMatrix;
};

export default getInitialGameMatrix;
