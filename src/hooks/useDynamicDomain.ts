import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDynamicDomain = () => {
  const [domain, setDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        // Use window.location.origin as default domain
        setDomain(window.location.origin);
      } catch (error) {
        console.error('Error fetching domain:', error);
        // Fallback to current origin
        setDomain(window.location.origin);
      } finally {
        setLoading(false);
      }
    };

    fetchDomain();
  }, []);

  return { domain, loading };
};