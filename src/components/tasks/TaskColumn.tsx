'use client';

import type { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const statusMap: Record<TaskStatus, { title: string; color: string }> = {
  todo: { title: 'To Do', color: 'bg-blue-500' },
  'in-progress': { title: 'In Progress', color: 'bg-yellow-500' },
  done: { title: 'Done', color: 'bg-green-500' },
};

export function TaskColumn({ status, tasks, onEditTask }: TaskColumnProps) {
  const { title, color } = statusMap[status];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium font-headline flex items-center">
           <span className={`w-3 h-3 rounded-full mr-2 ${color}`}></span>
          {title}
        </CardTitle>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {tasks.length}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 pt-0">
        <div className="space-y-2 pt-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEditTask={onEditTask} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-8 text-center h-48">
              <p className="text-sm text-muted-foreground">No tasks here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
