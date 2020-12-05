export function columnAdjust(node) {
  let parent = node.parentNode
  let startOffset;

  function handleMouseDown (event) {
    startOffset = parent.offsetWidth - event.pageX;

    document.addEventListener('mousemove', handleMousemove);
    document.addEventListener('mouseup', handleMouseup);
  }

  node.addEventListener('mousedown', handleMouseDown);

  function handleMousemove (event) {
    parent.style.width = startOffset + event.pageX + 'px';
  }

  function handleMouseup (event) {
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
  }

  return {
    destroy() {
      node.removeEventListener('mousedown', handleMouseDown)
    }
  };
}