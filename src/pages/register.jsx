import RegisterForm from '../elements/registerForm';
export default function Register() {
  return (
   <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '18px',
      width: '100%',
      height: '100vh',
      margin: '0',
      padding: '0',
      background: 'linear-gradient(229deg, #FFF8EF 49.21%, rgba(156, 155, 152, 0.84) 87.68%)',
    }}>

      <RegisterForm />
    </div>
  );
}
