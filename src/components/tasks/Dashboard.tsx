'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { onTasksUpdate } from '@/lib/tasks';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { Header } from '@/components/layout/Header';
import { TaskColumn } from './TaskColumn';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TaskFormDialog } from './TaskFormDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const columns: TaskStatus[] = ['todo', 'in-progress', 'done'];
const priorities: (TaskPriority | 'all')[] = ['all', 'low', 'medium', 'high'];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{ priority: TaskPriority | 'all' }>({ priority: 'all' });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onTasksUpdate(user.uid, filters, setTasks);
    return () => unsubscribe();
  }, [user, filters]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleAddNewTask = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
  };
  
  const handlePriorityChange = (priority: TaskPriority | 'all') => {
    setFilters(prev => ({ ...prev, priority }));
  }

  if (!user) {
    return null; // AuthProvider handles redirect
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="container mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold font-headline">Your Tasks</h1>
            <div className="flex items-center gap-2">
               <Select onValueChange={handlePriorityChange} defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <Button onClick={handleAddNewTask}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {columns.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                onEditTask={handleEditTask}
              />
            ))}
          </div>
        </div>
      </main>
      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        task={selectedTask}
      />
    </div>
  );
}
