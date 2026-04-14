export const API_BASE_URL = 'http://localhost:5000/api';

export const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const createExpense = async (expenseData) => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers,
            body: JSON.stringify(expenseData)
        });
        return await response.json();
    } catch (e) {
        console.error("API Connection Error:", e);
        return { success: false, error: e.message };
    }
};
