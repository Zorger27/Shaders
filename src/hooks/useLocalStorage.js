import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Хук для синхронизации состояния React с localStorage.
 * Поддерживает:
 *  - сохранение и загрузку данных из localStorage;
 *  - сброс (reset) к значению по умолчанию;
 *  - синхронизацию состояния между вкладками браузера.
 *
 * @param {string} key - ключ для localStorage
 * @param {*} defaultValue - значение по умолчанию, если данных нет
 * @param {function} [parser] - функция парсинга сохранённой строки (по умолчанию возвращает как есть)
 * @returns {[any, Function, Function]} [state, setState, reset]
 */

export function useLocalStorage(key, defaultValue, parser = v => v) {
  // Флаг, чтобы пропустить одну запись в localStorage (используется после reset)
  const skipNextWriteRef = useRef(false);

  // Инициализация состояния из localStorage или дефолта
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? parser(saved) : defaultValue;
    } catch {
      // Если localStorage недоступен (например, в приватном режиме)
      return defaultValue;
    }
  });

  /**
   * При каждом изменении state — сохраняем его в localStorage.
   * Но если skipNextWriteRef активен (например, после reset),
   * пропускаем одну запись, чтобы не перезаписать localStorage дефолтным значением.
   */
  useEffect(() => {
    try {
      if (skipNextWriteRef.current) {
        skipNextWriteRef.current = false; // сбрасываем флаг
        return;
      }
      localStorage.setItem(key, String(state));
    } catch {
      // Игнорируем ошибки (например, превышен лимит хранилища)
    }
  }, [key, state]);

  /**
   * Синхронизация между вкладками:
   * Если в другой вкладке изменился этот ключ в localStorage,
   * обновляем локальное состояние, чтобы отразить эти изменения.
   */
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) {
        if (e.newValue === null) {
          // Ключ удалён — возвращаемся к дефолту
          setState(defaultValue);
        } else {
          // Обновляем значение, пропуская через парсер
          setState(parser(e.newValue));
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, parser, defaultValue]);

  /**
   * Сбрасывает значение в дефолт и удаляет ключ из localStorage.
   * При этом следующее обновление эффекта записи будет пропущено,
   * чтобы дефолтное значение не вернулось обратно в localStorage.
   */
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Игнорируем возможные ошибки (например, недоступен localStorage)
    }

    skipNextWriteRef.current = true; // пропустить следующее сохранение
    setState(defaultValue); // вернуть состояние к исходному
  }, [key, defaultValue]);

  // Возвращаем текущее значение, сеттер и функцию сброса
  return [state, setState, reset];
}