// src/pages/AddTask.jsx (ou onde o seu formulário de tarefa está)
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection } from "firebase/firestore";

export default function AddTask() {
  const [user] = useAuthState(auth);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "low",
    estimatedTime: 0,
  });

  const handleAddTask = async (e) => {
    e.preventDefault();

    // Verificar se há título e tempo estimado antes de enviar
    if (!newTask.title || newTask.estimatedTime <= 0) return;

    // Adiciona a tarefa no banco de dados
    await addDoc(collection(db, "tasks"), {
      ...newTask,
      uid: user.uid,
    });

    // Limpa os campos do formulário (reseta o estado)
    setNewTask({
      title: "",
      priority: "low",
      estimatedTime: 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Adicionar Tarefa</h2>
      <form onSubmit={handleAddTask} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="title">
            Título da Tarefa
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={newTask.title}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Exemplo: Estudar React"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="priority">
            Prioridade
          </label>
          <select
            id="priority"
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="estimatedTime">
            Tempo Estimado (em minutos)
          </label>
          <input
            id="estimatedTime"
            name="estimatedTime"
            type="number"
            value={newTask.estimatedTime}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            min="1"
            placeholder="Exemplo: 60"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
        >
          Adicionar Tarefa
        </button>
      </form>
    </div>
  );
}
