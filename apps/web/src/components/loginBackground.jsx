import Background from '../assets/loginAssets/Movilidad.png';  

export function LoginBackground({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={Background}
        alt="Login Background"
        className="absolute inset-0 w-full h-full object-cover opacity-75"
        style={{ objectPosition: 'center 80%' }} 
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {children}
      </div>
    </div>
  );
}
