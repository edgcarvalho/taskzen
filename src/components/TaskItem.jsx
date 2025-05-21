// src/components/TaskItem.jsx
import React from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function TaskItem({ task }) {
  const toggleDone = async () => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
      done: !task.done,
    });
  };

  const deleteTask = async () => {
    const taskRef = doc(db, "tasks", task.id);
    await deleteDoc(taskRef);
  };

  return (
    <li
      className={`bg-gray-50 p-4 rounded shadow-sm border border-gray-200 ${
        task.done ? "opacity-60 line-through" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">{task.title}</h3>
          <p className="text-sm text-gray-500">
            Prioridade: {task.priority} • {task.estimatedTime} min
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDone}
            className={`text-sm px-3 py-1 rounded ${
              task.done
                ? "bg-yellow-400 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {task.done ? "Desfazer" : "Feito"}
          </button>

          <button
            onClick={deleteTask}
            className="text-sm px-3 py-1 bg-red-500 text-white rounded"
          >
            Excluir
          </button>

          {/* Em breve: botão de editar */}
        </div>
      </div>
    </li>
  );
}
