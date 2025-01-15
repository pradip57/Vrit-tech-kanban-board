export type Column = {
  id: number | string;
  title: string;
};

export type Task = {
  id: number | string;
  columnId: number | string;
  content: string;
};
