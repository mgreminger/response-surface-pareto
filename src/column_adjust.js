export function columnAdjust(node, headers) {
  let startOffset;
  let grip;

  node.style.position = 'relative'

  grip = document.createElement('div');
  grip.innerHTML = "&nbsp"
  grip.style.top = 0;
  grip.style.right = 0;
  grip.style.bottom = 0;
  grip.style.width = "5px";
  grip.style.position = "absolute";
  grip.style.cursor = "col-resize";

  function handleMouseDown (event) {
    startOffset = node.offsetWidth - event.pageX;

    document.addEventListener('mousemove', handleMousemove);
    document.addEventListener('mouseup', handleMouseup);
  }

  grip.addEventListener('mousedown', handleMouseDown);

  node.appendChild(grip)

  function handleMousemove (event) {
    node.style.width = startOffset + event.pageX + 'px';
  }

  function handleMouseup (event) {
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
  }

  return {
    destroy() {
      grip.removeEventListener('mousedown', handleMouseDown)
    }
  };
}