import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(action: 'login' | 'signup') {
    setLoading(true);
    setMessage(null);
    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('注册成功，请查收邮件完成验证后登录。');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('登录成功。');
      }
    } catch (e: any) {
      setMessage(e?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2 max-w-md">
      {message && (
        <div>
          <strong>{message}</strong>
        </div>
      )}
      <input className="input input-bordered" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" required />
      <input className="input input-bordered" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" required />
      <div className="flex gap-2">
        <button disabled={loading} className="btn btn-primary" onClick={() => onSubmit('login')}>登录</button>
        <button disabled={loading} className="btn" onClick={() => onSubmit('signup')}>注册</button>
      </div>
    </div>
  );
}


