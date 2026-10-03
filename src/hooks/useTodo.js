import { useEffect, useReducer } from 'react';
import { todoReducer } from '../todoReducer';

export const useTodo = () => {
    const initialState = [];

    const init = () =>  {
        try {
            const storedTodos = JSON.parse(localStorage.getItem('todos'));
            return Array.isArray(storedTodos) ? storedTodos : [];
        } catch {
            return [];
        }
    }

    const [todos, dispatch] = useReducer(
        todoReducer, 
        initialState, 
        init
    );

    const todosCount = todos.length
    const pendingTodosCount = todos.filter(todo => !todo.done).length


    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos))
    }, [todos])
    

    const handleNewTodo = todo => {
        const action = {
            type: 'Add Todo',
            payload: todo,
        };

        dispatch(action);
    };

    const handleDeleteTodo = id => {
        const action = {
            type: 'Delete Todo',
            payload: id,
        };

        dispatch(action);
    };

    const handleCompleteTodo = id => {
        const action = {
            type: 'Complete Todo',
            payload: id,
        };

        dispatch(action);
    };

    const handleUpdateTodo = (id, description) => {
        const action = {
            type: 'Update Todo',
            payload: {
                id,
                description,    
            },
        };

        dispatch(action);
    };

    const handlePatchTodo = (id, patch) => {
        dispatch({ type: 'Patch Todo', payload: { id, patch } });
    };

    const handleReplaceTodos = (nextTodos) => {
        dispatch({ type: 'Replace Todos', payload: nextTodos });
    };

    const handleReorderTodos = (nextTodos) => {
        dispatch({ type: 'Reorder Todos', payload: nextTodos });
    };

    return{
        todos,
        todosCount,
        pendingTodosCount,
        handleNewTodo,
        handleDeleteTodo,
        handleCompleteTodo,
        handleUpdateTodo,
        handlePatchTodo,
        handleReplaceTodos,
        handleReorderTodos
    };
};
