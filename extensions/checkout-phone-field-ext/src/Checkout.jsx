import React, { useState, useEffect, useRef } from 'react';
import {
  reactExtension,
  useBuyerJourneyIntercept,
  useApi,
  TextField,
  BlockStack,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.delivery-address.render-before', 
  () => <CustomPhoneField />
);

function CustomPhoneField() {
  const { applyShippingAddressChange, shippingAddress } = useApi(); 

  // Инициализация значения из состояния API. 
  // Мы используем shippingAddress напрямую из useApi, чтобы избежать деприкации хука useShippingAddress.
  const initialPhone = shippingAddress?.current?.phone || '';
  
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.replace(/\D/g, '').slice(0, 10));
  const [error, setError] = useState('');
  const isFirstApplyRef = useRef(true);

  const isValidPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 && digits.startsWith('05');
  };

  // 1. Клиентская валидация и Блокировка (useBuyerJourneyIntercept)
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    let currentError = '';

    if (phoneDigits.length !== 10) {
      currentError = 'מספר הטלפון חייב להכיל בדיוק 10 ספרות.';
    } else if (!phoneDigits.startsWith('05')) {
      currentError = "מספר הטלפון חייב להתחיל ב-'05'.";
    }

    setError(currentError);

    if (canBlockProgress && currentError) {
      return {
        behavior: 'block',
        reason: 'יש לתקן את פורמט מספר הטלפון.',
        perform: () => {},
      };
    }
    return { behavior: 'allow' };
  });

  // Моментальная клиентская валидация при изменении phoneNumber
  useEffect(() => {
    const digits = phoneNumber.replace(/\D/g, '');
    let currentError = '';

    if (digits.length !== 0 && digits.length !== 10) {
      currentError = 'מספר הטלפון חייב להכיל בדיוק 10 ספרות.'; // либо пустое, если хотите показывать только после blur
    } else if (digits.length === 10 && !digits.startsWith('05')) {
      currentError = "מספר הטלפון חייב להתחיל ב-'05'.";
    }

    setError(currentError);
  }, [phoneNumber]);

  // 2. Асинхронная запись данных в поле адреса доставки
  useEffect(() => {
    const phoneValueToSave = phoneNumber;
    const phoneDigits = phoneValueToSave.replace(/\D/g, '');

    // Пропускаем первый рендер (чтобы не писать сразу при монтировании)
    if (isFirstApplyRef.current) {
      isFirstApplyRef.current = false;
      return;
    }
    
    // Отправляем в API только когда номер валиден по правилам (startsWith '05' и 10 цифр) или очищен
    if (phoneDigits.length === 0 || isValidPhone(phoneValueToSave)) {
      applyShippingAddressChange({
        type: 'updateShippingAddress',
        address: {
          phone: phoneValueToSave,
        },
      });
    }
  }, [phoneNumber, applyShippingAddressChange]);

  return (
    <BlockStack spacing="loose" padding={['base', 'none']}>
      <TextField
        label="מספר טלפון"
        value={phoneNumber}
        onChange={(value) => {
          const digits = value.replace(/\D/g, '');
          setPhoneNumber(digits.slice(0, 10))
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
        error={error}
        type="tel" 
        maxLength={10}
        required
      />
    </BlockStack>
  );
}
