import React from 'react'
import { FaTrash } from 'react-icons/fa';
import { FaCheck } from "react-icons/fa";

import { TodoUpdate } from './TodoUpdate';

export const TodoItems = ({
    todo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleCompleteTodo,
}) => {
    return (
        <li>
            <span 
                title="Marcar como completada"
                onClick={() => handleCompleteTodo(todo.id)}
            >
                <label className={`container-done ${todo.done ? 'active' : ''}`}>
                {todo.done && <FaCheck  className="icon-check" />}
                </label>
            </span>

            <TodoUpdate
            todo={todo} handleUpdateTodo={handleUpdateTodo} />
            <button 
                title='Eliminar esta tarea'
                className='btn-delete' 
                onClick={() => handleDeleteTodo(todo.id)}
            >
                <FaTrash />
            </button>
        </li>
  );
;}
