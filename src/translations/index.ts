export default {
  es: {
    mensajes: {
      crud: {
        crear: {
          titulo: 'Crear {entidad}',
          mensaje: '¿Está seguro que desea crear {entidad}?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        agregar: {
          titulo: 'Agregar {entidad}',
          mensaje: '¿Está seguro que desea agregar {entidad}?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        editar: {
          titulo: 'Editar {entidad}: {nombreEntidad}',
          tituloSinNombre: 'Editar {entidad}',
          mensaje: '¿Está seguro que desea guardar los cambios realizados?',
          btnAceptar: 'Guardar cambios',
          btnCancelar: 'Continuar editando',
        },
        eliminar: {
          titulo: 'Eliminar {entidad}: {nombreEntidad}',
          mensaje: '¿Está seguro que desea eliminar {entidad}?',
          btnAceptar: 'Eliminar',
          btnCancelar: 'Cancelar',
        },
        eliminarAsociado: {
          titulo: 'Eliminar {entidad}: {nombreEntidad}',
          mensaje:
            'Se eliminarán todas las asociaciones relacionadas {entidad}. ¿Está seguro que desea eliminar {entidad1}?',
          btnAceptar: 'Eliminar',
          btnCancelar: 'Cancelar',
        },
        eliminarAsociadoPerfilTransversal: {
          titulo: 'Eliminar {entidad}: {nombreEntidad}',
          mensaje:
            'Se eliminarán todas las asociaciones relacionadas al {entidad}. ¿Está seguro que desea eliminar el {entidad}?',
          btnAceptar: 'Eliminar',
          btnCancelar: 'Cancelar',
        },
        eliminarAsociadoUsuarioTransversal: {
          titulo: 'Eliminar {entidad1}: {nombreEntidad}',
          mensaje:
            'Se eliminarán todas las asociaciones relacionadas {entidad1}. ¿Está seguro que desea eliminar {entidad2}?',
          btnAceptar: 'Eliminar',
          btnCancelar: 'Cancelar',
        },
        eliminarMasivo: {
          titulo: 'Eliminar {entidad}',
          mensaje:
            '¿Está seguro que desea eliminar {los_cantidad_entidad_seleccionados}?',
          mensajeUsuariosLocales:
            'Se eliminarán todas las asociaciones relacionadas a los Usuarios. ¿Está seguro que desea eliminar los Usuarios?',
          btnAceptar: 'Eliminar',
          btnCancelar: 'Cancelar',
        },
        eliminarMasivoAsociado: {
          titulo: 'Eliminar {entidad}',
          mensaje:
            'Se eliminarán todas las asociaciones relacionadas. ¿Está seguro que desea eliminar {los_cantidad_entidad_seleccionados}?', //Ej. ¿Está seguro que desea eliminar los X Vehículo seleccionados
          btnAceptar: 'Eliminar',
          btnCancelar: 'Cancelar',
        },
        compartirInformacion: {
          titulo: 'Compartir Información',
          mensaje:
            '¿Está seguro que desea compartir información con el Cliente: {nombre_cliente}?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        dejarCompartirInformacion: {
          titulo: 'Dejar de compartir',
          mensaje:
            '¿Está seguro que desea dejar de compartir información con el Cliente: {nombre_cliente}?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        aceptarInformacion: {
          titulo: 'Aceptar Información',
          mensaje: '¿Está seguro que desea aceptar {Tipo}?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        rechazarInformacion: {
          titulo: 'Rechazar Información',
          mensaje: '¿Está seguro que desea rechazar la información compartida?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        dejarRecibirInformacion: {
          titulo: 'Dejar de recibir información',
          mensaje: '¿Está seguro que desea dejar de recibir información?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        sinAsociacion: {
          titulo: 'Asociar {entidad}',
          mensaje:
            'No existen {entidad} que se puedan asociar al {entidadAsociada}',
          btnAceptar: 'Aceptar',
          btnCancelar: 'Cancelar',
        },
        sinSeleccion: {
          titulo: 'Seleccionar {entidad}',
          mensaje: 'Debe seleccionar {entidad}',
          btnAceptar: 'Aceptar',
          btnCancelar: 'Cancelar',
        },
        inactivo: {
          titulo: 'Cambio de estado',
          mensaje:
            'Al dejar como inactivo, no se podrán realizar asociaciones.',
          btnAceptar: 'Aceptar',
          btnCancelar: 'Cancelar',
        },
        inactivoAsociado: {
          titulo: 'Cambio de estado',
          mensaje: 'Al dejar como inactivo, terminarán todas las asociaciones.',
          btnAceptar: 'Aceptar',
          btnCancelar: 'Cancelar',
        },
        desbloquear: {
          titulo: 'Desbloquear {entidad}: {nombreEntidad}',
          mensaje: '¿Está seguro que desea desbloquear {entidad}?',
          btnAceptar: 'Desbloquear',
          btnCancelar: 'Cancelar',
        },
        bloquear: {
          titulo: 'Bloquear {entidad}: {nombreEntidad}',
          mensaje: '¿Está seguro que desea bloquear {entidad}?',
          btnAceptar: 'Bloquear',
          btnCancelar: 'Cancelar',
        },
        cancelar: {
          titulo: 'Cancelar Importación de {entidad}',
          mensaje: '¿Está seguro que desea cancelar la importación?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        importar: {
          titulo: 'Importar {entidad}',
          mensaje: '¿Está seguro que desea importar el archivo?',
          btnAceptar: 'Si',
          btnCancelar: 'No',
        },
        cambioCliente: {
          titulo: 'Búsqueda Vehículo: {unidad}',
          mensaje:
            'El Vehículo {unidad} se encuentra en el Cliente {cliente}. ¿Desea cambiar de Cliente para visualizar el Vehículo?',
          btnAceptar: 'Aceptar',
          btnCancelar: 'Cancelar',
        },
        cambiarPassword: {
          titulo: 'Reestablecer Contraseña de Usuario',
          mensaje:
            'Haga click en el botón "Copiar Enlace" para obtener el link de reestablecimiento de contraseña',
        },
      },
      mensajesExito: {
        crear: '{entidad} ha sido {creadoA} de forma exitosa',
        editar: 'Los cambios han sido guardados de forma exitosa',
        eliminar: '{entidad} {nombre} ha sido {eliminadaO} de forma exitosa',
        eliminarMasivo:
          '{los_cantidad_entidad_seleccionados} han sido {eliminadaOs} de forma exitosa', //Ej. Los X Vehículos seleccionados han sido eliminados
        cambiarEstado: 'Los cambios han sido guardados de forma exitosa',
        importar: 'La importación ha sido finalizada con éxito',
        exportar: 'La exportación ha sido finalizada con éxito.',
        descargar: 'La descarga ha sido finalizada con éxito.',
        compartir:
          'Se compartió información con el Cliente: {nombre_cliente} de forma exitosa',
        dejarCompartir:
          'Se deja de compartir información con el Cliente {nombre_cliente} de forma exitosa',
        aceptarInformacion: 'Se aceptó Información de forma exitosa',
        rechazarInformacion: 'Se rechazó información de forma exitosa',
        dejarRecibirInformacion:
          'Se deja de recibir información de forma exitosa',
        desbloquear: '{entidad} ha sido desbloqueado de forma exitosa',
        bloquear: '{entidad} ha sido bloqueado de forma exitosa',
        cancelar: '{entidad} ha sido cancelada de forma exitosa',
        copiarEnlace: 'Enlace copiado correctamente al portapapeles',
      },
      mensajesError: {
        consulta: 'Ha ocurrido un problema al intentar obtener {entidad}.',
        crear: 'Ha ocurrido un problema al intentar crear {entidad}.',
        editar: 'Ha ocurrido un problema al intentar guardar los cambios',
        eliminar:
          'Ha ocurrido un problema al intentar eliminar {entidad} {nombre}.',
        eliminarMasivo:
          'Ha ocurrido un problema al intentar eliminar {los_cantidad_entidad_seleccionados}', //ej. Ha ocurrido un problema al intentar eliminar las X Flota seleccionadas.”
        mensajeComplementarioError:
          'Por favor, verifique que su conexión a internet esté funcionando de forma correcta y vuelva a intentarlo.',
        cargaGeocercasVehiculo:
          'No se ha podido realizar la carga de las Geocercas al Vehículo. Favor revisar los casos con Atención.',
        concurrenciaGeocercasVehiculo:
          'Las Geocercas del Vehículo fueron modificadas por otro usuario, al presionar "Aceptar" éstas no se asignarán al Vehículo. Favor vuelva a editar las Geocercas para este Vehículo.',
        cargaGeocercasZonaCrear:
          'No se ha podido realizar la carga de la Geocerca a los Vehículos asociados. Por favor revisar los casos con Atención.',
        cargaGeocercasZonaEditar:
          'No se ha podido realizar la carga de la Geocerca a los nuevos Vehículos asociados. Por favor revisar los casos con Atención.',
        concurrenciaGeocercasZona:
          'Algunos Vehículos fueron modificados por otro usuario, al presionar "Aceptar" no se le asignarán los nuevos Vehículos a la Geocerca. Favor vuelva a editar la Geocerca.',
        desbloquear:
          'Ha ocurrido un error al intentar desbloquear {entidad} {nombre}.',
        bloquear:
          'Ha ocurrido un error al intentar bloquear {entidad} {nombre}.',
        copiarEnlace: 'Hubo un error al copiar el enlace',
      },
      mensajesAbandono: {
        crear: {
          titulo: 'Confirmación',
          mensaje:
            'Al cerrar esta ventana toda la información ingresada se perderá. ¿Está seguro que desea cerrar sin guardar?',
          btnAceptar: 'No guardar',
          btnCancelar: 'Continuar creando',
        },
        editar: {
          titulo: 'Confirmación',
          mensaje:
            'Al cerrar esta ventana toda la información editada se perderá. ¿Está seguro que desea cerrar sin guardar?',
          btnAceptar: 'No guardar',
          btnCancelar: 'Continuar editando',
        },
      },
      gridMensajes: {
        cambiarEstado: {
          titulo: 'Cambiar Estado',
          mensaje:
            '¿Está seguro que desea guardar los cambios realizados a {las_cantidad_entidad_seleccionadas}?', //Ej. ¿Está seguro que desea guardar los cambios realizados a las X Flotas seleccionadas?”
          btnAceptar: 'Guardar cambios',
          btnCancelar: 'Cancelar',
        },
        asociar: {
          titulo: 'Asociar {entidad}',
          mensaje:
            '¿Está seguro que desea guardar los cambios realizados a{las_cantidad_entidad_seleccionadas}', //Ej. ¿Está seguro que desea guardar los cambios realizados a las X Flotas seleccionadas?”
          btnAceptar: 'Guardar cambios',
          btnCancelar: 'Cancelar',
        },
        agregarEtiqueta: {
          titulo: 'Agregar Etiqueta',
          mensaje:
            '¿Está seguro que desea guardar los cambios realizados a {las_cantidad_entidad_seleccionadas}', //Ej. ¿Está seguro que desea guardar los cambios realizados a las X Flotas seleccionadas?”
          btnAceptar: 'Guardar cambios',
          btnCancelar: 'Cancelar',
        },
        importar: {
          titulo: 'Importar',
          mensaje:
            '¿Está seguro que desea importar la información del archivo seleccionado?',
          btnAceptar: 'Aceptar',
          btnCancelar: 'Cancelar',
        },
        exportar: {
          titulo: 'Exportar',
          mensaje: '¿Está seguro que desea exportar las filas seleccionadas?',
          btnAceptar: 'Aceptar',
          btnCancelar: 'Cancelar',
        },
      },
      mensajesAsociacionesExito: {
        editar: 'La asociación ha sido realizada con éxito',
        editarMasivo: 'Las asociaciones han sido realizadas con éxito',
      },
      mensajesAsociacionesError: {
        editar: 'Ha ocurrido un problema al intentar realizar la asociación',
        existe: 'Ya existe un grupo de conductores con ese nombre',
      },
      mensajeCambioEstadoConductor: {
        titulo: 'Cambio de estado',
        mensaje:
          'Al dejar como inactivo {entidad}, no se podrán realizar asociaciones a este. ¿Desea continuar?',
        btnAceptar: 'Si',
        btnCancelar: 'No',
      },
      mensajesInformes: {
        titulo: 'Confirmación',
        mensaje:
          'Al cerrar esta ventana toda la información filtrada se perderá. ¿Está seguro que desea salir?',
        btnAceptar: 'ACEPTAR',
        btnCancelar: 'CONTINUAR GENERANDO',
        btnCancelarGeneracion: 'CANCELAR',
      },
    },
  },
  en: {},
};
