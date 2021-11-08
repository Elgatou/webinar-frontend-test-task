import { createContext, ReactNode, useContext, useEffect } from "react";
import { useImmerReducer } from "use-immer";

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  done: boolean;
  index?: number;
}

interface TodoItemsState {
  todoItems: TodoItem[];
  error: boolean;
}

interface TodoItemsAction {
  type:
    | "loadState"
    | "add"
    | "delete"
    | "toggleDone"
    | "showError"
    | "closeError"
    | "dragAndDrop";
  data: any;
}

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState = { todoItems: [], error: false };
const localStorageKey = "todoListState";

export const TodoItemsContextProvider = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const [state, dispatch] = useImmerReducer(todoItemsReducer, defaultState);

  useEffect(() => {
    function loadState() {
      const savedState = localStorage.getItem(localStorageKey);

      if (savedState) {
        try {
          dispatch({ type: "loadState", data: JSON.parse(savedState) });
        } catch {}
      }
    }

    loadState();
    window.addEventListener("storage", (e) => loadState());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(state.todoItems));
    } catch (error) {
      dispatch({ type: "showError", data: error.message });
    }
  }, [state.todoItems]);

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TodoItemsContext.Provider>
  );
};

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext);

  if (!todoItemsContext) {
    throw new Error(
      "useTodoItems hook should only be used inside TodoItemsContextProvider"
    );
  }

  return todoItemsContext;
};

function todoItemsReducer(draft: TodoItemsState, action: TodoItemsAction) {
  const index = action.data.index;

  switch (action.type) {
    case "loadState": {
      draft.todoItems = action.data;
      break;
    }

    case "add":
      draft.todoItems.unshift({
        id: generateId(),
        done: false,
        ...action.data.todoItem,
      });
      break;

    case "delete":
      draft.todoItems.splice(index, 1);
      break;

    case "toggleDone":
      draft.todoItems[index].done = !draft.todoItems[index].done;
      break;

    case "dragAndDrop":
      const { source, destination } = action.data;
      if (destination) {
        [draft.todoItems[source.index], draft.todoItems[destination.index]] = [
          draft.todoItems[destination.index],
          draft.todoItems[source.index],
        ];
      }
      break;

    case "showError":
      draft.error = true;
      break;

    case "closeError":
      draft.error = false;
      break;

    default:
      throw new Error();
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e16
  ).toString(36)}`;
}
