import Check from "@/assets/loginAssets/Check.jpg"
import Letter from "@/assets/loginAssets/FallingLetter.jpg"
import Girl from "@/assets/loginAssets/Girl.png"
import Men from "@/assets/loginAssets/Men.jpg"


export function LoginBackground({ children }) {
  return (
    <div className="relative min-h-screen">
      <img src={Check} className="absolute bottom-50 left-80 w-32 opacity-45" />
      <img src={Girl} className="absolute bottom-40 right-60 w-85 opacity-90" />
      <img src={Men} className="absolute top-40 left-40 w-120 opacity-90" />
      <img src={Letter} className="absolute top-70 right-80 w-50 opacity-80" />


      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  )
}
