import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MENU_DATA as FALLBACK_MENU, BUSINESS_NAME as FALLBACK_NAME } from '../data/menu';

export function useMenu() {
  const [menuData, setMenuData] = useState(null);
  const [businessName, setBusinessName] = useState(FALLBACK_NAME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get('/api/menu');
        if (response.success && response.menu) {
          setMenuData(response.menu);
          if (response.business?.name) {
            setBusinessName(response.business.name);
          }
        } else {
          setMenuData(FALLBACK_MENU);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err.message);
        setMenuData(FALLBACK_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  return { menuData, businessName, loading, error };
}
