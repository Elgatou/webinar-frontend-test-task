import { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import { useTodoItems } from "./TodoItemsContext";

const useTodoItemAlertStyles = makeStyles({
  root: {
    marginTop: 10,
  },
});

export const TodoItemsAlert = function () {
  const { error, dispatch } = useTodoItems();

  const classes = useTodoItemAlertStyles();
  const handleClick = useCallback(
    () => dispatch({ type: "closeError", data: "" }),
    [dispatch]
  );

  return (
    <div className={classes.root}>
      {error ? (
        <Alert onClose={handleClick} severity="error">
          Превышено доступное место в localStorage, новая задача не будет
          сохранена
        </Alert>
      ) : null}
    </div>
  );
};
