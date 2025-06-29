import {CreateUserForm} from '../components/CreateUserForm.jsx';
import {UsersList}      from '../components/UsersList.jsx';
import {RefreshButton}  from '../components/RefreshButton.jsx';
import { useUsers }   from '../hooks/useUsers.js';

export default function Home() {
  const { users, loading, error, refresh, add } = useUsers();

  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <CreateUserForm onSubmit={add} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px'
      }}>
        <RefreshButton onClick={refresh} loading={loading} />
        {error && <span className="text-red-600 text-sm">{error.message}</span>}
      </div>

      <UsersList users={users} />
    </main>
  );
}