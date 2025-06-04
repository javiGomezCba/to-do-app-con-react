// src/components/TodoFilter.jsx
import React from 'react';

export const TodoFilter = ({ filtro, setFiltro, busqueda, setBusqueda }) => {
  return (
    <div className="todo-filter">
      <input
        type="text"
        placeholder="Buscar tarea..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="filtros">
        <button
          className={filtro === 'todas' ? 'activo' : ''}
          onClick={() => setFiltro('todas')}
        >
          Todas
        </button>
        <button
          className={filtro === 'pendientes' ? 'activo' : ''}
          onClick={() => setFiltro('pendientes')}
        >
          Pendientes
        </button>
        <button
          className={filtro === 'hechas' ? 'activo' : ''}
          onClick={() => setFiltro('hechas')}
        >
          Hechas
        </button>
      </div>
    </div>
  );
};
