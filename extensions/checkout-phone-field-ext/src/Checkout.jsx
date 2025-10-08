import React, { useState, useEffect } from 'react';
import {
  reactExtension,
  useBuyerJourneyIntercept,
  useApi,
  TextField,
  BlockStack,
} from '@shopify/ui-extensions-react/checkout';

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

  // 2. Асинхронная запись данных в поле адреса доставки
  useEffect(() => {
    const phoneValueToSave = phoneNumber; 
    
    // applyShippingAddressChange — это актуальный и правильный метод для обновления данных
    applyShippingAddressChange({
      type: 'updateShippingAddress',
      address: {
        phone: phoneValueToSave 
      }
    });
  }, [phoneNumber, applyShippingAddressChange]);

  return (
    <BlockStack spacing="loose" padding={['base', 'none']}>
      <TextField
        label="Phone number"
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