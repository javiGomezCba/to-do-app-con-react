import { useState, useEffect } from 'react';
import './App.css';
import { TodoAdd } from './components/TodoAdd';
import { TodoList } from './components/TodoList';
import { useTodo } from './hooks/useTodo';

function App() {
  const { 
    todos,
    todosCount,
    pendingTodosCount,
    handleNewTodo,
    handleDeleteTodo,
    handleCompleteTodo,
    handleUpdateTodo,
  } = useTodo();

  // Estado para modo oscuro
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <>
      <div className='card-to-do'>
        <h1>Lista de tareas</h1>

        {/* Botón para cambiar tema */}
        <button
          className="btn-toggle-theme"
          onClick={() => setDarkMode(prev => !prev)}
          title='Cambiar entre modo oscuro y modo claro'
        >
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>

        <div className='counter-todos'>
          <h3>
            N° Tareas: <span>{todosCount}</span>
          </h3>
          <h3>
            Pendientes: <span>{pendingTodosCount}</span>
          </h3>
        </div>

        <div className='add-todo'>
          <h3 title='Agrega una tarea nueva'>Agregar tarea</h3>
          <TodoAdd handleNewTodo={handleNewTodo} />
        </div>

        <TodoList
          todos={todos}
          handleUpdateTodo={handleUpdateTodo}
          handleDeleteTodo={handleDeleteTodo}
          handleCompleteTodo={handleCompleteTodo}
        />
      </div>
    </>
  );
}

export default App;
