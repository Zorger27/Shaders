import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Хук для очистки URL от параметров, добавленных Edge Function (для каждого компоненте страницы)
export const useSpaCleanup = () => {
  const location = useLocation(); // Получаем текущий URL и query-параметры в SPA

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isFromSPA = searchParams.get('spa') === 'true';

    // Если в URL есть ?spa=true (признак, что пришли из OG Edge Function)
    if (isFromSPA) {
      const url = new URL(window.location);
      // Убираем служебные параметры
      url.searchParams.delete('spa');
      url.searchParams.delete('lang');

      // Обновляем адресную строку без перезагрузки страницы
      window.history.replaceState({}, '', url.pathname + (url.search || ''));
    }
  }, [location.search]); // Срабатывает при каждом изменении query-параметров

  return null; // Хук не рендерит ничего
};
