'use client';

import { useState } from 'react';
import type { Task, TaskPriority } from '@/types';
import { MoreVertical, Edit, Trash2, Calendar, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { deleteTask, updateTask } from '@/lib/tasks';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
}

const priorityMap: Record<TaskPriority, { label: string; color: string; icon: React.ReactNode }> = {
  low: { label: 'Low', color: 'bg-green-500', icon: <Flame className="h-3 w-3" /> },
  medium: { label: 'Medium', color: 'bg-yellow-500', icon: <Flame className="h-3 w-3" /> },
  high: { label: 'High', color: 'bg-red-500', icon: <Flame className="h-3 w-3" /> },
};


export function TaskCard({ task, onEditTask }: TaskCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteTask(user.uid, task.id);
      toast({ title: 'Task deleted successfully!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting task', description: 'Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const priorityInfo = priorityMap[task.priority];

  return (
    <Card className="bg-card hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start justify-between p-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold leading-tight">{task.title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </CardDescription>
        </div>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            <span>{format(task.dueDate.toDate(), 'MMM d, yyyy')}</span>
          </div>
        )}
        <Badge variant="outline" className={`capitalize border-0 text-white ${priorityInfo.color}`}>
          {priorityInfo.label}
        </Badge>
      </CardFooter>
    </Card>
  );
}
