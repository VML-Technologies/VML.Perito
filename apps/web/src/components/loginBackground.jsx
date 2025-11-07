import Check from "@/assets/loginAssets/Check.jpg";
import Letter from "@/assets/loginAssets/FallingLetter.jpg";
import Girl from "@/assets/loginAssets/Girl.png";
import Men from "@/assets/loginAssets/Men.jpg";

export function LoginBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50">

      <img
        src={Check}
        className="absolute"
        style={{
          bottom: "14vh",
          left: "15vw",
          width: "5vw",
          opacity: 0.5,
        }}
        alt="Check"
      />
      <img
        src={Girl}
        className="absolute"
        style={{
          bottom: "10vh",
          right: "5vw",
          width: "20vw",
          opacity: 0.9,
        }}
        alt="Girl"
      />
      <img
        src={Men}
        className="absolute"
        style={{
          top: "14vh",
          left: "10vw",
          width: "20vw",
          opacity: 0.7,
        }}
        alt="Men"
      />
      <img
        src={Letter}
        className="absolute"
        style={{
          top: "15vh",
          right: "11vw",
          width: "8vw",
          opacity: 0.6,
        }}
        alt="Letter"
      />


      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {children}
      </div>
    </div>
  );
}
