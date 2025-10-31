
// "use client";
// import Link from "next/link";

// export default function Home() {
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         position: "relative",
//         overflow: "hidden",
//         backgroundColor: "#000000", // fondo base oscuro equilibrado
//         fontFamily: "'Inter', sans-serif",
//         color: "#e4e4e4",
//       }}
//     >
//       {/* Fondo con imagen central y equilibrio visual */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage: `url("/llakascriptHumans.png")`,
//           backgroundSize: "contain",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "center",
//           opacity: 0.60,
//           filter: "blur(1px) brightness(0.9)",
//           zIndex: 0,
//         }}
//       />

//       {/* Sombra radial sutil */}
//       <div
//         style={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           width: "1200px",
//           height: "1200px",
//           transform: "translate(-50%, -50%)",
//           background:
//             "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
//           zIndex: 0,
//         }}
//       />

//       {/* Panel central equilibrado */}
//       <div
//         style={{
//           zIndex: 1,
//           background:
//             "rgba(0, 0, 0, 0.035)", // tono profundo y elegante
//           border: "3px solid rgba(255,255,255,0.2)",
//           backdropFilter: "blur(5px)",
//           boxShadow: "0 0 60px rgba(0, 0, 0, 0.45)",
//           borderRadius: "20px",
//           padding: "60px 70px",
//           textAlign: "center",
//           maxWidth: "600px",
//           width: "90%",
//           transition: "all 0.3s ease",
//         }}
//       >
//         <h1
//           style={{
//             fontSize: "3.5rem",
//             fontWeight: 700,
//             color: "#f5f5f5",
//             letterSpacing: "3px",
//             marginBottom: "15px",
//           }}
//         >
//           TIMECHEST
//         </h1>
//         <p
//           style={{
//             color: "#b5b5b5",
//             fontSize: "1.2rem",
//             letterSpacing: "1px",
//             marginBottom: "40px",
//             maxWidth: "90%",
//             margin: "0 auto 40px",
//           }}
//         >
//           Guarda y protege tus archivos en un espacio silencioso y seguro.
//         </p>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: "20px",
//             flexWrap: "wrap",
//           }}
//         >
//           {/* Botón ENTRAR */}
//           <Link
//             href="/login"
//             style={{
//               padding: "14px 40px",
//               background: "#e4e4e4",
//               color: "#0d0d0f",
//               borderRadius: "6px",
//               fontWeight: 600,
//               fontSize: "1rem",
//               textDecoration: "none",
//               transition: "all 0.3s ease",
//             }}
//             onMouseEnter={(e) => {
//               (e.currentTarget as HTMLElement).style.background = "#b5b5b5";
//             }}
//             onMouseLeave={(e) => {
//               (e.currentTarget as HTMLElement).style.background = "#e4e4e4";
//             }}
//           >
//             ENTRAR
//           </Link>

//           {/* Botón REGISTRAR */}
//           <Link
//             href="/register"
//             style={{
//               padding: "14px 40px",
//               background: "transparent",
//               color: "#e4e4e4",
//               border: "1px solid #e4e4e4",
//               borderRadius: "6px",
//               fontWeight: 600,
//               fontSize: "1rem",
//               textDecoration: "none",
//               transition: "all 0.3s ease",
//             }}
//             onMouseEnter={(e) => {
//               (e.currentTarget as HTMLElement).style.background = "#e4e4e4";
//               (e.currentTarget as HTMLElement).style.color = "#0d0d0f";
//             }}
//             onMouseLeave={(e) => {
//               (e.currentTarget as HTMLElement).style.background = "transparent";
//               (e.currentTarget as HTMLElement).style.color = "#e4e4e4";
//             }}
//           >
//             REGISTRAR
//           </Link>
//         </div>
//       </div>

//       {/* Pie sutil */}
//       <p
//         style={{
//           marginTop: "70px",
//           fontSize: "0.95rem",
//           color: "#6f6f73",
//           letterSpacing: "2px",
//           zIndex: 1,
//         }}
//       >
//         TU BÓVEDA SILENCIOSA DE DATOS
//       </p>
//     </div>
//   );
// }



"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000000",
        fontFamily: "'Inter', sans-serif",
        color: "#e4e4e4",
        padding: "20px",
      }}
    >
      {/* Fondo con imagen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("/llakascriptHumans.png")`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.55,
          filter: "blur(1px) brightness(0.9)",
          zIndex: 0,
        }}
      />

      {/* Sombra radial sutil */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "1200px",
          height: "1200px",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* Panel central */}
      <div
        style={{
          zIndex: 1,
          background: "rgba(0, 0, 0, 0.05)",
          border: "2px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 0 60px rgba(0, 0, 0, 0.45)",
          borderRadius: "20px",
          padding: "40px 50px",
          textAlign: "center",
          width: "100%",
          maxWidth: "600px",
          transition: "all 0.3s ease",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
            fontWeight: 700,
            color: "#f5f5f5",
            letterSpacing: "2px",
            marginBottom: "15px",
          }}
        >
          TIMECHEST
        </h1>

        <p
          style={{
            color: "#b5b5b5",
            fontSize: "clamp(1rem, 3.5vw, 1.2rem)",
            letterSpacing: "1px",
            marginBottom: "35px",
            maxWidth: "90%",
            margin: "0 auto 35px",
            lineHeight: 1.5,
          }}
        >
          Guarda y protege tus archivos en un espacio silencioso y seguro.
        </p>

        {/* Botones */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* ENTRAR */}
          <Link
            href="/login"
            style={{
              padding: "12px 36px",
              background: "#e4e4e4",
              color: "#0d0d0f",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "clamp(0.95rem, 3vw, 1rem)",
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#b5b5b5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#e4e4e4";
            }}
          >
            ENTRAR
          </Link>

          {/* REGISTRAR */}
          <Link
            href="/register"
            style={{
              padding: "12px 36px",
              background: "transparent",
              color: "#e4e4e4",
              border: "1px solid #e4e4e4",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "clamp(0.95rem, 3vw, 1rem)",
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#e4e4e4";
              (e.currentTarget as HTMLElement).style.color = "#0d0d0f";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#e4e4e4";
            }}
          >
            REGISTRAR
          </Link>
        </div>
      </div>

      {/* Pie de página */}
      <p
        style={{
          marginTop: "60px",
          fontSize: "clamp(0.85rem, 2.5vw, 0.95rem)",
          color: "#6f6f73",
          letterSpacing: "1.5px",
          zIndex: 1,
          textAlign: "center",
          maxWidth: "90%",
          lineHeight: 1.4,
        }}
      >
        TU BÓVEDA SILENCIOSA DE DATOS
      </p>

      {/* Estilos responsivos adicionales */}
      <style jsx>{`
        @media (max-width: 600px) {
          div[style*="padding: 40px 50px"] {
            padding: 30px 25px !important;
          }

          h1 {
            letter-spacing: 1.5px !important;
          }

          p {
            margin-bottom: 25px !important;
          }

          a {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 400px) {
          div[style*="padding: 40px 50px"] {
            padding: 25px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
