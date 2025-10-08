import React, { useState, useEffect } from 'react';
import {
  reactExtension,
  useBuyerJourneyIntercept,
  useApi,
  TextField,
  BlockStack,
  Banner,
} from '@shopify/ui-extensions-react/checkout';

// *** ТОЧКА РАСШИРЕНИЯ (Target) ***
export default reactExtension(
  'purchase.checkout.delivery-address.render-after', 
  () => <CustomPhoneField />
);

function CustomPhoneField() {
  const { applyShippingAddressChange, shippingAddress } = useApi(); 

  //. Инициализация значения из состояния API. 
  // Мы используем shippingAddress напрямую из useApi, чтобы избежать деприкации хука useShippingAddress.
  const initialPhone = shippingAddress?.current?.phone || '';
  
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.replace(/\D/g, '').slice(0, 10));
  const [error, setError] = useState('');

  // 1. Клиентская валидация и Блокировка (useBuyerJourneyIntercept)
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    let currentError = '';

    if (phoneDigits.length !== 10) {
      currentError = 'Номер телефона должен содержать ровно 10 цифр.';
    } else if (!phoneDigits.startsWith('05')) {
      currentError = "Номер телефона должен начинаться с '05'.";
    }

    setError(currentError);

    if (canBlockProgress && currentError) {
      return {
        behavior: 'block',
        reason: 'Требуется исправить формат телефонного номера.',
        perform: () => {},
      };
    }
    return { behavior: 'allow' };
  });

  // 2. Асинхронная запись данных в поле адреса доставки
  useEffect(() => {
    const phoneValueToSave = phoneNumber; 
    
    // applyShippingAddressChange — это актуальный и правильный метод для обновления данных
    applyShippingAddressChange({
      type: 'updateShippingAddress',
      address: {
        // Записываем наш 10-значный номер в поле phone
        phone: phoneValueToSave 
      }
    });
  }, [phoneNumber, applyShippingAddressChange]);

  // 3. Рендеринг кастомного поля
  return (
    <BlockStack spacing="loose" padding={['base', 'none']}>
      <Banner status="info">
        Введите 10-значный номер телефона, начиная с 05. Код страны не требуется.
      </Banner>
      
      {/* Используем TextField для отключения UI кодов стран */}
      <TextField
        label="Номер телефона"
        value={phoneNumber}
        onChange={(value) => {
          const digits = value.replace(/\D/g, '');
          setPhoneNumber(digits.slice(0, 10)); 
          setError('');
        }}
        error={error}
        type="tel" 
        maxLength={10} 
        required
      />
    </BlockStack>
  );
}





// import React, { useState, useEffect } from 'react';
// import {
//   reactExtension,
//   Banner,
//   BlockStack,
//   useBuyerJourneyIntercept,
//   useShippingAddress,
//   TextField,
//   Text,
//   useApi,
//   Checkbox,
//   useApplyAttributeChange,
//   useInstructions,
//   useTranslate,
// } from "@shopify/ui-extensions-react/checkout";

// // 1. Choose an extension target
// export default reactExtension(
//   'purchase.checkout.delivery-address.render-after',
//   () => <Extension />,
// );

// function Extension() {
//   const applyAttributeChange =
//     useApplyAttributeChange();
//   const instructions = useInstructions();

//   // 2. Render a UI
//   return (
//     <Checkbox onChange={onCheckboxChange}>
//       I would like to receive a free gift with my
//       order
//     </Checkbox>
//   );

//   async function onCheckboxChange(isChecked) {
//     // 3. Check if the API is available
//     if (
//       !instructions.attributes.canUpdateAttributes
//     ) {
//       console.error(
//         'Attributes cannot be updated in this checkout',
//       );
//       return;
//     }
//     // 4. Call the API to modify checkout
//     const result = await applyAttributeChange({
//       key: 'requestedFreeGift',
//       type: 'updateAttribute',
//       value: isChecked ? 'yes' : 'no',
//     });
//     console.log(
//       'applyAttributeChange result',
//       result,
//     );
//   }
// }