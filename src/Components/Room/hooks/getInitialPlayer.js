const getInitialPlayer = () => {
  console.log("getInitialPlayer");

  let currentPlayer;

  try {
    currentPlayer = parseInt(localStorage.getItem("currentPlayer"));
  } catch (e) {
    console.log(e);
  }

  if (currentPlayer >= 1) {
    return currentPlayer;
  }

  return 1;
};

export default getInitialPlayer;
