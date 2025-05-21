import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import TaskItem from "../components/TaskItem";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [excessLoadWarning, setExcessLoadWarning] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "low",
    estimatedTime: "",
  });
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTime, setBreakTime] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [pauseDismissed, setPauseDismissed] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    const estimated = parseInt(newTask.estimatedTime);
    if (!newTask.title || isNaN(estimated) || estimated <= 0 || isOnBreak) return;

    await addDoc(collection(db, "tasks"), {
      title: newTask.title,
      priority: newTask.priority,
      estimatedTime: estimated,
      uid: user.uid,
    });

    setNewTask({
      title: "",
      priority: "low",
      estimatedTime: "",
    });
  };

  const handleTakeBreak = (time) => {
    const minutes = parseInt(time);
    if (isNaN(minutes) || minutes < 1) return;

    setBreakTime(minutes);
    setRemainingTime(minutes * 60);
    setIsOnBreak(true);
    setShowBreakModal(false);
    setPauseDismissed(false);
  };

  useEffect(() => {
    let interval;
    if (isOnBreak && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsOnBreak(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnBreak, remainingTime]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);

      const totalTime = tasksData.reduce((total, task) => total + task.estimatedTime, 0);
      const shouldShowModal = totalTime > 480 && !isOnBreak && !pauseDismissed;

      setExcessLoadWarning(totalTime > 480);
      setShowBreakModal(shouldShowModal);
    });

    return () => unsubscribe();
  }, [user, isOnBreak, pauseDismissed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Olá, {user?.displayName} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sair
        </button>
      </header>

      {isOnBreak && (
        <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-4 rounded-lg mb-4 text-center font-semibold">
          ⏳ Pausa ativa: {formatTime(remainingTime)}
        </div>
      )}

      <main>
        {/* Formulário de adicionar tarefa */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Adicionar Tarefa</h2>
          <form onSubmit={handleAddTask}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Ex: Estudar React"
                disabled={isOnBreak}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Prioridade</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                disabled={isOnBreak}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Tempo Estimado (min)
              </label>
              <input
                type="number"
                value={newTask.estimatedTime}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    estimatedTime: e.target.value,
                  })
                }
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                disabled={isOnBreak}
                min={1}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={isOnBreak}
            >
              Adicionar Tarefa
            </button>
          </form>
        </div>

        {/* Lista de tarefas */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Suas Tarefas</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500">Ainda não há tarefas cadastradas.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Modal de pausa */}
      {showBreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Hora da Pausa!</h2>
            <p className="mb-4">
              Você excedeu o tempo diário recomendado de tarefas. Quer fazer uma pausa agora?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Tempo de Pausa (min)
              </label>
              <input
                type="number"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Minutos"
                onChange={(e) => setBreakTime(e.target.value)}
                value={breakTime}
                min={1}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowBreakModal(false);
                  setPauseDismissed(true);
                }}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Não, obrigado
              </button>
              <button
                onClick={() => handleTakeBreak(breakTime)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Sim, iniciar pausa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
