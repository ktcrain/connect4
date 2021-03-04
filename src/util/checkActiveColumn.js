const checkActiveColumn = ({
  e,
  activeColumn,
  headerCoords,
  setActiveColumn,
}) => {
  const mouseCoords = {
    x: e.clientX,
    y: e.clientY,
  };

  headerCoords.forEach((bound, i) => {
    if (bound.l <= mouseCoords.x && bound.r >= mouseCoords.x) {
      if (activeColumn !== i) {
        setActiveColumn(i);
      }
    }
  });
};

export default checkActiveColumn;
