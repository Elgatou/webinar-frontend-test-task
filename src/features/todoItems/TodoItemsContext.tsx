import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  done: boolean;
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
    | "closeError";
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
  const [state, dispatch] = useReducer(todoItemsReducer, defaultState);

  useEffect(() => {
    const savedState = localStorage.getItem(localStorageKey);

    if (savedState) {
      try {
        dispatch({ type: "loadState", data: JSON.parse(savedState) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    const mockState = JSON.stringify(spamLocalStorage());

    function spamLocalStorage() {
      return Array.from(Array(100000).keys()).map((e) => ({
        id: e,
        title: "some title",
        details: "some details",
        done: false,
      }));
    }

    try {
      //localStorage.setItem(localStorageKey, JSON.stringify(state.todoItems));
      localStorage.setItem(localStorageKey, JSON.stringify(mockState));
    } catch (error) {
      console.log(error.message);
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

function todoItemsReducer(state: TodoItemsState, action: TodoItemsAction) {
  switch (action.type) {
    case "loadState": {
      return { ...state, todoItems: action.data };
    }
    case "add":
      return {
        ...state,
        todoItems: [
          { id: generateId(), done: false, ...action.data.todoItem },
          ...state.todoItems,
        ],
      };
    case "delete":
      return {
        ...state,
        todoItems: state.todoItems.filter(({ id }) => id !== action.data.id),
      };
    case "toggleDone":
      const itemIndex = state.todoItems.findIndex(
        ({ id }) => id === action.data.id
      );
      const item = state.todoItems[itemIndex];

      return {
        ...state,
        todoItems: [
          ...state.todoItems.slice(0, itemIndex),
          { ...item, done: !item.done },
          ...state.todoItems.slice(itemIndex + 1),
        ],
      };
    case "showError":
      return { ...state, error: true };

    case "closeError":
      return { ...state, error: false };
    default:
      throw new Error();
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e16
  ).toString(36)}`;
}
