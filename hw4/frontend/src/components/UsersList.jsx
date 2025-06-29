export function UsersList({ users }) {
  return (
    <pre style={preStyle}>
      {JSON.stringify(users, null, 2)}
    </pre>
  );
}
const preStyle = { background:'#f0f0f0', padding:16, borderRadius:4 };