"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Registro exitoso... redirigiendo");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.message || "Error al registrarse");
      }
    } catch {
      setMessage("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000000",
        fontFamily: "'Inter', sans-serif",
        color: "#e4e4e4",
      }}
    >
      {/* Fondo equilibrado igual que Home y Login */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("/llakascriptHumans.png")`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.6,
          filter: "blur(1px) brightness(0.9)",
          zIndex: 0,
        }}
      />

      {/* Luz radial sutil */}
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

      {/* Panel del formulario */}
      <div
        style={{
          zIndex: 1,
          background: "rgba(0, 0, 0, 0.035)",
          border: "3px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(5px)",
          boxShadow: "0 0 60px rgba(0, 0, 0, 0.45)",
          borderRadius: "20px",
          padding: "50px 60px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "#f5f5f5",
            marginBottom: "30px",
          }}
        >
          Crear Cuenta
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                outline: "none",
                fontSize: "15px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                outline: "none",
                fontSize: "15px",
              }}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                outline: "none",
                fontSize: "15px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: "#e4e4e4",
              color: "#0d0d0f",
              border: "none",
              fontWeight: 600,
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#b5b5b5")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#e4e4e4")
            }
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <span style={{ color: "#aaa" }}>¿Ya tienes cuenta?</span>
          <Link href="/login" style={{ color: "#e4e4e4" }}>
            Iniciar sesión
          </Link>
        </div>

        {message && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: message.includes("exitoso") ? "#90ee90" : "#ff6961",
              fontSize: "14px",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
