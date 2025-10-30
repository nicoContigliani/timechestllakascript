import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to TimeChest</h1>
      <p>Your time management solution</p>
      <div style={{ marginTop: '30px' }}>
        <Link href="/login" style={{ marginRight: '15px', padding: '10px 20px', background: '#0070f3', color: 'white', textDecoration: 'none' }}>
          Login
        </Link>
        <Link href="/register" style={{ padding: '10px 20px', background: '#0070f3', color: 'white', textDecoration: 'none' }}>
          Register
        </Link>
      </div>
    </div>
  );
}