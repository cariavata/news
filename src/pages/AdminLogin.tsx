import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAppStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'cariavata' && password === 'dudwls3098!!') {
      login();
      navigate('/admin');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-serif font-bold text-center text-slate-900 mb-8">관리자 로그인</h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-6 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">아이디</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-md hover:bg-slate-800 transition mt-2">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
