# Tildin

Tildin es una aplicación web responsive para organizar tareas personales. Permite priorizarlas, añadir subtareas y etiquetas, filtrar la lista y guardar los cambios en el navegador.

**Demo:** [Tildin en Vercel](https://to-do-list-app-con-react-theta.vercel.app/)

## Funciones

- Crear, editar, completar y eliminar tareas.
- Definir fecha límite, prioridad (alta, media o baja) y etiqueta.
- Añadir subtareas y seguir su progreso.
- Filtrar por estado, tareas de hoy y etiqueta; buscar por texto.
- Ordenar por orden manual, fecha de creación, prioridad o fecha límite.
- Reordenar con arrastrar y soltar en escritorio o con controles de movimiento en pantallas pequeñas.
- Deshacer la acción más reciente durante ocho segundos o con `Ctrl+Z` / `Cmd+Z`.
- Usar tema claro u oscuro y una interfaz adaptable a desktop, tablet y móvil.

## Desarrollo

Requiere Node.js y npm.

```sh
npm install
npm run dev
```

Vite imprime en la terminal la dirección local para abrir la app. Para generar y previsualizar la versión de producción:

```sh
npm run build
npm run preview
```

## Tecnologías y estructura

- React 18 y JSX para la interfaz.
- Vite para el servidor de desarrollo y la compilación.
- `useReducer` para las operaciones de tareas y `localStorage` para persistirlas en el navegador.
- CSS responsive y React Icons.

`src/App.jsx` compone la pantalla, `src/hooks/useTodo.js` conecta la interfaz con la persistencia, y `src/todoReducer.js` define las operaciones de la lista. Los estilos principales están en `src/App.css`; los metadatos y favicons se configuran en `index.html` y `public/`.

## Almacenamiento

Las tareas y el tema se guardan localmente en el navegador. Los datos persisten al recargar la página en ese mismo navegador y dispositivo, pero no se sincronizan entre dispositivos ni se respaldan en la nube. Si se borran los datos del sitio en el navegador, las tareas pueden perderse.

## Autor

Nicolas Gomez Cordoba · Córdoba, Argentina

- [LinkedIn](https://www.linkedin.com/in/nicolas-gomez-cordoba)
- [Correo](mailto:jngomezcordoba@gmail.com)
