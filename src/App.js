// Full upgraded Goal Minder App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import { auth, signIn, signOutUser, loadGoals, saveGoals } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const cloudGoals = await loadGoals(firebaseUser.uid);
        setGoals(cloudGoals);
      } else {
        setUser(null);
        setGoals([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      saveGoals(user.uid, goals);
    }
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals, user]);

  useEffect(() => {
    if (!goals || goals.length === 0) {
      setXp(0);
      setStreak(0);
      return;
    }
    let totalXP = 0;
    let today = new Date().toDateString();
    let yesterday = new Date(Date.now() - 86400000).toDateString();
    let streakCount = 0;
    const todayGoals = goals.filter(g => g.completed && new Date(g.completedAt).toDateString() === today);
    const yesterdayGoals = goals.filter(g => g.completed && new Date(g.completedAt).toDateString() === yesterday);
    goals.forEach(g => totalXP += g.xpEarned);
    if (todayGoals.length > 0) streakCount++;
    if (yesterdayGoals.length > 0) streakCount++;
    setXp(totalXP);
    setStreak(streakCount);
  }, [goals]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    const trimmed = newGoal.trim();
    if (trimmed && newDueDate) {
      setGoals([...goals, {
        text: trimmed,
        completed: false,
        dueDate: newDueDate,
        createdAt: Date.now(),
        completedAt: null,
        xpEarned: 0
      }]);
      setNewGoal('');
      setNewDueDate('');
    }
  };

  const toggleComplete = (index) => {
    const updated = [...goals];
    updated[index].completed = !updated[index].completed;
    updated[index].completedAt = updated[index].completed ? Date.now() : null;
    updated[index].xpEarned = updated[index].completed ? 10 : 0;
    setGoals(updated);
  };

  const deleteGoal = (index) => {
    const updated = goals.filter((_, i) => i !== index);
    setGoals(updated);
  };

  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const finishEditing = () => {
    if (editingText.trim()) {
      const updated = [...goals];
      updated[editingIndex].text = editingText.trim();
      setGoals(updated);
    }
    setEditingIndex(null);
    setEditingText('');
  };

  const isOverdue = (dueDate) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  const getProgress = () => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(goal => goal.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  const filteredGoals = goals
    .filter(goal => {
      if (filter === 'all') return true;
      if (filter === 'completed') return goal.completed;
      if (filter === 'active') return !goal.completed;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
      if (sort === 'az') return a.text.localeCompare(b.text);
      if (sort === 'za') return b.text.localeCompare(a.text);
      return 0;
    });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`app ${theme}`}>
      <h1 className="title">🎯 Goal Minder</h1>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Dark Mode' : '🌞 Light Mode'}
      </button>

      {user ? (
        <>
          <p className="welcome">Welcome, {user.displayName}</p>
          <button className="auth-button" onClick={signOutUser}>Logout</button>

          <div className="dashboard">
            <p>🔥 XP: {xp}</p>
            <p>🔥 Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
          </div>

          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${getProgress()}%` }} />
            <div className="progress-label">{getProgress()}% Complete</div>
          </div>

          <form onSubmit={handleAddGoal} className="goal-form">
            <input type="text" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Enter your goal..." className="goal-input" />
            <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="goal-date" />
            <button type="submit" className="add-button">➕ Add Goal</button>
          </form>

          <div className="controls">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Goals</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="dueDate">Sort by Due Date</option>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
            </select>
          </div>

          <ul className="goal-list">
            {filteredGoals.map((goal, index) => (
              <li key={index} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleComplete(index)}
                />
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                    autoFocus
                  />
                ) : (
                  <div className="goal-info" onDoubleClick={() => startEditing(index, goal.text)}>
                    <span>{goal.text}</span>
                    <small className={`due-date ${isOverdue(goal.dueDate) ? 'overdue' : ''}`}>Due: {goal.dueDate}</small>
                  </div>
                )}
                <button className="delete-button" onClick={() => deleteGoal(index)}>🗑️</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p>Sign in to access your goals.</p>
          <button className="auth-button" onClick={signIn}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}

export default App;
