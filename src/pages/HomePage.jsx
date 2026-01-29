import { useAuth } from "../hooks/useAuth";

export function HomePage() {
    const { loading } = useAuth();

  return (
    <>
      <h1>Currently {loading ? 'loading' : 'LOADED'}</h1>
    </>
  );
}
