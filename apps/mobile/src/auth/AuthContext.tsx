import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = '@presenca-agro/auth';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export interface AuthUser {
  nome: string;
  email: string;
}

type Status = 'loading' | 'authed' | 'guest';

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (dados: { nome: string; email: string; senha: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth MOCK do protótipo: não há backend. Persiste apenas o usuário em
 * AsyncStorage (mesmo padrão de src/data/storage.ts). Aceita qualquer
 * credencial bem formada — a validação aqui é só de forma, não de segurança.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { user?: AuthUser };
          if (parsed?.user?.email) {
            setUser(parsed.user);
            setStatus('authed');
            return;
          }
        }
      } catch (error) {
        console.warn('[auth] Falha ao ler sessão:', error);
      }
      setStatus('guest');
    })();
  }, []);

  async function persist(u: AuthUser) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
    } catch (error) {
      console.warn('[auth] Falha ao salvar sessão:', error);
    }
    setUser(u);
    setStatus('authed');
  }

  async function signIn(email: string, senha: string) {
    const e = email.trim();
    if (!e || !senha) throw new Error('Preencha e-mail e senha.');
    if (!EMAIL_RE.test(e)) throw new Error('E-mail inválido.');
    await persist({ nome: nomeDoEmail(e), email: e });
  }

  async function signUp({
    nome,
    email,
    senha,
  }: {
    nome: string;
    email: string;
    senha: string;
  }) {
    const n = nome.trim();
    const e = email.trim();
    if (!n || !e || !senha) throw new Error('Preencha todos os campos.');
    if (!EMAIL_RE.test(e)) throw new Error('E-mail inválido.');
    await persist({ nome: n, email: e });
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[auth] Falha ao limpar sessão:', error);
    }
    setUser(null);
    setStatus('guest');
  }

  return (
    <AuthContext.Provider value={{ status, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Deriva um nome legível a partir do e-mail (mock, p/ exibir na home). */
function nomeDoEmail(email: string): string {
  const base = email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? '';
  const titulo = base.replace(/\b\w/g, (c) => c.toUpperCase());
  return titulo || 'Consultor';
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
