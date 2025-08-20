export default function AccountBalance({ account }) {
  if (!account || typeof account.balance === 'undefined') {
    return <span>Account balance unavailable</span>;
  }
  return (
    <span>{`₹${parseFloat(account.balance).toFixed(2)}`}</span>
  );
}