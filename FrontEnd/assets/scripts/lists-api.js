// Mockup de Autenticación/Listas

export const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
};

// Funciones de Listas (Mock)
export const getLists = async () => {
    return []; // Devuelve array vacío para no bloquear
};

export const createList = async (name, type) => ({ _id: "mock_id", name, type, items: [] });
export const addToList = async (listId, item) => ({ success: true });
export const removeFromList = async (listId, taxonId) => ({ success: true });
export const getListById = async (listId) => ({ _id: listId, name: 'Mock List', items: [] });