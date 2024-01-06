import { useState, createContext, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";
import { useNavigate } from "react-router-dom"
import useAuth from "../hooks/useAuth";
import io from "socket.io-client"

let socket;

const ProyectosContext = createContext()

const ProyectosProvider = ({children}) => {
    const [proyectos,setProyectos] = useState([])
    const [alerta,setAlerta] = useState({})
    const [proyecto,setProyecto] = useState({})
    const [cargando,setCargando] = useState(false)
    const [modalFormularioTarea,setModalFormularioTarea] = useState(false)
    const [modalEliminarTarea,setModalEliminarTarea] = useState(false)
    const [modalEliminarColaborador,setModalEliminarColaborador] = useState(false)
    const [tarea,setTarea] = useState({})
    const [colaborador,setColaborador] = useState({})
    const [buscador,setBuscador] = useState(false)
    

    const navigate = useNavigate()
    const { auth } = useAuth()

    useEffect(() => {
      const obtenerProyectos = async () => {
        try {
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                 headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${token}`
                 }
            }
            const { data } = await clienteAxios("/proyectos", config)
            setProyectos(data)  
        } catch (error) {
            console.log(error)
        }
      }
      obtenerProyectos()
    }, [auth]) //soluciona evitar recargar para que aparezcan los proyectos

    //Encargado de la Conexión a Socket io
    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL)
    }, [])
    
    

    const mostrarAlerta = alerta => {
        setAlerta(alerta)

        setTimeout(() => {
            setAlerta({})
        }, 5000);
    }

    const submitProyecto = async proyecto => {
        if(proyecto.id){
          await editarProyecto(proyecto)
        } else {
          await nuevoProyecto(proyecto)
        }
        return
    }

    const editarProyecto = async proyecto => {
        try {
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                 headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${token}`
                 }
            }

            const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`,proyecto,config)
            //Sincronizar el state
            const proyectosActualizados = proyectos.map(proyectoState => proyectoState._id === data._id ? data : proyectoState)
            setProyectos(proyectosActualizados)
            //Mostrar la alerta
            setAlerta({
                msg: "Proyecto Actualizado Correctamente",
                error: false
               })
            //Redireccionar
               setTimeout(() => {
                setAlerta({})
                navigate("/proyectos")
               }, 3000);
            
        } catch (error) {
            console.log(error)
        }
    }

    const nuevoProyecto = async proyecto => {
        try {
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                 headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${token}`
                 }
            }
 
            const { data } = await clienteAxios.post("/proyectos", proyecto, config)
            //Para evitar otra consulta a la BD y así aparezca el proyecto agregado al instante en pagina de proyectos
            setProyectos([...proyectos,data])
 
            setAlerta({
             msg: "Proyecto Creado Correctamente",
             error: false
            })
 
            setTimeout(() => {
             setAlerta({})
             navigate("/proyectos")
            }, 3000);
         } catch (error) {
            console.log(error) 
         }
    }

    const obtenerProyecto = async id => {
        setCargando(true)
        try {
            // Verificar Autenticación
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                 headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${token}`
                 }
            }
            
            const { data } = await clienteAxios(`/proyectos/${id}`, config)
            setProyecto(data)
            setAlerta({})
        } catch (error) {
            navigate("/proyectos")
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
            setTimeout(() => {
                setAlerta({})
            }, 3000);
        } finally {
            setCargando(false)
        }
    } 
    
    const eliminarProyecto = async id => {
        try {
            // Verificar Autenticación
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                 headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${token}`
                 }
            }

            const { data } = await clienteAxios.delete(`/proyectos/${id}`, config)

            //Sincronizar el estate
            const proyectosActualizados = proyectos.filter( proyectoState => proyectoState._id !== id)
            setProyectos(proyectosActualizados)

            setAlerta({
                msg: data.msg,
                error: true
            })

            setTimeout(() => {
                setAlerta({})
                navigate("/proyectos")
            }, 2000);
        } catch (error) {
            console.log(error)
        }
    }

    const handleModalTarea = () => {
        setModalFormularioTarea(!modalFormularioTarea)
        setTarea({})
    }

    const submitTarea = async tarea => {

        if(tarea?.id){
            await editarTarea(tarea)
        } else {
            await crearTarea(tarea)
        }
        
    }
    const crearTarea = async tarea => {
        try {
            // Verificar Autenticación
            const token = localStorage.getItem("token")
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post("/tareas", tarea, config)

            //Agrega la tarea al State (Inicialmente aquí, pero al implementar SOCKET.io, dejaremos que se maneje ahí)
            // const proyectoActualizado = {...proyecto}
            // proyectoActualizado.tareas = [...proyecto.tareas, data]
            // setProyecto(proyectoActualizado)
            setAlerta({})
            setModalFormularioTarea(false)

            //SOCKET IO (Cuando se cree un a tarea, emite evento y le pasa al backend la data del cliente axios)
            socket.emit("nueva tarea", data) 
        } catch (error) {
            console.log(error)
        }
    }
    const editarTarea = async tarea => {
        try {
            // Verificar Autenticación
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }   
            
            const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config)

            // Sincronizando el State (Pasado a SOCKET.IO)
            // const proyectoActualizado = {...proyecto}
            // proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState => tareaState._id === data._id ? data : tareaState)
            // setProyecto(proyectoActualizado)
            
            setAlerta({})
            setModalFormularioTarea(false)

            //SOCKET IO
            socket.emit("actualizar tarea", data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleModalEditarTarea = tarea => {
        setTarea(tarea)
        setModalFormularioTarea(!modalFormularioTarea)
    }

    const handleModalEliminarTarea = tarea => {
        setTarea(tarea)
        setModalEliminarTarea(!modalEliminarTarea)
    }

    const eliminarTarea =  async () => {
        
        try {
            // Verificar Autenticación
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }   
            
            const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, config)
            setAlerta({
                msg: data.msg,
                error: false
            })
             //Sincronizando el State (Pasado a socket io)
            //  const proyectoActualizado = {...proyecto}
            //  proyectoActualizado.tareas = proyectoActualizado.tareas.filter( tareaState => tareaState._id !== tarea._id)
            //  setProyecto(proyectoActualizado)
             setModalEliminarTarea(false)
             
             //SOCKET
             socket.emit("eliminar tarea", tarea)

             setTarea({})
             setTimeout(() => {
                setAlerta({})
             }, 2000);
        } catch (error) {
            console.log(error)
        }
    }

    const submitColaborador = async email => {

        setCargando(true)
        try {
            // Verificar Autenticación
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }   

            const { data } = await clienteAxios.post('/proyectos/colaboradores',{email}, config)
            setColaborador(data)
            setAlerta({})
        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
            setTimeout(() => {
                setAlerta({})
            }, 3000);
        } finally {
            setCargando(false)
        }
    }

    const agregarColaborador = async email => {
        try {
            // Verificar Autenticación
            const token = localStorage.getItem("token")
            if(!token) return
            
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }   
            const { data } = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`,email, config)
            setAlerta({
                msg: data.msg,
                error: false
            })
            setTimeout(() => {
                setAlerta({})
            }, 3000);
            setColaborador({})

        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
            setTimeout(() => {
                setAlerta({})
            }, 3000);
        }
    }

    const handleModalEliminarColaborador = (colaborador) => {
        setModalEliminarColaborador(!modalEliminarColaborador)

        setColaborador(colaborador)
    }

    const eliminarColaborador = async () => {
        try {
          // Verificar Autenticación
          const token = localStorage.getItem("token")
          if(!token) return
          
          const config = {
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
              }
          }
          const { data } = await clienteAxios.post(`/proyectos/eliminar-colaborador/${proyecto._id}`, {id: colaborador._id}, config)

          const proyectoActualizado =  {...proyecto}

          proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter( colaboradorState => colaboradorState._id !== colaborador._id)

          setProyecto(proyectoActualizado)

          setAlerta({
             msg: data.msg,
             error: false
          })
          setColaborador({})
          setModalEliminarColaborador(false)
          setTimeout(() => {
            setAlerta({})
          }, 3000);
        } catch (error) {
            console.log(error.response)
        }
    }

    const completarTarea = async id => {
        try {
          // Verificar Autenticación
          const token = localStorage.getItem("token")
          if(!token) return
          
          const config = {
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
              }
          }  
          const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, config)
          //Sincronizar el State (PASADO A SOCKET.IO)
        //   const proyectoActualizado = {...proyecto}
        //   proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState => tareaState._id === data._id ? data : tareaState)
        //   setProyecto(proyectoActualizado)
          setTarea({})
          setAlerta({})

          // SOCKET.IO
          socket.emit("cambiar estado", data)

        } catch (error) {
            console.log(error.response)
        }
    }

    const handleBuscador = () => {
        setBuscador(!buscador)
    }

    // Socket io
    const submitTareasProyecto = (tareaNueva) => {
        // Agrega la tarea al State
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = [...proyectoActualizado.tareas, tareaNueva]
        setProyecto(proyectoActualizado)
    }

    const eliminarTareaProyecto = tarea => {
         const proyectoActualizado = {...proyecto}
         proyectoActualizado.tareas = proyectoActualizado.tareas.filter( tareaState => tareaState._id !== tarea._id)
         setProyecto(proyectoActualizado)
    }

    const actualizarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState => tareaState._id === tarea._id ? tarea : tareaState)
        setProyecto(proyectoActualizado)
    }

    const actualizarEstadoTarea = tarea => {
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState => tareaState._id === tarea._id ? tarea : tareaState)
        setProyecto(proyectoActualizado)
    }

    const cerrarSesionProyectos = () =>{
        setProyectos([])
        setProyecto({})
        setAlerta({})
    }
    return(
        <ProyectosContext.Provider
            value={{
                proyectos,
                mostrarAlerta,
                alerta,
                submitProyecto,
                obtenerProyecto,
                proyecto,
                cargando,
                eliminarProyecto,
                handleModalTarea,
                modalFormularioTarea,
                submitTarea,
                handleModalEditarTarea,
                tarea,
                modalEliminarTarea,
                handleModalEliminarTarea,
                eliminarTarea,
                submitColaborador,
                colaborador,
                agregarColaborador,
                handleModalEliminarColaborador,
                modalEliminarColaborador,
                eliminarColaborador,
                completarTarea,
                buscador,
                handleBuscador,
                submitTareasProyecto,
                eliminarTareaProyecto,
                actualizarTareaProyecto,
                actualizarEstadoTarea,
                cerrarSesionProyectos
            }}
        >
            {children}
        </ProyectosContext.Provider>
    )
}

export {
    ProyectosProvider
}

export default ProyectosContext