const getInitialGameMatrix = (reset = false) => {
  let gameMatrix;

  // if (!reset) {
  //   try {
  //     gameMatrix = JSON.parse(localStorage.getItem("gameMatrix"));
  //   } catch (e) {
  //     console.log(e);
  //   }

  //   if (gameMatrix !== null && typeof gameMatrix === "object") {
  //     return gameMatrix;
  //   }
  // }

  gameMatrix = [];
  for (let h = 0; h < 6; h++) {
    const row = new Array(7).fill(0);
    gameMatrix.push(row);
  }
  return gameMatrix;
};

export default getInitialGameMatrix;
