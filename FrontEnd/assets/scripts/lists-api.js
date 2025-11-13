export const isLoggedIn = () => localStorage.getItem('token') !== null;

export const getLists = async () => [];

export const createList = async (name, type) => ({ _id: "mock_id", name, type, items: [] });
export const addToList = async (listId, item) => ({ success: true });
export const removeFromList = async (listId, taxonId) => ({ success: true });
export const getListById = async (listId) => ({ _id: listId, name: 'Mock List', items: [] });