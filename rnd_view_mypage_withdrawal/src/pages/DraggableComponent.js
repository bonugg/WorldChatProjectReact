import React from 'react';
import { useDrag } from 'react-dnd';

function DraggableComponent(props) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SOME_ITEM,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const { Component } = props;

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Component {...props} />
    </div>
  );
}

export default DraggableComponent;
