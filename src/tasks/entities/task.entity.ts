export enum TaskStatus {
  PENDING = 'pending',
  DONE = 'done',
}

export class Task {
  id: string;
  title: string;
  status: TaskStatus;
}
