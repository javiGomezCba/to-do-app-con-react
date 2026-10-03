import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaCheck, FaPlus, FaSearch, FaSun, FaMoon, FaTrash, FaPen, FaCalendarAlt, FaTasks, FaFire, FaLayerGroup, FaTimes, FaInbox, FaFlag, FaListUl, FaUndo, FaTag, FaGripVertical, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useTodo } from './hooks/useTodo';
import { useDarkMode } from './hooks/useDarkMode';
import './App.css';

const filters = [
  { id: 'all', label: 'Todas', icon: FaLayerGroup },
  { id: 'today', label: 'Hoy', icon: FaCalendarAlt },
  { id: 'pending', label: 'Pendientes', icon: FaTasks },
  { id: 'done', label: 'Completadas', icon: FaCheck },
];

const priorities = [
  { id: 'high', label: 'Alta', className: 'priority-high' },
  { id: 'medium', label: 'Media', className: 'priority-medium' },
  { id: 'low', label: 'Baja', className: 'priority-low' },
];

const today = () => new Date().toISOString().slice(0, 10);
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function App() {
  const { todos, todosCount, pendingTodosCount, handleNewTodo, handleDeleteTodo, handleCompleteTodo, handleUpdateTodo, handlePatchTodo, handleReplaceTodos, handleReorderTodos } = useTodo();
  const [darkMode, setDarkMode] = useDarkMode();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [labelText, setLabelText] = useState('');
  const [activeLabel, setActiveLabel] = useState('');
  const [editing, setEditing] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(() => new Set());
  const [subtaskDrafts, setSubtaskDrafts] = useState({});
  const [sortBy, setSortBy] = useState('manual');
  const [draggedTask, setDraggedTask] = useState(null);
  const [undoNotice, setUndoNotice] = useState(null);
  const undoSnapshot = useRef(null);
  const undoTimer = useRef(null);

  const runUndoable = useCallback((label, change) => {
    undoSnapshot.current = todos;
    change();
    setUndoNotice({ label, id: makeId() });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => {
      undoSnapshot.current = null;
      setUndoNotice(null);
    }, 8000);
  }, [todos]);

  const undo = useCallback(() => {
    if (!undoSnapshot.current) return;
    handleReplaceTodos(undoSnapshot.current);
    undoSnapshot.current = null;
    clearTimeout(undoTimer.current);
    setUndoNotice(null);
  }, [handleReplaceTodos]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearTimeout(undoTimer.current);
    };
  }, [undo]);

  const availableLabels = useMemo(() => [...new Set(todos.map((todo) => todo.label?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')), [todos]);
  const canReorder = sortBy === 'manual' && filter === 'all' && !query.trim() && !activeLabel;

  const filteredTodos = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return todos.filter((todo) => {
      const matchesText = todo.description.toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'pending' && !todo.done) || (filter === 'done' && todo.done) || (filter === 'today' && todo.dueDate === today());
      const matchesLabel = !activeLabel || todo.label === activeLabel;
      return matchesText && matchesFilter && matchesLabel;
    }).sort((a, b) => {
      if (sortBy === 'manual') return 0;
      if (sortBy === 'priority') return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1) || (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      if (sortBy === 'date') return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31');
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || Number(b.id) - Number(a.id);
    });
  }, [todos, query, filter, activeLabel, sortBy]);

  const addTodo = (event) => {
    event.preventDefault();
    const text = description.trim();
    if (!text) return;
    const task = { id: makeId(), description: text, done: false, dueDate, priority, label: labelText.trim(), subtasks: [], createdAt: new Date().toISOString() };
    runUndoable('Tarea agregada', () => handleNewTodo(task));
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setLabelText('');
  };

  const saveEdit = (event, id) => {
    event.preventDefault();
    const text = editing?.text.trim();
    if (text) runUndoable('Tarea editada', () => handleUpdateTodo(id, text));
    setEditing(null);
  };

  const clearCompleted = () => {
    const completed = todos.filter((todo) => todo.done);
    if (completed.length) runUndoable(`${completed.length} tareas eliminadas`, () => completed.forEach((todo) => handleDeleteTodo(todo.id)));
  };

  const patchTask = (id, patch, label) => runUndoable(label, () => handlePatchTodo(id, patch));
  const toggleSubtasks = (id) => setExpandedTasks((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const addSubtask = (event, todo) => {
    event.preventDefault();
    const text = (subtaskDrafts[todo.id] ?? '').trim();
    if (!text) return;
    const subtasks = [...(todo.subtasks ?? []), { id: makeId(), description: text, done: false }];
    patchTask(todo.id, { subtasks }, 'Subtarea agregada');
    setSubtaskDrafts((current) => ({ ...current, [todo.id]: '' }));
  };
  const toggleSubtask = (todo, subtaskId) => {
    const subtasks = (todo.subtasks ?? []).map((subtask) => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask);
    patchTask(todo.id, { subtasks }, 'Progreso de subtarea actualizado');
  };
  const deleteSubtask = (todo, subtaskId) => {
    patchTask(todo.id, { subtasks: (todo.subtasks ?? []).filter((subtask) => subtask.id !== subtaskId) }, 'Subtarea eliminada');
  };

  const moveTask = (taskId, direction) => {
    const currentIndex = todos.findIndex((todo) => todo.id === taskId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= todos.length) return;
    const reordered = [...todos];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    runUndoable('Orden de tareas actualizado', () => handleReorderTodos(reordered));
  };

  const dropTask = (targetId) => {
    if (!draggedTask || draggedTask === targetId) return;
    const reordered = [...todos];
    const sourceIndex = reordered.findIndex((todo) => todo.id === draggedTask);
    const targetIndex = reordered.findIndex((todo) => todo.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    runUndoable('Orden de tareas actualizado', () => handleReorderTodos(reordered));
    setDraggedTask(null);
  };

  const completedCount = todosCount - pendingTodosCount;
  const progress = todosCount ? Math.round((completedCount / todosCount) * 100) : 0;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Tildin, inicio"><span className="brand-mark"><FaCheck /></span><span>tildin<span className="brand-dot">.</span></span></a>
        <div className="workspace-label">TU ESPACIO</div>
        <nav className="nav-list" aria-label="Filtros de tareas">
          {filters.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${filter === id ? 'selected' : ''}`} onClick={() => setFilter(id)}><Icon /><span>{label}</span>{id === 'pending' && pendingTodosCount > 0 && <span className="nav-count">{pendingTodosCount}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card"><span className="tip-icon"><FaFire /></span><strong>Un paso a la vez</strong><p>Las grandes cosas se hacen con pequeñas tareas.</p></div>
          <button className="theme-button" onClick={() => setDarkMode((value) => !value)}>{darkMode ? <FaSun /> : <FaMoon />}<span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span><span className={`theme-switch ${darkMode ? 'on' : ''}`} /></button>
          <div className="profile"><div className="avatar">T</div><div><strong>Mi espacio</strong><span>Plan personal</span></div><span className="profile-menu">•••</span></div>
        </div>
      </aside>

      <section className="main-content" id="inicio">
        <header className="topbar"><div className="breadcrumb">Mi espacio <span>/</span> <strong>{filters.find((item) => item.id === filter)?.label}</strong></div><div className="date-label">{new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</div></header>
        <div className="content-wrap">
          <section className="welcome-row"><div><div className="eyebrow">TU PRODUCTIVIDAD, EN CALMA</div><h1>Hola, ¿qué toca <span>hoy?</span></h1><p>Un poco de progreso cada día suma mucho.</p></div><div className="progress-card"><div className="progress-copy"><span>Tu progreso</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{completedCount} de {todosCount} tareas completadas</small></div></section>

          <form className="composer" onSubmit={addTodo}>
            <span className="composer-plus"><FaPlus /></span>
            <input aria-label="Nueva tarea" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="¿Qué necesitas hacer?" maxLength={160} />
            <label className="date-picker" title="Agregar fecha"><FaCalendarAlt /><input type="date" aria-label="Fecha límite" value={dueDate} onChange={(event) => setDueDate(event.target.value)} min={today()} /></label>
            <label className="composer-label" title="Etiqueta de la tarea"><FaTag /><input list="task-label-options" aria-label="Etiqueta" value={labelText} onChange={(event) => setLabelText(event.target.value)} placeholder="Etiqueta" maxLength={28} /><datalist id="task-label-options">{availableLabels.map((label) => <option key={label} value={label} />)}</datalist></label>
            <label className="composer-priority" title="Prioridad de la tarea"><FaFlag /><select aria-label="Prioridad de la tarea" value={priority} onChange={(event) => setPriority(event.target.value)}>{priorities.map((item) => <option value={item.id} key={item.id}>Prioridad {item.label.toLowerCase()}</option>)}</select></label>
            <button className="add-button" type="submit">Agregar tarea</button>
          </form>

          <section className="task-section">
            <div className="section-heading"><div><h2>{activeLabel ? `Etiqueta: ${activeLabel}` : filter === 'all' ? 'Tus tareas' : filters.find((item) => item.id === filter)?.label}</h2><span>{filteredTodos.length} {filteredTodos.length === 1 ? 'tarea' : 'tareas'}{canReorder && <span className="drag-hint"> · Arrastra para ordenar</span>}</span></div><div className="task-tools"><label className="search-box"><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tareas..." aria-label="Buscar tareas" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><FaTimes /></button>}</label><label className="sort-control"><span>Ordenar:</span><select aria-label="Ordenar tareas" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="manual">Manual</option><option value="created">Recientes</option><option value="priority">Prioridad</option><option value="date">Fecha límite</option></select></label><button className="clear-button" onClick={clearCompleted} disabled={!completedCount}>Limpiar hechas</button></div></div>
            <div className="filter-tabs" role="tablist" aria-label="Mostrar tareas">{filters.map(({ id, label }) => <button role="tab" aria-selected={filter === id} key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}{id === 'all' ? <span>{todosCount}</span> : id === 'pending' ? <span>{pendingTodosCount}</span> : id === 'done' ? <span>{completedCount}</span> : null}</button>)}</div>
            {(availableLabels.length > 0 || activeLabel) && <div className="label-filters" aria-label="Filtrar por etiqueta"><span><FaTag /> Etiquetas</span><button className={!activeLabel ? 'selected' : ''} onClick={() => setActiveLabel('')}>Todas</button>{availableLabels.map((label) => <button className={activeLabel === label ? 'selected' : ''} key={label} onClick={() => setActiveLabel(activeLabel === label ? '' : label)}>{label}<small>{todos.filter((todo) => todo.label === label).length}</small></button>)}</div>}
            <div className="task-list">
              {filteredTodos.map((todo) => {
                const subtasks = todo.subtasks ?? [];
                const subtasksDone = subtasks.filter((subtask) => subtask.done).length;
                const selectedPriority = priorities.find((item) => item.id === todo.priority) ?? priorities[1];
                return <div className={`task-group task-priority-${todo.priority ?? 'medium'} ${todo.done ? 'task-complete' : ''} ${draggedTask === todo.id ? 'is-dragging' : ''}`} key={todo.id} draggable={canReorder} onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(todo.id)); setDraggedTask(todo.id); }} onDragOver={(event) => { if (canReorder) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }} onDrop={(event) => { event.preventDefault(); dropTask(todo.id); }} onDragEnd={() => setDraggedTask(null)}>
                  <article className={`task-row ${todo.done ? 'is-done' : ''}`}>
                    <button className="check-button" onClick={() => runUndoable(todo.done ? 'Tarea marcada pendiente' : 'Tarea completada', () => handleCompleteTodo(todo.id))} aria-label={todo.done ? 'Marcar pendiente' : 'Completar tarea'}>{todo.done && <FaCheck />}</button>
                    <div className="task-copy">{editing?.id === todo.id ? <form className="edit-form" onSubmit={(event) => saveEdit(event, todo.id)}><input autoFocus value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} aria-label="Editar tarea" /><button type="submit">Guardar</button><button type="button" onClick={() => setEditing(null)} aria-label="Cancelar"><FaTimes /></button></form> : <><strong>{todo.description}</strong><div className="task-meta">{todo.dueDate ? <span className={`task-date ${todo.dueDate < today() && !todo.done ? 'overdue' : ''}`}><FaCalendarAlt /> {new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(`${todo.dueDate}T12:00:00`))}</span> : <span className="task-date no-date">Sin fecha</span>}<label className="task-label-chip"><FaTag /><select value={todo.label ?? ''} onChange={(event) => patchTask(todo.id, { label: event.target.value }, 'Etiqueta actualizada')} aria-label={`Cambiar etiqueta de ${todo.description}`}><option value="">Sin etiqueta</option>{availableLabels.map((label) => <option value={label} key={label}>{label}</option>)}</select></label><button className="subtask-summary" onClick={() => toggleSubtasks(todo.id)} aria-expanded={expandedTasks.has(todo.id)}><FaListUl /> {subtasks.length > 0 ? `${subtasksDone}/${subtasks.length} pasos` : 'Añadir pasos'}</button></div></>}</div>
                    <div className="task-controls"><label className={`priority-chip ${selectedPriority.className}`}><FaFlag /><select value={todo.priority ?? 'medium'} onChange={(event) => patchTask(todo.id, { priority: event.target.value }, 'Prioridad actualizada')} aria-label={`Prioridad de ${todo.description}`}>{priorities.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                    <span className={`status ${todo.done ? 'status-done' : todo.dueDate && todo.dueDate < today() ? 'status-late' : 'status-pending'}`}>{todo.done ? 'Completada' : todo.dueDate && todo.dueDate < today() ? 'Atrasada' : 'Pendiente'}</span>
                    <div className="row-actions">{canReorder && <><button className="move-task-button" aria-label="Mover tarea hacia arriba" title="Mover arriba" onClick={() => moveTask(todo.id, -1)}><FaArrowUp /></button><button className="move-task-button" aria-label="Mover tarea hacia abajo" title="Mover abajo" onClick={() => moveTask(todo.id, 1)}><FaArrowDown /></button><button className="desktop-drag-handle" aria-label="Arrastrar tarea para cambiar el orden" title="Arrastra para ordenar"><FaGripVertical /></button></>}<button aria-label="Agregar o ver subtareas" title="Subtareas" onClick={() => toggleSubtasks(todo.id)}><FaListUl /></button><button aria-label="Editar tarea" title="Editar" onClick={() => setEditing({ id: todo.id, text: todo.description })}><FaPen /></button><button aria-label="Eliminar tarea" title="Eliminar" onClick={() => runUndoable('Tarea eliminada', () => handleDeleteTodo(todo.id))}><FaTrash /></button></div></div>
                  </article>
                  {expandedTasks.has(todo.id) && <section className="subtask-panel" aria-label={`Subtareas de ${todo.description}`}><div className="subtask-header"><div><strong>Pasos pequeños</strong><span>{subtasksDone} de {subtasks.length} completados</span></div><button onClick={() => toggleSubtasks(todo.id)} aria-label="Cerrar subtareas"><FaTimes /></button></div>{subtasks.length > 0 && <div className="subtask-progress"><span style={{ width: `${subtasks.length ? Math.round((subtasksDone / subtasks.length) * 100) : 0}%` }} /></div>}<div className="subtask-list">{subtasks.map((subtask) => <div className={`subtask-item ${subtask.done ? 'is-done' : ''}`} key={subtask.id}><button className="subtask-check" onClick={() => toggleSubtask(todo, subtask.id)} aria-label={subtask.done ? 'Marcar paso pendiente' : 'Completar paso'}>{subtask.done && <FaCheck />}</button><span>{subtask.description}</span><button className="subtask-delete" onClick={() => deleteSubtask(todo, subtask.id)} aria-label="Eliminar paso"><FaTimes /></button></div>)}</div><form className="subtask-form" onSubmit={(event) => addSubtask(event, todo)}><FaPlus /><input value={subtaskDrafts[todo.id] ?? ''} onChange={(event) => setSubtaskDrafts((current) => ({ ...current, [todo.id]: event.target.value }))} placeholder="Añadir un paso..." aria-label="Nueva subtarea" maxLength={120} /><button type="submit" disabled={!(subtaskDrafts[todo.id] ?? '').trim()}>Añadir paso</button></form></section>}
                </div>;
              })}
              {filteredTodos.length === 0 && <div className="empty-state"><span><FaInbox /></span><strong>{query ? 'No encontramos tareas' : todos.length ? 'Todo despejado por aquí' : 'Empieza con una pequeña tarea'}</strong><p>{query ? 'Prueba con otras palabras.' : todos.length ? 'Prueba otro filtro o agrega una nueva tarea.' : 'Escribe arriba lo que quieras sacar adelante.'}</p></div>}
            </div>
          </section>
          <footer className="bottom-note"><span>Hecho para avanzar a tu ritmo</span><span><FaCheck /> Guardado automáticamente</span></footer>
        </div>
      </section>
      {undoNotice && <div className="undo-toast" role="status" key={undoNotice.id}><span>{undoNotice.label}</span><button onClick={undo}><FaUndo /> Deshacer <kbd>Ctrl Z</kbd></button><button className="undo-dismiss" onClick={() => { undoSnapshot.current = null; clearTimeout(undoTimer.current); setUndoNotice(null); }} aria-label="Cerrar aviso"><FaTimes /></button></div>}
    </main>
  );
}

export default App;
