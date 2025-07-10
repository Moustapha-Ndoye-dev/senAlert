import { useState, useEffect } from 'react';
import { getDepartmentName } from '@/lib/utils';

export const useDepartment = () => {
  const [departmentName, setDepartmentName] = useState<string>("Dakar");
  const [loading, setLoading] = useState(true);

  const updateDepartmentName = () => {
    try {
      const locationData = localStorage.getItem('user_location');
      if (locationData) {
        const location = JSON.parse(locationData);
        const deptName = getDepartmentName(location.latitude, location.longitude);
        setDepartmentName(deptName);
      } else {
        setDepartmentName("Dakar");
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du département:', error);
      setDepartmentName("Dakar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateDepartmentName();
    
    // Mettre à jour le département toutes les 5 secondes
    const interval = setInterval(updateDepartmentName, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    departmentName,
    loading,
    updateDepartmentName
  };
}; 