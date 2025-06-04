import React, { useState } from 'react';
import { TodoItems } from './TodoItems';
import { TodoFilter } from './TodoFilter'; // 👈 nuevo import

export const TodoList = ({
  todos,
  handleUpdateTodo,
  handleDeleteTodo,
  handleCompleteTodo,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todas'); // 'todas' | 'hechas' | 'pendientes'

  const tareasFiltradas = todos.filter((todo) => {
    const coincideTexto = todo.description.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      filtro === 'todas' ||
      (filtro === 'hechas' && todo.done) ||
      (filtro === 'pendientes' && !todo.done);

    return coincideTexto && coincideEstado;
  });

  return (
    <>
      <TodoFilter
        filtro={filtro}
        setFiltro={setFiltro}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />

      <ul>
        {tareasFiltradas.map((todo) => (
          <TodoItems
            key={todo.id}
            todo={todo}
            handleUpdateTodo={handleUpdateTodo}
            handleDeleteTodo={handleDeleteTodo}
            handleCompleteTodo={handleCompleteTodo}
          />
        ))}
      </ul>
    </>
  );
};
