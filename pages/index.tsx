// // import Link from 'next/link';

// // export default function Home() {
// //   return (
// //     <div style={{ textAlign: 'center', padding: '50px' }}>
// //       <h1>Welcome to TimeChest</h1>
// //       <p>Your time management solution</p>
// //       <div style={{ marginTop: '30px' }}>
// //         <Link href="/login" style={{ marginRight: '15px', padding: '10px 20px', background: '#0070f3', color: 'white', textDecoration: 'none' }}>
// //           Login
// //         </Link>
// //         <Link href="/register" style={{ padding: '10px 20px', background: '#0070f3', color: 'white', textDecoration: 'none' }}>
// //           Register
// //         </Link>
// //       </div>
// //     </div>
// //   );
// // }



// import Link from 'next/link';

// export default function Home() {
//   return (
//     <div style={{ 
//       textAlign: 'center', 
//       padding: '50px',
//       minHeight: '100vh',
//       display: 'flex',
//       flexDirection: 'column',
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: '#f8f9fa'
//     }}>
//       <div style={{ marginBottom: '40px' }}>
//         <h1 style={{ 
//           fontSize: '2.5rem', 
//           fontWeight: '300', 
//           marginBottom: '10px',
//           color: '#333'
//         }}>
//           TimeChest
//         </h1>
//         <p style={{ 
//           color: '#666',
//           fontSize: '1rem',
//           margin: 0
//         }}>
//           Guarda y cuenta
//         </p>
//       </div>
      
//       <div style={{ marginTop: '30px' }}>
//         <Link 
//           href="/login" 
//           style={{ 
//             marginRight: '10px', 
//             padding: '12px 24px', 
//             background: '#0070f3', 
//             color: 'white', 
//             textDecoration: 'none',
//             borderRadius: '6px',
//             fontSize: '14px',
//             display: 'inline-block'
//           }}
//         >
//           Entrar
//         </Link>
//         <Link 
//           href="/register" 
//           style={{ 
//             padding: '12px 24px', 
//             background: 'transparent', 
//             color: '#0070f3', 
//             textDecoration: 'none',
//             border: '1px solid #0070f3',
//             borderRadius: '6px',
//             fontSize: '14px',
//             display: 'inline-block'
//           }}
//         >
//           Registrar
//         </Link>
//       </div>
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
        backgroundColor: "#000000", // fondo base oscuro equilibrado
        fontFamily: "'Inter', sans-serif",
        color: "#e4e4e4",
      }}
    >
      {/* Fondo con imagen central y equilibrio visual */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("/llakascriptHumans.png")`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.60,
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

      {/* Panel central equilibrado */}
      <div
        style={{
          zIndex: 1,
          background:
            "rgba(0, 0, 0, 0.035)", // tono profundo y elegante
          border: "3px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(5px)",
          boxShadow: "0 0 60px rgba(0, 0, 0, 0.45)",
          borderRadius: "20px",
          padding: "60px 70px",
          textAlign: "center",
          maxWidth: "600px",
          width: "90%",
          transition: "all 0.3s ease",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: 700,
            color: "#f5f5f5",
            letterSpacing: "3px",
            marginBottom: "15px",
          }}
        >
          TIMECHEST
        </h1>
        <p
          style={{
            color: "#b5b5b5",
            fontSize: "1.2rem",
            letterSpacing: "1px",
            marginBottom: "40px",
            maxWidth: "90%",
            margin: "0 auto 40px",
          }}
        >
          Guarda y protege tus archivos en un espacio silencioso y seguro.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Botón ENTRAR */}
          <Link
            href="/login"
            style={{
              padding: "14px 40px",
              background: "#e4e4e4",
              color: "#0d0d0f",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "1rem",
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

          {/* Botón REGISTRAR */}
          <Link
            href="/register"
            style={{
              padding: "14px 40px",
              background: "transparent",
              color: "#e4e4e4",
              border: "1px solid #e4e4e4",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "1rem",
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

      {/* Pie sutil */}
      <p
        style={{
          marginTop: "70px",
          fontSize: "0.95rem",
          color: "#6f6f73",
          letterSpacing: "2px",
          zIndex: 1,
        }}
      >
        TU BÓVEDA SILENCIOSA DE DATOS
      </p>
    </div>
  );
}
