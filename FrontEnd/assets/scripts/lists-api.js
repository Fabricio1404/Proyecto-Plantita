// frontend/assets/scripts/lists-api.js (Mockup de Autenticación/Listas)

// Base para la autenticación de la UI
export const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
};

// Funciones de Listas (deben existir para evitar errores, aunque el backend no esté completo)
export const getLists = async () => {
    // Si tienes el backend para listas funcionando, puedes llamar a tu API aquí.
    return []; // Devuelve array vacío para no bloquear
};

// El resto de las funciones de listas, solo deben existir para que el código compile
export const createList = async (name, type) => ({ _id: "mock_id", name, type, items: [] });
export const addToList = async (listId, item) => ({ success: true });
export const removeFromList = async (listId, taxonId) => ({ success: true });
export const getListById = async (listId) => ({ _id: listId, name: 'Mock List', items: [] });