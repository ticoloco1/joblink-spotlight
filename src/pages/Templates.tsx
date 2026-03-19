import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Templates = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);
  return null;
};

export default Templates;
