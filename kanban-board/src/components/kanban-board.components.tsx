import { useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Column, Task } from "../types";
import ColumnContainerComponent from "./column-container.components";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCardComponent from "./task-card.components";
const KanbanBoardComponent = () => {
  const [column, setColumn] = useState<Column[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const columnId = useMemo(() => column.map((col) => col.id), [column]);

  const createTask = (columnId: string) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  };

  const updateTask = (id: string, content: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  };

  const addNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${column.length + 1}`,
    };
    setColumn([...column, columnToAdd]);
  };

  const generateId = () => {
    return Date.now() + "-" + Math.floor(Math.random() * 1001);
  };

  console.log(column);

  const deleteColumn = (id: string) => {
    const filterColumns = column.filter((col) => col.id !== id);
    setColumn(filterColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  };

  const updateColumn = (id: string, title: string) => {
    const newColumns = column.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumn(newColumns);
  };
  const onDragStart = (event: DragStartEvent) => {
    console.log("DRAG START", event);
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumn((column) => {
      const activeColumnIndex = column.findIndex(
        (col) => col.id === activeColumnId
      );

      const overColumnIndex = column.findIndex(
        (col) => col.id === overColumnId
      );
      return arrayMove(column, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeColumnId);
        const overIndex = tasks.findIndex((t) => t.id === overColumnId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeColumnId);

        tasks[activeIndex].columnId = overColumnId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );
  return (
    <>
      <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div className="m-auto flex gap-4">
            <div className="flex gap-4">
              <SortableContext items={columnId}>
                {column.map((col) => (
                  <ColumnContainerComponent
                    key={col.id}
                    column={col}
                    deleteColumn={deleteColumn}
                    updateColumn={updateColumn}
                    createTask={createTask}
                    updateTask={updateTask}
                    tasks={tasks.filter((task) => task.columnId === col.id)}
                    deleteTask={deleteTask}
                  />
                ))}
              </SortableContext>
            </div>
            <button
              onClick={() => {
                addNewColumn();
              }}
              className="h-[60px] w-[350px] bg-mainBackgroundColor border-columnBackgroundColor border-2 rounded-lg cursor-pointer min-w-[350px] p-4 ring-rose-500 hover:ring-2 flex gap-2"
            >
              <FaPlus className="my-auto" />
              Add Column
            </button>
          </div>
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainerComponent
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                />
              )}
              {activeTask && (
                <TaskCardComponent
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </>
  );
};

export default KanbanBoardComponent;
