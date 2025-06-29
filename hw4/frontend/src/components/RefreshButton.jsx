export function RefreshButton({ onClick, loading }) {
  return (
    <button onClick={onClick} style={btnStyle} disabled={loading}>
      {loading ? '…' : 'Refresh'}
    </button>
  );
}
const btnStyle = {
  padding:'6px 12px', border:'1px solid #888',
  borderRadius:4, background:'#f5f5f5', cursor:'pointer'
};