import { useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { TodoItem, useTodoItems } from "./TodoItemsContext";

const spring = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  duration: 0.25,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: "none",
    padding: 0,
  },
});

export const TodoItemsList = function () {
  const { todoItems, dispatch } = useTodoItems();

  const classes = useTodoItemListStyles();

  const indexedItems = todoItems.slice().map((e, i) => ({ ...e, index: i }));
  const sortedItems = indexedItems.slice().sort((a, b) => {
    if (a.done && !b.done) {
      return 1;
    }

    if (!a.done && b.done) {
      return -1;
    }

    return 0;
  });

  function onDragEnd(result: DropResult) {
    dispatch({ type: "dragAndDrop", data: result });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={"list-1"}>
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={classes.root}
          >
            {sortedItems.map((item) => (
              <motion.li key={item.id} transition={spring} layout={false}>
                <TodoItemCard item={item} />
              </motion.li>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: "line-through",
    color: "#888888",
  },
});

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const classes = useTodoItemCardStyles();
  const { dispatch } = useTodoItems();

  const handleDelete = useCallback(
    () => dispatch({ type: "delete", data: { index: item.index } }),
    [item.index, dispatch]
  );

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: "toggleDone",
        data: { index: item.index },
      }),
    [item.index, dispatch]
  );

  return (
    <Draggable draggableId={item.id} index={item.index!}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={classnames(classes.root, {
            [classes.doneRoot]: item.done,
          })}
        >
          <CardHeader
            action={
              <IconButton aria-label="delete" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            }
            title={
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.done}
                    onChange={handleToggleDone}
                    name={`checked-${item.id}`}
                    color="primary"
                  />
                }
                label={item.title}
              />
            }
          />
          {item.details ? (
            <CardContent>
              <Typography variant="body2" component="p">
                {item.details}
              </Typography>
            </CardContent>
          ) : null}
        </Card>
      )}
    </Draggable>
  );
};
