import Background from '../assets/loginAssets/Movilidad.png';  

export function LoginBackground({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {children}
      </div>
    </div>
  );
}
