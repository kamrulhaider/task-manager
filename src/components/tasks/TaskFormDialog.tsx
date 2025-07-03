'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addTask, updateTask } from '@/lib/tasks';
import { suggestTaskTitle } from '@/app/actions';
import type { Task, TaskPriority, TaskStatus } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().nullable(),
});

type TaskFormValues = z.infer<typeof formSchema>;

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskFormDialog({ isOpen, onClose, task }: TaskFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        ...task,
        dueDate: task.dueDate ? task.dueDate.toDate() : null,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
      });
    }
  }, [task, form]);

  const handleSuggestTitle = async () => {
    const description = form.getValues('description');
    if (!description || description.trim().length < 10) {
      toast({ variant: 'destructive', title: 'Please provide a longer description to suggest a title.'});
      return;
    }
    setIsSuggesting(true);
    try {
      const suggestedTitle = await suggestTaskTitle(description);
      if (suggestedTitle) {
        form.setValue('title', suggestedTitle, { shouldValidate: true });
        toast({ title: 'Title suggestion applied!' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to suggest title.' });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const taskData = {
        ...values,
        dueDate: values.dueDate ? Timestamp.fromDate(values.dueDate) : null,
      };

      if (task) {
        await updateTask(user.uid, task.id, taskData);
        toast({ title: 'Task updated successfully!' });
      } else {
        await addTask(user.uid, { ...taskData, userId: user.uid });
        toast({ title: 'Task created successfully!' });
      }
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'An error occurred', description: 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Design the new landing page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea placeholder="Add more details about the task..." {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-1 right-1 h-7 w-7"
                      onClick={handleSuggestTitle}
                      disabled={isSuggesting}
                      title="Suggest Title with AI"
                    >
                      {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> :<Wand2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0,0,0,0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
