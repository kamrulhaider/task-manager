import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  type Unsubscribe,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, TaskPriority, TaskStatus } from '@/types';

type TaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
type TaskUpdateData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>;

const getTasksCollection = (userId: string) => collection(db, 'users', userId, 'tasks');

export const addTask = (userId: string, task: Omit<TaskData, 'userId'>) => {
  const tasksCollection = getTasksCollection(userId);
  return addDoc(tasksCollection, {
    ...task,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateTask = (userId: string, taskId: string, task: TaskUpdateData) => {
  const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
  return updateDoc(taskDoc, {
    ...task,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTask = (userId: string, taskId: string) => {
  const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
  return deleteDoc(taskDoc);
};

interface GetTasksOptions {
  priority?: TaskPriority | 'all';
}

export const onTasksUpdate = (
  userId: string,
  options: GetTasksOptions,
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  const tasksCollection = getTasksCollection(userId);
  
  let q: Query<DocumentData> = query(tasksCollection, orderBy('createdAt', 'desc'));

  if (options.priority && options.priority !== 'all') {
    q = query(q, where('priority', '==', options.priority));
  }

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
    callback(tasks);
  });

  return unsubscribe;
};
