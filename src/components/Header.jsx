import { Link } from "react-router-dom"
import useProyectos from "../hooks/useProyectos"
import useAuth from "../hooks/useAuth"
import Busqueda from "./Busqueda"


const Header = () => {

    const { handleBuscador, cerrarSesionProyectos } = useProyectos()
    const { cerrarSesionAuth } = useAuth()

    const handleCerrarSesion = () => {
        if (confirm("¿Deseas cerrar sesión?")) {
            cerrarSesionAuth()
            cerrarSesionProyectos()
            localStorage.removeItem("token")
        } else { 
            
        }
    }

  return (
    <header className="px-4 py-5 bg-white border-b">
        <div className="md:flex md:justify-between">
            <h2 className="text-4xl text-sky-600 font-black text-center mb-5 md:mb-0">
                <Link to={"/proyectos"}>
                    UpTask
                </Link> 
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <button type="button" className="font-bold uppercase flex items-center" onClick={handleBuscador}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                    Buscar  Proyecto</button>
                <Link
                    to="/proyectos"
                    className="font-bold uppercase"
                >Proyectos</Link>
                <button
                    type="button"
                    className="text-white text-sm bg-sky-600 p-3 rounded-md uppercase font-bold"
                    onClick={handleCerrarSesion}
                >
                    Cerrar Sesión
                </button>

                <Busqueda />
            </div>
        </div>
    </header>
  )
}

export default Header