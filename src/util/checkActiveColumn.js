const checkActiveColumn = ({
  e,
  activeColumn,
  headerCoords,
  setActiveColumn,
}) => {
  let mouseCoords = {
    x: -1,
    y: -1,
  };

  let changeTouches = e.changedTouches;

  if (changeTouches !== undefined && changeTouches.length > 0) {
    mouseCoords = {
      x: changeTouches[0].pageX,
      y: changeTouches[0].pageY,
    };
  } else {
    mouseCoords = {
      x: e.clientX !== undefined ? e.clientX : e.pageX,
      y: e.clientY !== undefined ? e.clientY : e.pageY,
    };
  }

  let newActiveColumn = activeColumn;
  headerCoords.forEach((bound, i) => {
    if (bound.l <= mouseCoords.x && bound.r >= mouseCoords.x) {
      if (activeColumn !== i) {
        if (setActiveColumn) {
          setActiveColumn(i);
        }
        newActiveColumn = i;
      }
    }
  });

  return newActiveColumn;
};

export default checkActiveColumn;
